'use client';

import { useState, useEffect, useRef } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import axios from "axios";
import styles from "./checkout.module.css";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CartSummary from "./CartSummary";
import CheckoutForm from "./CheckoutForm";
import { useNavbarHeight } from '../../hooks/useNavbarHeight';
import Link from "next/link";
import LoadingIndicator from "../../components/LoadingIndicator";
import type { CheckoutCartItem, ShippingAddress, BillingAddress, ShippingRate } from "../../lib/types";
import { buildHeaders } from "../../lib/api";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

interface FormData {
  customerName: string;
  customerEmail: string;
  shippingAddress: ShippingAddress;
  billingAddress: BillingAddress;
  billingSameAsShipping: boolean;
  discountCode: string;
}

export default function CheckoutPage() {
  const { isAuthenticated, token, guestSessionId } = useAuthContext();
  const [cartItems, setCartItems] = useState<CheckoutCartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [transactionFee] = useState<number>(0.50);
  
  // Shipping state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: '',
    street2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    phone: '',
  });
  const [isAddressValidated, setIsAddressValidated] = useState(false);
  const [selectedShippingRate, setSelectedShippingRate] = useState<ShippingRate | null>(null);
  const [shipmentId, setShipmentId] = useState<string | undefined>();
  
  const [formData, setFormData] = useState<FormData>({
    customerName: "",
    customerEmail: "",
    shippingAddress: {
      street: '',
      street2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
      phone: '',
    },
    billingAddress: { street: "", city: "", state: "", postal_code: "", country: "US" },
    billingSameAsShipping: true,
    discountCode: "",
  });
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [showEmailPopup, setShowEmailPopup] = useState<boolean>(false);
  
  const router = useRouter();
  const navbarHeight = useNavbarHeight();
  const checkoutFormRef = useRef<{ clearEmailError: () => void; setEmailError: (message: string) => void } | null>(null);

  // Fetch cart
  useEffect(() => {
    let mounted = true;

    const fetchCart = async () => {
      if (!mounted || isCheckingOut) return;
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) throw new Error("API URL not defined");

        const headers = buildHeaders(isAuthenticated, token, guestSessionId);
        let cartUrl = `${apiUrl}/api/carts?filters[status][$eq]=active`;
        if (!isAuthenticated && guestSessionId) {
          cartUrl += `&filters[guest_session][$eq]=${encodeURIComponent(guestSessionId)}`;
        }
        cartUrl += `&populate[cart_items][populate][product][populate]=thumbnail_image&populate[cart_items][populate][cart_item_parts][populate][product_part]=*&populate[cart_items][populate][cart_item_parts][populate][color]=*`;

        const response = await axios.get(cartUrl, { headers, withCredentials: true });
        const carts = response.data.data;
        if (carts && carts.length > 0 && carts[0]?.cart_items) {
          const cart = carts[0];
          setCartId(cart.id.toString());
          localStorage.setItem('cartId', cart.id.toString());

          const items: CheckoutCartItem[] = cart.cart_items.map((item: any) => ({
            id: item.id.toString(),
            productId: item.product.id,
            productName: item.product.name,
            price: parseFloat(item.effective_price || item.base_price),
            base_price: parseFloat(item.base_price),
            quantity: item.quantity,
            is_additional_part: item.is_additional_part || false,
            cart_item_parts: item.cart_item_parts?.map((cip: any) => ({
              id: cip.id,
              product_part: {
                id: cip.product_part?.id || 0,
                name: cip.product_part?.name || 'Unknown Part',
              },
              color: {
                id: cip.color?.id || 0,
                name: cip.color?.name || 'Unknown Color',
                hex_codes: cip.color?.hex_codes || [],
                type: cip.color?.type || 'standard',
              },
            })) || [],
            productOnSale: item.product.on_sale || false,
            thumbnailUrl: item.product.thumbnail_image?.url || '',
          }));
          setCartItems(items);
          calculateCosts(items, null);
        } else {
          setCartItems([]);
          calculateCosts([], null);
          setError("No active cart found. Please add items to your cart.");
        }
      } catch (err: unknown) {
        console.error("Fetch cart error:", axios.isAxiosError(err) ? err.response?.data : err);
        const message = err instanceof Error ? err.message : "Please try again later.";
        setError(`Unable to load cart: ${message}`);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCart();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, token, guestSessionId, isCheckingOut]);

  // Calculate costs when shipping rate changes
  useEffect(() => {
    calculateCosts(cartItems, selectedShippingRate);
  }, [selectedShippingRate, cartItems]);

  const calculateCosts = (items: CheckoutCartItem[], shippingRate: ShippingRate | null) => {
    if (items.length === 0) {
      setSubtotal(0);
      setShippingCost(0);
      setTax(0);
      setDiscount(0);
      setTotal(0);
      return;
    }

    const subtotalCents = items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0);
    const shippingCents = shippingRate ? shippingRate.rate_with_handling_cents : 0;
    const taxRate = 0.0825;
    const taxCents = Math.round(subtotalCents * taxRate);
    const transactionFeeCents = Math.round(transactionFee * 100);
    const discountCents = items.reduce((sum, item) => {
      const itemDiscount = (item.base_price - item.price) * item.quantity;
      return sum + Math.round(itemDiscount * 100);
    }, 0);
    const totalCents = subtotalCents + shippingCents + taxCents + transactionFeeCents;

    setSubtotal(subtotalCents / 100);
    setShippingCost(shippingCents / 100);
    setTax(taxCents / 100);
    setDiscount(discountCents / 100);
    setTotal(totalCents / 100);
  };

  const handleShippingAddressChange = (address: ShippingAddress) => {
    setShippingAddress(address);
    setFormData(prev => ({
      ...prev,
      shippingAddress: address,
      billingAddress: prev.billingSameAsShipping ? {
        street: address.street,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country,
      } : prev.billingAddress,
    }));
  };

  const handleAddressValidated = (isValid: boolean, easypostId?: string) => {
    setIsAddressValidated(isValid);
    if (!isValid) {
      setSelectedShippingRate(null);
      setShippingCost(0);
    }
  };

  const handleRateSelected = (rate: ShippingRate | null, newShipmentId?: string) => {
    setSelectedShippingRate(rate);
    if (newShipmentId) {
      setShipmentId(newShipmentId);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      setShowRemoveConfirm(itemId);
      return;
    }
    if (newQuantity > 99) {
      setError('Maximum quantity per item is 99.');
      return;
    }

    const updatedItems = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    calculateCosts(updatedItems, selectedShippingRate);

    // Reset shipping rate when cart changes
    setSelectedShippingRate(null);
    setIsAddressValidated(false);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const headers = buildHeaders(isAuthenticated, token, guestSessionId);
      await axios.put(
        `${apiUrl}/api/cart-items/${itemId}`,
        { data: { quantity: newQuantity } },
        { headers, withCredentials: true }
      );
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error('Update quantity error:', err);
      setError('Failed to update quantity. Please try again.');
    }
  };

  const removeItem = async () => {
    if (!showRemoveConfirm) return;

    const updatedItems = cartItems.filter((item) => item.id !== showRemoveConfirm);
    setCartItems(updatedItems);
    calculateCosts(updatedItems, selectedShippingRate);
    setShowRemoveConfirm(null);

    // Reset shipping rate when cart changes
    setSelectedShippingRate(null);
    setIsAddressValidated(false);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const headers = buildHeaders(isAuthenticated, token, guestSessionId);
      await axios.delete(`${apiUrl}/api/cart-items/${showRemoveConfirm}`, {
        headers,
        withCredentials: true,
      });
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error('Remove item error:', err);
      setError('Failed to remove item. Please try again.');
    }
  };

  const confirmRemoveItem = (itemId: string) => setShowRemoveConfirm(itemId);

  const onEmailRegistered = () => {
    setShowEmailPopup(true);
  };

  const handleLoginRedirect = () => {
    setShowEmailPopup(false);
    router.push("/login");
  };

  const handleUseDifferentEmail = () => {
    setShowEmailPopup(false);
    setFormData((prev) => ({ ...prev, customerEmail: "" }));
    if (checkoutFormRef.current) {
      checkoutFormRef.current.setEmailError("Please use a different email address.");
    }
  };

  const getItemDisplayName = (item: CheckoutCartItem | undefined): string => {
    if (!item) return 'item';
    if (item.is_additional_part && item.cart_item_parts.length === 1) {
      return `${item.productName} - Additional ${item.cart_item_parts[0].product_part.name}`;
    }
    return item.productName;
  };

  if (loading) return <LoadingIndicator />;

  return (
    <Elements stripe={stripePromise}>
      <div className={styles.checkoutPage}>
        <div className={styles.header}>
          <Image src="/icons/Shopping_Cart_Icon.png" alt="Cart" width={32} height={32} />
          <h1>Checkout</h1>
        </div>
        {cartItems.length > 0 && (
          <div className={styles.disclaimer}>
            <p className={styles.disclaimerText}>Disclaimer: Currently, we only ship within the continental United States.</p>
          </div>
        )}
        {error && cartItems.length === 0 ? (
          <div className={styles.emptyCartMessage}>
            <p>Uh Oh! Looks like your cart is empty.</p>
            <p>Check out more of our products on the <Link href="/store">store page</Link>.</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className={styles.emptyCartMessage}>
            <p>Uh Oh! Looks like your cart is empty.</p>
            <p>Check out more of our products on the <Link href="/store">store page</Link>.</p>
          </div>
        ) : (
          <div className={styles.columns}>
            <div className={styles.leftColumn}>
              <CartSummary
                cartItems={cartItems}
                subtotal={subtotal}
                shippingCost={shippingCost}
                tax={tax}
                discount={discount}
                transactionFee={transactionFee}
                total={total}
                updateQuantity={updateQuantity}
                confirmRemoveItem={confirmRemoveItem}
              />
            </div>
            <div className={styles.rightColumn}>
              <CheckoutForm
                ref={checkoutFormRef}
                formData={formData}
                setFormData={setFormData}
                cartItems={cartItems}
                cartId={cartId}
                total={total}
                subtotal={subtotal}
                shippingCost={shippingCost}
                tax={tax}
                discount={discount}
                transactionFee={transactionFee}
                isAuthenticated={isAuthenticated}
                user={null}
                styles={styles}
                router={router}
                setCartId={setCartId}
                setIsCheckingOut={setIsCheckingOut}
                onEmailRegistered={onEmailRegistered}
                shippingAddress={shippingAddress}
                onShippingAddressChange={handleShippingAddressChange}
                isAddressValidated={isAddressValidated}
                onAddressValidated={handleAddressValidated}
                selectedShippingRate={selectedShippingRate}
                onRateSelected={handleRateSelected}
                shipmentId={shipmentId}
              />
            </div>
          </div>
        )}
        {showRemoveConfirm && (
          <div className={styles.popupBackdrop}>
            <div className={styles.confirmDialog}>
              <p>
                Are you sure you want to remove{' '}
                {getItemDisplayName(cartItems.find((i) => i.id === showRemoveConfirm))}{' '}
                from your cart?
              </p>
              <button onClick={removeItem} className={styles.primaryButton}>
                Yes, Remove Item
              </button>
              <button onClick={() => setShowRemoveConfirm(null)} className={styles.secondaryButton}>
                No, Keep Item
              </button>
            </div>
          </div>
        )}
        {showEmailPopup && (
          <div className={styles.popupBackdrop}>
            <div className={styles.confirmDialog}>
              <p>
                The email "{formData.customerEmail}" is already registered. Would you like to log in?
              </p>
              <button onClick={handleLoginRedirect} className={styles.primaryButton}>
                Yes, Log In
              </button>
              <button onClick={handleUseDifferentEmail} className={styles.secondaryButton}>
                No, Use Different Email
              </button>
            </div>
          </div>
        )}
      </div>
    </Elements>
  );
}