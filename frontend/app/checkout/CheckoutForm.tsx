"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../../context/AuthContext";
import styles from "./checkout.module.css";
import { useTheme } from "next-themes";
import ShippingAddressForm from "./ShippingAddressForm";
import ShippingRateSelector from "./ShippingRateSelector";
import type { CheckoutCartItem, ShippingAddress, BillingAddress, ShippingRate } from "../../lib/types";
import { buildHeaders } from "../../lib/api";

interface FormData {
  customerName: string;
  customerEmail: string;
  shippingAddress: ShippingAddress;
  billingAddress: BillingAddress;
  billingSameAsShipping: boolean;
  discountCode: string;
}

interface CheckoutFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  cartItems: CheckoutCartItem[];
  cartId: string | null;
  total: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  transactionFee: number;
  isAuthenticated: boolean;
  user: { email?: string } | null;
  styles: Record<string, string>;
  router: ReturnType<typeof useRouter>;
  setCartId: (cartId: string | null) => void;
  setIsCheckingOut: React.Dispatch<React.SetStateAction<boolean>>;
  onEmailRegistered: () => void;
  shippingAddress: ShippingAddress;
  onShippingAddressChange: (address: ShippingAddress) => void;
  isAddressValidated: boolean;
  onAddressValidated: (isValid: boolean, easypostId?: string) => void;
  selectedShippingRate: ShippingRate | null;
  onRateSelected: (rate: ShippingRate | null, shipmentId?: string) => void;
  shipmentId?: string;
}

