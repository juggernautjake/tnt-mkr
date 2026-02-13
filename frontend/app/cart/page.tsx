'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuthContext } from '../../context/AuthContext';
import Link from 'next/link';
import axios from 'axios';
import styles from './cart.module.css';
import { useNavbarHeight } from '../../hooks/useNavbarHeight';
import LoadingIndicator from '../../components/LoadingIndicator';
import type { Color, Cart, CartItem, CartItemPart } from '../../lib/types';
import { buildHeaders } from '../../lib/api';

export default function CartPage() {
  const { isAuthenticated, token, guestSessionId } = useAuthContext();
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(null);
  const [editingPart, setEditingPart] = useState<{ cartItemId: string; partId: number } | null>(null);
  const [availableColors, setAvailableColors] = useState<Color[]>([]);
  const [showMergeConfirm, setShowMergeConfirm] = useState<{ itemToKeep: CartItem; itemToDelete: CartItem } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navbarHeight = useNavbarHeight();

  const getTextColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? 'black' : 'white';
  };

  // Helper function to get display name for cart item
  const getItemDisplayName = (item: CartItem): string => {
    if (item.is_additional_part && item.cart_item_parts.length === 1) {
      return `${item.product.name} - Additional ${item.cart_item_parts[0].product_part.name}`;
    }
    return item.product.name;
  };

  const fetchActiveCart = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('API URL is not defined');

      const headers = buildHeaders(isAuthenticated, token, guestSessionId);
      let cartUrl = `${apiUrl}/api/carts?filters[status][$eq]=active`;
      if (!isAuthenticated && guestSessionId) {
        cartUrl += `&filters[guest_session][$eq]=${encodeURIComponent(guestSessionId)}`;
      }
      cartUrl += `&populate[cart_items][populate][product][populate][product_parts][populate][colors]=*`;
      cartUrl += `&populate[cart_items][populate][product][populate]=thumbnail_image`;
      cartUrl += `&populate[cart_items][populate][cart_item_parts][populate][product_part]=*`;
      cartUrl += `&populate[cart_items][populate][cart_item_parts][populate][color]=*`;

      const response = await axios.get(cartUrl, { headers, withCredentials: true });

      const cartData = response.data.data && response.data.data.length > 0 ? response.data.data[0] : null;
      if (!cartData) {
        setCart(null);
        return;
      }

      const cartItemsData = cartData.attributes?.cart_items?.data || cartData.cart_items || [];
      if (!Array.isArray(cartItemsData)) {
        console.error('[fetchActiveCart] Cart items is not an array:', cartItemsData);
        setCart(null);
        return;
      }

      const cartItems: CartItem[] = cartItemsData.map((item: any) => {
        const product = item.attributes?.product?.data || item.product || {};

        const cartItemParts = (item.attributes?.cart_item_parts?.data || item.cart_item_parts || []).map((cip: any) => {
          return {
            id: cip.id,
            product_part: {
              id: cip.attributes?.product_part?.data?.id || cip.product_part?.id || 0,
              name: cip.attributes?.product_part?.data?.attributes?.name || cip.product_part?.name || 'Unknown Part',
            },
            color: {
              id: cip.attributes?.color?.data?.id || cip.color?.id || 0,
              name: cip.attributes?.color?.data?.attributes?.name || cip.color?.name || 'Unknown Color',
              hex_codes: cip.attributes?.color?.data?.attributes?.hex_codes || cip.color?.hex_codes || [],
              type: cip.attributes?.color?.data?.attributes?.type || cip.color?.type || 'standard',
            },
          };
        });

        const productParts = (product.attributes?.product_parts?.data || product.product_parts || []).map((part: any) => {
          const colors = (part.attributes?.colors?.data || part.colors || []).map((color: any) => {
            return {
              id: color.id,
              name: color.attributes?.name || color.name || 'Unknown Color',
              hex_codes: color.attributes?.hex_codes || color.hex_codes || [],
              type: color.attributes?.type || color.type || 'standard',
            };
          });
          return {
            id: part.id,
            name: part.attributes?.name || part.name || 'Unknown Part',
            colors,
          };
        });

        return {
          id: item.id.toString(),
          quantity: item.attributes?.quantity || item.quantity || 0,
          price: parseFloat(item.attributes?.effective_price || item.effective_price) || 0,
          base_price: parseFloat(item.attributes?.base_price || item.base_price) || 0,
          is_additional_part: item.attributes?.is_additional_part || item.is_additional_part || false,
          product: {
            id: product.id?.toString() || '',
            name: product.attributes?.name || product.name || 'Unknown Product',
            default_price: parseFloat(product.attributes?.default_price || product.default_price) || 0,
            discounted_price: product.attributes?.discounted_price ? parseFloat(product.attributes.discounted_price) : undefined,
            on_sale: product.attributes?.on_sale || product.on_sale || false,
            thumbnail_image: product.attributes?.thumbnail_image?.data
              ? { url: product.attributes.thumbnail_image.data.attributes?.url || product.attributes.thumbnail_image.data.url }
              : product.thumbnail_image
              ? { url: product.thumbnail_image.url }
              : undefined,
            product_parts: productParts,
          },
          cart_item_parts: cartItemParts,
        };
      }).filter(item => item !== null);

      if (cartItems.length === 0) {
        setCart(null);
        return;
      }

      const calculatedTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const backendTotal = parseFloat(cartData.attributes?.total || cartData.total) || 0;

      if (calculatedTotal.toFixed(2) !== backendTotal.toFixed(2)) {
        await axios.put(`${apiUrl}/api/carts/${cartData.id}`, {
          data: { total: calculatedTotal.toFixed(2) },
        }, { headers, withCredentials: true });
      }

      const mappedCart: Cart = {
        id: cartData.id.toString(),
        total: calculatedTotal,
        cart_items: cartItems,
      };
      setCart(mappedCart);
    } catch (err: unknown) {
      setError('Failed to load cart. Please try again.');
      console.error('[fetchActiveCart] Error:', axios.isAxiosError(err) ? err.response?.data : err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductPartColors = async (partId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('API URL is not defined');

      const headers = buildHeaders(isAuthenticated, token, guestSessionId);
      const url = `${apiUrl}/api/product-parts/${partId}?populate[colors]=*`;
      const response = await axios.get(url, { headers, withCredentials: true });

      const partData = response.data.data;
      const colors = (partData.attributes?.colors?.data || partData.colors || []).map((color: any) => ({
        id: color.id,
        name: color.attributes?.name || color.name || 'Unknown Color',
        hex_codes: color.attributes?.hex_codes || color.hex_codes || [],
        type: color.attributes?.type || color.type || 'standard',
      }));

      setAvailableColors(colors);
    } catch (err: unknown) {
      setError('Failed to load colors for product part.');
      console.error('[fetchProductPartColors] Error:', axios.isAxiosError(err) ? err.response?.data : err);
      setAvailableColors([]);
    }
  };

  useEffect(() => {
    if (guestSessionId || isAuthenticated) {
      fetchActiveCart();
    }
    window.addEventListener('cartUpdated', fetchActiveCart);
    return () => window.removeEventListener('cartUpdated', fetchActiveCart);
  }, [isAuthenticated, token, guestSessionId]);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return confirmRemoveItem(itemId);
    if (newQuantity > 99) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const headers = buildHeaders(isAuthenticated, token, guestSessionId);

      await axios.put(
        `${apiUrl}/api/cart-items/${itemId}`,
        { data: { quantity: newQuantity } },
        { headers, withCredentials: true }
      );
      window.dispatchEvent(new Event("cartUpdated"));
      await fetchActiveCart();
    } catch (err) {
      setError('Failed to update quantity');
      console.error('[updateQuantity] Error:', err);
    }
  };

  const confirmRemoveItem = (itemId: string) => setShowRemoveConfirm(itemId);

  const removeItem = async (itemId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const headers = buildHeaders(isAuthenticated, token, guestSessionId);

      await axios.delete(`${apiUrl}/api/cart-items/${itemId}`, {
        headers,
        withCredentials: true,
      });
      window.dispatchEvent(new Event("cartUpdated"));
      await fetchActiveCart();
      setShowRemoveConfirm(null);
    } catch (err) {
      setError('Failed to remove item');
      setShowRemoveConfirm(null);
      console.error('[removeItem] Error:', err);
    }
  };

  const clearCart = async () => {
    if (!cart || !showClearConfirm) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const headers = buildHeaders(isAuthenticated, token, guestSessionId);

      for (const item of cart.cart_items) {
        await axios.delete(`${apiUrl}/api/cart-items/${item.id}`, {
          headers,
          withCredentials: true,
        });
      }
      window.dispatchEvent(new Event("cartUpdated"));
      await fetchActiveCart();
      setShowClearConfirm(false);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error?.message : undefined;
      setError(message || 'Failed to clear cart');
      setShowClearConfirm(false);
      console.error('[clearCart] Error:', err);
    }
  };

  const handleEditClick = async (cartItemId: string, partId: number) => {
    setEditingPart({ cartItemId, partId });
    await fetchProductPartColors(partId);
  };

  const checkForDuplicateCartItems = (updatedCart: Cart, modifiedItemId: string) => {
    const modifiedItem = updatedCart.cart_items.find(item => item.id === modifiedItemId);
    if (!modifiedItem) return null;

    const modifiedColors = modifiedItem.cart_item_parts
      .sort((a, b) => a.product_part.id - b.product_part.id)
      .map(part => part.color.id);

    const duplicateItem = updatedCart.cart_items.find(item => {
      if (item.id === modifiedItemId) return false;
      if (item.product.id !== modifiedItem.product.id) return false;
      // Also check if both are additional parts or both are full products
      if (item.is_additional_part !== modifiedItem.is_additional_part) return false;

      const itemColors = item.cart_item_parts
        .sort((a, b) => a.product_part.id - b.product_part.id)
        .map(part => part.color.id);

      return modifiedColors.length === itemColors.length &&
        modifiedColors.every((colorId, index) => colorId === itemColors[index]);
    });

    if (duplicateItem) {
      const itemToKeep = parseInt(modifiedItem.id) < parseInt(duplicateItem.id) ? modifiedItem : duplicateItem;
      const itemToDelete = parseInt(modifiedItem.id) < parseInt(duplicateItem.id) ? duplicateItem : modifiedItem;
      return { itemToKeep, itemToDelete };
    }

    return null;
  };

  const mergeCartItems = async (itemToKeep: CartItem, itemToDelete: CartItem) => {
    try {
      const newQuantity = itemToKeep.quantity + itemToDelete.quantity;
      await updateQuantity(itemToKeep.id, newQuantity);
      await removeItem(itemToDelete.id);
      setShowMergeConfirm(null);
    } catch (err) {
      setError('Failed to merge cart items');
      console.error('[mergeCartItems] Error:', err);
      setShowMergeConfirm(null);
    }
  };

  const handleColorChange = async (cartItemPartId: number, newColorId: number) => {
    try {
      if (!cart || !editingPart) throw new Error('Cart or editing part not defined');

      const modifiedItem = cart.cart_items.find(item => item.id === editingPart.cartItemId);
      if (!modifiedItem) throw new Error('Modified cart item not found');

      const newColor = availableColors.find(color => color.id === newColorId);
      if (!newColor) throw new Error('Selected color not found');

      const updatedCartItems = cart.cart_items.map(item => {
        if (item.id !== editingPart.cartItemId) return item;
        return {
          ...item,
          cart_item_parts: item.cart_item_parts.map(part => {
            if (part.id === cartItemPartId) {
              return {
                ...part,
                color: newColor,
              };
            }
            return part;
          }),
        };
      });

      const tempCart = {
        ...cart,
        cart_items: updatedCartItems,
      };

      const duplicate = checkForDuplicateCartItems(tempCart, editingPart.cartItemId);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const headers = buildHeaders(isAuthenticated, token, guestSessionId);

      const response = await axios.put(
        `${apiUrl}/api/cart-item-parts/${cartItemPartId}`,
        { data: { color: newColorId } },
        { headers, withCredentials: true }
      );
      await fetchActiveCart();

      if (duplicate) {
        setShowMergeConfirm(duplicate);
      }

      setEditingPart(null);
      setAvailableColors([]);
    } catch (err) {
      setError('Failed to update color');
      console.error('[handleColorChange] Error:', err);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setEditingPart(null);
      setAvailableColors([]);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) return <LoadingIndicator />;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.cartContainer}>
      <div className={styles.headerSection}>
        <h1>Your Cart</h1>
        <div className={styles.headerButtons}>
          <button onClick={() => setShowClearConfirm(true)} className={`${styles.cartButton} ${styles.cartButtonOutlined}`} aria-label="Clear cart">
            Clear Cart
          </button>
          <Link href="/store">
            <button className={`${styles.cartButton} ${styles.cartButtonFilled}`} aria-label="Continue shopping">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
      {!cart || !cart.cart_items || cart.cart_items.length === 0 ? (
        <div className={styles.emptyCart}>
          <p>Your cart is empty.</p>
          <Link href="/store">
            <button className={`${styles.cartButton} ${styles.cartButtonFilled}`}>Continue Shopping</button>
          </Link>
        </div>
      ) : (
        <>
          {showClearConfirm && (
            <div className={styles.confirmDialog}>
              <p>Are you sure you want to clear your cart?</p>
              <button onClick={clearCart} className={styles.primaryButton}>
                Yes, Clear Cart
              </button>
              <button onClick={() => setShowClearConfirm(false)} className={styles.secondaryButton}>
                No, Keep Cart
              </button>
            </div>
          )}
          {showRemoveConfirm && (
            <div className={styles.confirmDialog}>
              <p>
                Are you sure you want to remove{' '}
                {getItemDisplayName(cart.cart_items.find((i) => i.id === showRemoveConfirm)!)}{' '}
                from your cart?
              </p>
              <button onClick={() => removeItem(showRemoveConfirm)} className={styles.primaryButton}>
                Yes, Remove Item
              </button>
              <button onClick={() => setShowRemoveConfirm(null)} className={styles.secondaryButton}>
                No, Keep Item
              </button>
            </div>
          )}
          {showMergeConfirm && (
            <div className={styles.mergeConfirmDialog}>
              <p>
                Another cart item with the same product ({getItemDisplayName(showMergeConfirm.itemToKeep)}) and color selections already exists.
                Would you like to merge these items?
              </p>
              <button
                onClick={() => mergeCartItems(showMergeConfirm.itemToKeep, showMergeConfirm.itemToDelete)}
                className={styles.primaryButton}
              >
                Yes, Merge Items
              </button>
              <button
                onClick={() => setShowMergeConfirm(null)}
                className={styles.secondaryButton}
              >
                No, Keep Separate
              </button>
            </div>
          )}
          <div className={`${styles.cartItemsContainer} ${cart.cart_items.length > 5 ? styles.scrollable : ''}`}>
            <ul className={styles.cartList}>
              {cart.cart_items.map((item) => {
                const displayName = getItemDisplayName(item);
                return (
                  <li key={item.id} className={styles.cartItem}>
                    <button
                      onClick={() => confirmRemoveItem(item.id)}
                      className={styles.removeButton}
                      aria-label={`Remove ${displayName} from cart`}
                    >
                      Remove
                    </button>
                    <div className={styles.cartItemMain}>
                      <div className={styles.imageContainer}>
                        <Image
                          src={item.product.thumbnail_image?.url || '/icons/Phone_Case_Icon.png'}
                          alt={displayName}
                          className={styles.image}
                          width={100}
                          height={100}
                          unoptimized
                        />
                        {/* Show badge for additional parts */}
                        {item.is_additional_part && (
                          <span className={styles.additionalPartBadge}>Part Only</span>
                        )}
                      </div>
                      <div className={styles.productInfo}>
                        <span className={styles.productName}>{displayName}</span>
                      </div>
                      <div className={styles.itemActions}>
                        <span className={styles.price}>
                          {item.base_price > item.price ? (
                            <>
                              <span className={styles.strikethrough}>${item.base_price.toFixed(2)}</span>
                              <span className={styles.discountedPrice}>${item.price.toFixed(2)}</span>
                            </>
                          ) : (
                            <strong>${item.price.toFixed(2)}</strong>
                          )}
                        </span>
                        <div className={styles.quantityControl}>
                          <button
                            className={styles.quantityButton}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, Math.min(99, parseInt(e.target.value) || 1))}
                            className={styles.quantityInput}
                            aria-label={`Quantity for ${displayName}`}
                          />
                          <button
                            className={styles.quantityButton}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className={styles.colorSelections}>
                      {item.cart_item_parts.length > 0 ? (
                        item.cart_item_parts.map((cip, index) => {
                          const hexCodes = cip.color.hex_codes.map(h => h.hex_code).filter(h => h);
                          const backgroundStyle =
                            hexCodes.length > 0
                              ? cip.color.type === 'rainbow' && hexCodes.length >= 2
                                ? `linear-gradient(to right, ${hexCodes.slice(0, 6).join(', ')})`
                                : hexCodes[0]
                              : '#ccc';
                          const textColor = hexCodes.length > 0 ? getTextColor(hexCodes[0]) : 'black';

                          return (
                            <div key={index} className={styles.colorBubbleContainer}>
                              <span className={styles.partName}>{cip.product_part.name}:</span>
                              <div
                                className={styles.colorBubble}
                                style={{ background: backgroundStyle }}
                                onClick={() => handleEditClick(item.id, cip.product_part.id)}
                              >
                                <span className={styles.editText} style={{ color: textColor }}>Edit</span>
                              </div>
                              <div className={styles.colorTooltip}>
                                <p>{cip.color.name}</p>
                                {cip.color.hex_codes.map((h, idx) => (
                                  <p key={idx}>{h.name}: {h.hex_code}</p>
                                ))}
                                <p>Type: {cip.color.type}</p>
                              </div>
                              {editingPart?.cartItemId === item.id && editingPart?.partId === cip.product_part.id && (
                                <div className={styles.dropdownMenu} ref={dropdownRef}>
                                  {availableColors.length > 0 ? (
                                    availableColors.map((color) => {
                                      const colorHexCodes = color.hex_codes.map(h => h.hex_code).filter(h => h);
                                      const colorBackground =
                                        colorHexCodes.length > 0
                                          ? color.type === 'rainbow' && colorHexCodes.length >= 2
                                            ? `linear-gradient(to right, ${colorHexCodes.slice(0, 6).join(', ')})`
                                            : colorHexCodes[0]
                                          : '#ccc';
                                      return (
                                        <div
                                          key={color.id}
                                          className={styles.dropdownItem}
                                          onClick={() => handleColorChange(cip.id, color.id)}
                                        >
                                          <div
                                            className={styles.dropdownColorBubble}
                                            style={{ background: colorBackground }}
                                          />
                                          <span>{color.name}</span>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div className={styles.dropdownItem}>No colors available</div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <span className={styles.noCustomizations}>No customizations selected</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className={styles.summary}>
            <h2>Total: ${cart.total.toFixed(2)}</h2>
            <Link href="/checkout">
              <button className={`${styles.cartButton} ${styles.cartButtonFilled}`} aria-label="Proceed to checkout">
                Proceed to Checkout
              </button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}