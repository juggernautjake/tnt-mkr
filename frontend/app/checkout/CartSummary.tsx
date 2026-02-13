import React from 'react';
import Image from 'next/image';
import styles from './checkout.module.css';
import type { CheckoutCartItem } from '../../lib/types';

interface CartSummaryProps {
  cartItems: CheckoutCartItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  transactionFee: number;
  total: number;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  confirmRemoveItem: (itemId: string) => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  cartItems,
  subtotal,
  shippingCost,
  tax,
  discount,
  transactionFee,
  total,
  updateQuantity,
  confirmRemoveItem,
}) => {
  if (cartItems.length === 0) {
    return <p>Your cart is empty.</p>;
  }

  const getDisplayName = (item: CheckoutCartItem): string => {
    if (item.is_additional_part && item.cart_item_parts.length === 1) {
      return `${item.productName} - Additional ${item.cart_item_parts[0].product_part.name}`;
    }
    return item.productName;
  };

  return (
    <div className={styles.cartSummary}>
      <h2>Order Summary</h2>
      <div className={styles.itemsAndFees}>
        <div className={styles.cartItems}>
          {cartItems.map((item) => {
            const displayName = getDisplayName(item);
            return (
              <div key={item.id} className={styles.summaryItem}>
                <div className={styles.imageContainer}>
                  <div className={styles.imageWrapper}>
                    <Image
                      src={item.thumbnailUrl || '/icons/Phone_Case_Icon.png'}
                      alt={displayName}
                      className={styles.image}
                      width={60}
                      height={60}
                      unoptimized
                    />
                    {item.is_additional_part && (
                      <span className={styles.partBadge}>Part</span>
                    )}
                  </div>
                  {item.cart_item_parts.length > 0 && (
                    <div className={styles.colorDots}>
                      {item.cart_item_parts.slice(0, 4).map((part, index) => (
                        part.color.hex_codes[0] && (
                          <div
                            key={`${part.id}-${index}`}
                            className={styles.colorDot}
                            style={{ backgroundColor: part.color.hex_codes[0].hex_code }}
                          ></div>
                        )
                      ))}
                    </div>
                  )}
                </div>
                <div className={styles.productInfo}>
                  <span className={styles.productName}>{displayName}</span>
                </div>
                <div className={styles.itemActions}>
                  {item.base_price > item.price ? (
                    <span className={styles.price}>
                      <span style={{ textDecoration: 'line-through', marginRight: '0.5rem' }}>
                        ${item.base_price.toFixed(2)}
                      </span>
                      ${item.price.toFixed(2)}
                    </span>
                  ) : (
                    <span className={styles.price}>${item.price.toFixed(2)}</span>
                  )}
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
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                      className={styles.quantityInput}
                    />
                    <button
                      className={styles.quantityButton}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => confirmRemoveItem(item.id)}
                    className={styles.removeButton}
                  >
                    X
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className={styles.costBreakdown}>
          <div className={styles.feeItem}>
            <span className={styles.feeName}>Subtotal: </span>
            <span className={styles.feeValue}>${subtotal.toFixed(2)}</span>
          </div>
          <div className={styles.feeItem}>
            <span className={styles.feeName}>Shipping: </span>
            <span className={styles.feeValue}>
              {shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : 'Select shipping method'}
            </span>
          </div>
          {discount > 0 && (
            <div className={styles.feeItem}>
              <span className={styles.feeName}>Total Amount Saved: </span>
              <span className={styles.feeValue}>-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className={styles.feeItem}>
            <span className={styles.feeName}>Tax: </span>
            <span className={styles.feeValue}>${tax.toFixed(2)}</span>
          </div>
          <div className={styles.feeItem}>
            <span className={styles.feeName}>Transaction Fee: </span>
            <span className={styles.feeValue}>${transactionFee.toFixed(2)}</span>
          </div>
          <div className={styles.total}>
            <span className={styles.totalName}>Total: </span>
            <span className={styles.totalValue}>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;