const CheckoutForm = forwardRef<unknown, CheckoutFormProps>(({
  formData,
  setFormData,
  cartItems,
  cartId,
  total,
  subtotal,
  shippingCost,
  tax,
  discount,
  transactionFee,
  isAuthenticated,
  user,
  styles,
  router,
  setCartId,
  setIsCheckingOut,
  onEmailRegistered,
  shippingAddress,
  onShippingAddressChange,
  isAddressValidated,
  onAddressValidated,
  selectedShippingRate,
  onRateSelected,
  shipmentId,
}, ref) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const { token, guestSessionId, setGuestSessionId } = useAuthContext();
  const { theme } = useTheme();
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isCardComplete, setIsCardComplete] = useState<boolean>(false);
  const [showValidationError, setShowValidationError] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    validateForm();
  }, [formData, isCardComplete, isAddressValidated, selectedShippingRate]);

  useEffect(() => {
    const storedCartId = localStorage.getItem('cartId');
    const storedGuestSessionId = localStorage.getItem('guestSessionId');
    if (storedCartId && !cartId) setCartId(storedCartId);
    if (storedGuestSessionId && !guestSessionId) setGuestSessionId(storedGuestSessionId);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    addressType?: "billingAddress"
  ) => {
    const { name, value } = e.target;
    setError(null);
    if (addressType) {
      let newValue = value;
      if (name === "postal_code" && value.length > 5) {
        newValue = value.slice(0, 5);
      }
      setFormData((prev: FormData) => ({
        ...prev,
        [addressType]: { ...prev[addressType], [name]: newValue },
      }));
    } else {
      setFormData((prev: FormData) => ({ ...prev, [name]: value }));
      if (name === "customerEmail") {
        setErrors((prev) => ({ ...prev, customerEmail: null }));
      }
    }
    validateField(name, value, addressType);
  };

  const validateField = (name: string, value: string, addressType?: string) => {
    let errorMsg: string | null = null;
    if (addressType) {
      const fullName = `${addressType}.${name}`;
      if (!value.trim()) {
        errorMsg = `${name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' ')} is required.`;
      } else if (name === "postal_code" && !/^\d{5}$/.test(value)) {
        errorMsg = "Postal Code must be exactly 5 digits.";
      }
      setErrors((prev) => ({ ...prev, [fullName]: errorMsg }));
    } else {
      if (name === "customerName" && !value.trim()) {
        errorMsg = "Full Name is required.";
      } else if (name === "customerEmail") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          errorMsg = "Email is required.";
        } else if (!emailRegex.test(value)) {
          errorMsg = "Please enter a valid email address.";
        }
      }
      setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, addressType?: string) => {
    const { name, value } = e.target;
    validateField(name, value, addressType);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setFormData((prev: FormData) => ({
      ...prev,
      billingSameAsShipping: checked,
      billingAddress: checked ? {
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postal_code: shippingAddress.postal_code,
        country: shippingAddress.country,
      } : prev.billingAddress,
    }));
    if (checked) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors["billingAddress.street"];
        delete newErrors["billingAddress.city"];
        delete newErrors["billingAddress.state"];
        delete newErrors["billingAddress.postal_code"];
        delete newErrors["billingAddress.country"];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string | null } = {};
    if (!formData.customerName.trim()) newErrors.customerName = "Full Name is required.";
    if (!formData.customerEmail.trim()) newErrors.customerEmail = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) newErrors.customerEmail = "Please enter a valid email address.";
    
    if (!formData.billingSameAsShipping) {
      if (!formData.billingAddress.street.trim()) newErrors["billingAddress.street"] = "Street is required.";
      if (!formData.billingAddress.city.trim()) newErrors["billingAddress.city"] = "City is required.";
      if (!formData.billingAddress.state.trim()) newErrors["billingAddress.state"] = "State is required.";
      if (!formData.billingAddress.postal_code.trim()) newErrors["billingAddress.postal_code"] = "Postal Code is required.";
      else if (!/^\d{5}$/.test(formData.billingAddress.postal_code)) newErrors["billingAddress.postal_code"] = "Postal Code must be exactly 5 digits.";
      if (!formData.billingAddress.country.trim()) newErrors["billingAddress.country"] = "Country is required.";
    }
    
    setErrors(newErrors);
    const isValid = Object.values(newErrors).every((error) => error === null) && 
                    isCardComplete && 
                    isAddressValidated && 
                    selectedShippingRate !== null;
    setIsFormValid(isValid);
    return isValid;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (!isFormValid) {
      setShowValidationError(true);
      return;
    }
    setError(null);
    setIsSubmitting(true);

    if (!cartId || cartItems.length === 0) {
      setError("Cart is empty or not loaded.");
      setIsSubmitting(false);
      return;
    }
    if (!stripe || !elements) {
      setError("Payment system not initialized.");
      setIsSubmitting(false);
      return;
    }
    if (!selectedShippingRate) {
      setError("Please select a shipping method.");
      setIsSubmitting(false);
      return;
    }

    setIsCheckingOut(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const headers = buildHeaders(isAuthenticated, token, guestSessionId);

      localStorage.setItem('cartId', cartId || '');
      localStorage.setItem('guestSessionId', guestSessionId || '');

      const order_items = cartItems.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
        price: Math.round(item.price * 100),
        on_sale: item.productOnSale,
        is_additional_part: item.is_additional_part || false,
        order_item_parts: item.cart_item_parts.map((part) => ({
          product_part: part.product_part.id,
          color: part.color.id,
        })),
      }));

      const billingAddress = formData.billingSameAsShipping
        ? {
            street: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postal_code: shippingAddress.postal_code,
            country: shippingAddress.country,
          }
        : formData.billingAddress;

      const subtotalCents = Math.round(subtotal * 100);
      const shippingCostCents = selectedShippingRate.rate_with_handling_cents;
      const taxCents = Math.round(tax * 100);
      const discountCents = Math.round(discount * 100);
      const transactionFeeCents = Math.round(transactionFee * 100);
      const totalCents = Math.round(total * 100);

      const orderData = {
        data: {
          cartId,
          paymentMethod: "stripe",
          total_amount: totalCents,
          subtotal: subtotalCents,
          shipping_cost: shippingCostCents,
          sales_tax: taxCents,
          discount_total: discountCents,
          transaction_fee: transactionFeeCents,
          customer_name: formData.customerName,
          shipping_address: {
            street: shippingAddress.street,
            street2: shippingAddress.street2 || '',
            city: shippingAddress.city,
            state: shippingAddress.state,
            postal_code: shippingAddress.postal_code,
            country: shippingAddress.country,
            phone: shippingAddress.phone,
          },
          billing_address: {
            street: billingAddress.street,
            city: billingAddress.city,
            state: billingAddress.state,
            postal_code: billingAddress.postal_code,
            country: billingAddress.country,
          },
          discount_code: formData.discountCode ? { code: formData.discountCode } : null,
          order_items,
          guest_email: formData.customerEmail,
          shipping_rate_id: selectedShippingRate.id,
          carrier_service: `${selectedShippingRate.carrier} ${selectedShippingRate.service}`,
          estimated_delivery_date: selectedShippingRate.estimated_delivery_date,
          easypost_shipment_id: shipmentId,
        },
      };

      // Generate idempotency key to prevent duplicate orders
      const idempotencyKey = `order_${cartId}_${Date.now()}`;
      const orderResponse = await axios.post(`${apiUrl}/api/orders`, orderData, {
        headers: { ...headers, 'Idempotency-Key': idempotencyKey },
        withCredentials: true,
        timeout: 30000,
      });
      const { paymentIntentClientSecret } = orderResponse.data;

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found.");
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        paymentIntentClientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: formData.customerName,
              email: formData.customerEmail,
              address: {
                line1: billingAddress.street,
                city: billingAddress.city,
                state: billingAddress.state,
                postal_code: billingAddress.postal_code,
                country: billingAddress.country,
              },
            },
          },
        }
      );

      if (stripeError) {
        let errorMessage = "Payment failed. Please try again.";
        if (stripeError.code) {
          switch (stripeError.code) {
            case "card_declined":
              errorMessage = "Your card was declined. Please try a different payment method.";
              break;
            case "insufficient_funds":
              errorMessage = "Your card has insufficient funds. Please use a different card or add funds.";
              break;
            case "invalid_card_number":
              errorMessage = "The card number is invalid. Please check and try again.";
              break;
            case "invalid_expiry_year":
              errorMessage = "The card's expiration year is invalid. Please check and try again.";
              break;
            case "invalid_expiry_month":
              errorMessage = "The card's expiration month is invalid. Please check and try again.";
              break;
            case "invalid_cvc":
              errorMessage = "The card's security code is invalid. Please check and try again.";
              break;
            case "expired_card":
              errorMessage = "Your card has expired. Please use a different card.";
              break;
            case "incorrect_cvc":
              errorMessage = "The card's security code is incorrect. Please check and try again.";
              break;
            case "processing_error":
              errorMessage = "An error occurred while processing your card. Please try again later.";
              break;
            case "authentication_required":
              errorMessage = "The card requires authentication. Please follow the prompts from your bank.";
              break;
            case "payment_intent_authentication_failure":
              errorMessage = "Authentication failed. Please try again or use a different card.";
              break;
            default:
              errorMessage = stripeError.message || "Payment failed. Please try again.";
          }
        }
        setError(errorMessage);
        setIsSubmitting(false);
        cardElement.clear();
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        setCartId(null);
        localStorage.removeItem('cartId');
        localStorage.removeItem('guestSessionId');
        window.dispatchEvent(new CustomEvent("cartReset"));
        setIsCheckingOut(false);
        router.push(`/checkout/order-confirmation?session_id=${paymentIntent.id}`);
      } else if (paymentIntent?.status === "requires_action") {
        // 3D Secure authentication is handled automatically by Stripe's confirmCardPayment.
        // If we reach here, the authentication was not completed.
        setError("Additional authentication is required. Please follow your bank's prompts and try again.");
        setIsSubmitting(false);
      } else if (paymentIntent?.status === "requires_payment_method") {
        setError("Payment failed. Please try a different payment method.");
        setIsSubmitting(false);
        cardElement.clear();
      }
    } catch (err) {
      console.error("Checkout error:", err);
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.error?.message || err.message || "Checkout failed. Please try again.";
        setError(errorMessage);
      } else {
        setError((err as Error).message || "Checkout failed. Please try again.");
      }
      setIsSubmitting(false);
      localStorage.setItem('cartId', cartId || '');
      localStorage.setItem('guestSessionId', guestSessionId || '');
    }
  };

  useImperativeHandle(ref, () => ({
    clearEmailError: () => {
      setErrors((prev) => ({ ...prev, customerEmail: null }));
    },
    setEmailError: (message: string) => {
      setErrors((prev) => ({ ...prev, customerEmail: message }));
    },
  }));

  const cardElementOptions = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: 'Roboto, sans-serif',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  const darkModeCardElementOptions = {
    style: {
      base: {
        color: '#ffffff',
        fontFamily: 'Roboto, sans-serif',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  const cardOptions = theme === 'dark' ? darkModeCardElementOptions : cardElementOptions;

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleCheckout}>
        <h2>Customer Information</h2>
        <label htmlFor="customerName">Full Name</label>
        {isSubmitted && errors.customerName && <p className={styles.errorText}>{errors.customerName}</p>}
        <input
          id="customerName"
          type="text"
          name="customerName"
          value={formData.customerName || ''}
          onChange={handleInputChange}
          onBlur={(e) => handleBlur(e)}
          placeholder="Full Name"
          required
          className={isSubmitted && errors.customerName ? styles.inputError : ""}
        />
        <label htmlFor="customerEmail">Email Address</label>
        {isSubmitted && errors.customerEmail && <p className={styles.errorText}>{errors.customerEmail}</p>}
        <input
          id="customerEmail"
          type="email"
          name="customerEmail"
          value={formData.customerEmail || ''}
          onChange={handleInputChange}
          onBlur={(e) => handleBlur(e)}
          placeholder="Email Address"
          required
          className={isSubmitted && errors.customerEmail ? styles.inputError : ""}
        />

        <h2>Shipping Address</h2>
        <ShippingAddressForm
          address={shippingAddress}
          onChange={onShippingAddressChange}
          onValidated={onAddressValidated}
          disabled={isSubmitting}
        />

        <h2>Shipping Method</h2>
        <p className={styles.disclaimer}>
          <strong>Important Note:</strong> Cases are manufactured after orders are placed. Manufacturing can take up to 5 business days, after which the selected shipping time will apply.
        </p>
        <ShippingRateSelector
          address={shippingAddress}
          cartItems={cartItems}
          isAddressValidated={isAddressValidated}
          onRateSelected={onRateSelected}
          selectedRateId={selectedShippingRate?.id}
        />

        <h2>Billing Information</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <input
            type="checkbox"
            id="billingSameAsShipping"
            checked={formData.billingSameAsShipping}
            onChange={handleCheckboxChange}
          />
          <label htmlFor="billingSameAsShipping">Same as shipping address</label>
        </div>
        {!formData.billingSameAsShipping && (
          <>
            <label htmlFor="billingStreet">Street Address</label>
            {isSubmitted && errors["billingAddress.street"] && <p className={styles.errorText}>{errors["billingAddress.street"]}</p>}
            <input
              id="billingStreet"
              type="text"
              name="street"
              value={formData.billingAddress.street || ''}
              onChange={(e) => handleInputChange(e, "billingAddress")}
              onBlur={(e) => handleBlur(e, "billingAddress")}
              placeholder="Street Address"
              required
              className={isSubmitted && errors["billingAddress.street"] ? styles.inputError : ""}
            />
            <label htmlFor="billingCity">City</label>
            {isSubmitted && errors["billingAddress.city"] && <p className={styles.errorText}>{errors["billingAddress.city"]}</p>}
            <input
              id="billingCity"
              type="text"
              name="city"
              value={formData.billingAddress.city || ''}
              onChange={(e) => handleInputChange(e, "billingAddress")}
              onBlur={(e) => handleBlur(e, "billingAddress")}
              placeholder="City"
              required
              className={isSubmitted && errors["billingAddress.city"] ? styles.inputError : ""}
            />
            <label htmlFor="billingState">State</label>
            {isSubmitted && errors["billingAddress.state"] && <p className={styles.errorText}>{errors["billingAddress.state"]}</p>}
            <input
              id="billingState"
              type="text"
              name="state"
              value={formData.billingAddress.state || ''}
              onChange={(e) => handleInputChange(e, "billingAddress")}
              onBlur={(e) => handleBlur(e, "billingAddress")}
              placeholder="State"
              required
              className={isSubmitted && errors["billingAddress.state"] ? styles.inputError : ""}
            />
            <label htmlFor="billingPostalCode">Postal Code</label>
            {isSubmitted && errors["billingAddress.postal_code"] && <p className={styles.errorText}>{errors["billingAddress.postal_code"]}</p>}
            <input
              id="billingPostalCode"
              type="text"
              name="postal_code"
              value={formData.billingAddress.postal_code || ''}
              onChange={(e) => handleInputChange(e, "billingAddress")}
              onBlur={(e) => handleBlur(e, "billingAddress")}
              placeholder="Postal Code (5 digits)"
              required
              maxLength={5}
              pattern="\d{5}"
              className={isSubmitted && errors["billingAddress.postal_code"] ? styles.inputError : ""}
            />
            <label htmlFor="billingCountry">Country</label>
            {isSubmitted && errors["billingAddress.country"] && <p className={styles.errorText}>{errors["billingAddress.country"]}</p>}
            <input
              id="billingCountry"
              type="text"
              name="country"
              value={formData.billingAddress.country || 'US'}
              readOnly
              className={styles.readOnlyInput}
            />
          </>
        )}

        <h2>Payment Information</h2>
        <div className={styles.cardElementContainer}>
          <CardElement
            key={theme}
            options={cardOptions}
            onChange={(e) => setIsCardComplete(e.complete)}
          />
          {error && (
            <div className={styles.errorContainer}>
              <p className={styles.error}>{error}</p>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setIsCheckingOut(false);
                }}
                className={styles.dismissButton}
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
          <button
            type="submit"
            className={`${styles.checkoutPrimaryButton} ${!isFormValid ? styles.disabledButton : ''}`}
            disabled={!stripe || isSubmitting || !isFormValid}
            onClick={() => !isFormValid && setShowValidationError(true)}
          >
            {isSubmitting ? "Processing..." : "Complete Purchase"}
          </button>
          <span className={styles.totalDisplay}>Total: ${total.toFixed(2)}</span>
        </div>
        {showValidationError && !isFormValid && (
          <p className={styles.validationMessage}>
            {!isAddressValidated 
              ? "Please validate your shipping address before proceeding."
              : !selectedShippingRate 
                ? "Please select a shipping method."
                : "One or more fields need to be filled out correctly before you can proceed with your purchase."
            }
          </p>
        )}
      </form>
    </div>
  );
});

CheckoutForm.displayName = 'CheckoutForm';

export default CheckoutForm;