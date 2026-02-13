"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import styles from "./OrderConfirmation.module.css";
import ProcessingIndicator from "./ProcessingIndicator";
import type { OrderItem, OrderData } from "../../../lib/types";

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getOrderItemDisplayName = (item: OrderItem): string => {
    if (item.is_additional_part && item.order_item_parts.length === 1) {
      return `${item.product.name} - Additional ${item.order_item_parts[0].product_part.name}`;
    }
    return item.product.name;
  };

  const formatDeliveryDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Estimated 7-10 business days after shipping';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  useEffect(() => {
    async function fetchOrderStatus() {
      if (!sessionId) {
        setError("Missing session ID");
        setLoading(false);
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const headers = {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        };

        let attempts = 0;
        const maxAttempts = 5;
        const retryDelay = 10000;

        while (attempts < maxAttempts) {
          const response = await axios.get(
            `${apiUrl}/api/orders?filters[payment_intent_id][$eq]=${sessionId}&populate[order_items][populate][product]=*&populate[order_items][populate][order_item_parts][populate][product_part]=*&populate[order_items][populate][order_item_parts][populate][color]=*&populate[shipping_address]=*&populate[billing_address]=*&populate[order_items][populate][promotions]=*`,
            { headers }
          );

          const orders = response.data.data;
          if (orders.length > 0) {
            const order = orders[0];
            if (order.attributes.payment_last_four) {
              const orderData: OrderData = {
                id: order.id,
                order_number: order.attributes.order_number,
                customer_name: order.attributes.customer_name,
                total_amount: order.attributes.total_amount,
                subtotal: order.attributes.subtotal,
                shipping_cost: order.attributes.shipping_cost,
                sales_tax: order.attributes.sales_tax,
                discount_total: order.attributes.discount_total,
                transaction_fee: order.attributes.transaction_fee,
                carrier_service: order.attributes.carrier_service || 'USPS',
                estimated_delivery_date: order.attributes.estimated_delivery_date,
                shipping_address: order.attributes.shipping_address?.data?.attributes || {},
                billing_address: order.attributes.billing_address?.data?.attributes || {},
                payment_last_four: order.attributes.payment_last_four || "",
                ordered_at: order.attributes.ordered_at,
                order_items: order.attributes.order_items.data.map((item: any) => ({
                  id: item.id,
                  quantity: item.attributes.quantity,
                  price: parseFloat(item.attributes.price),
                  base_price: parseFloat(item.attributes.base_price),
                  is_additional_part: item.attributes.is_additional_part || false,
                  product: {
                    id: item.attributes.product.data.id,
                    name: item.attributes.product.data.attributes.name,
                  },
                  order_item_parts: item.attributes.order_item_parts.data.map(
                    (part: any) => ({
                      id: part.id,
                      product_part: {
                        id: part.attributes.product_part.data.id,
                        name: part.attributes.product_part.data.attributes.name,
                      },
                      color: {
                        id: part.attributes.color.data.id,
                        name: part.attributes.color.data.attributes.name,
                        hex_codes: part.attributes.color.data.attributes.hex_codes || [],
                        type: part.attributes.color.data.attributes.type || "standard",
                      },
                    })
                  ),
                  promotions: item.attributes.promotions?.data?.map((promo: any) => ({
                    id: promo.id,
                    name: promo.attributes.name,
                  })) || [],
                })),
              };
              setOrderData(orderData);
              setTimeout(() => {
                window.dispatchEvent(new Event("cartUpdated"));
              }, 500);
              break;
            } else {
              attempts++;
              if (attempts < maxAttempts) {
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
              } else {
                setError("Payment details not available after multiple attempts");
              }
            }
          } else {
            setError("Order not found");
            break;
          }
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    }
    fetchOrderStatus();
  }, [sessionId]);

  if (loading) return <ProcessingIndicator />;
  if (error) return <div className={styles.errorContainer}>Error: {error}</div>;

  return (
    <main className={styles.orderConfirmation}>
      <div className={styles.orderSection}>
        <h1 className="text-3xl font-bold mb-4 text-center text-[var(--orange)]">
          Thank You for Your Order!
        </h1>
        <p className="text-lg text-center mb-4 text-[var(--text)]">
          We've received your order and will begin processing it shortly.
          <br />Please save the order confirmation information below.
        </p>

        {orderData && (
          <>
            <div className="border-t pt-4 flex flex-col gap-2 text-[var(--text)]">
              <p>
                <strong>Order Number:</strong> {orderData.order_number}
              </p>
              <p>
                <strong>Order Date:</strong>{" "}
                {new Date(orderData.ordered_at).toLocaleDateString()}
              </p>
              {orderData.payment_last_four && (
                <p>
                  <strong>Payment Method:</strong> ****-****-****-{orderData.payment_last_four}
                </p>
              )}
              {orderData.carrier_service && (
                <p>
                  <strong>Shipping Method:</strong> {orderData.carrier_service}
                </p>
              )}
              {orderData.estimated_delivery_date && (
                <p>
                  <strong>Estimated Delivery:</strong> {formatDeliveryDate(orderData.estimated_delivery_date)}
                </p>
              )}
              {orderData.shipping_address && (
                <p>
                  <strong>Shipping to:</strong> {orderData.customer_name} <br />
                  {orderData.shipping_address.street}
                  {orderData.shipping_address.street2 && `, ${orderData.shipping_address.street2}`}
                  <br />
                  {orderData.shipping_address.city}, {orderData.shipping_address.state} {orderData.shipping_address.postal_code}, {orderData.shipping_address.country}
                  {orderData.shipping_address.phone && (
                    <>
                      <br />
                      Phone: {orderData.shipping_address.phone}
                    </>
                  )}
                </p>
              )}
              {orderData.billing_address && (
                <p>
                  <strong>Billing Address:</strong> <br />
                  {orderData.billing_address.street}, {orderData.billing_address.city}, {orderData.billing_address.state} {orderData.billing_address.postal_code}, {orderData.billing_address.country}
                </p>
              )}
            </div>

            <div className={styles.orderSummary}>
              <h2>Order Summary</h2>
              <p><strong>Subtotal:</strong> ${(orderData.subtotal / 100).toFixed(2)}</p>
              <p><strong>Shipping Cost:</strong> ${(orderData.shipping_cost / 100).toFixed(2)}</p>
              <p><strong>Tax:</strong> ${(orderData.sales_tax / 100).toFixed(2)}</p>
              {orderData.discount_total > 0 && (
                <p><strong>Discount:</strong> -${(orderData.discount_total / 100).toFixed(2)}</p>
              )}
              <p><strong>Transaction Fee:</strong> ${(orderData.transaction_fee / 100).toFixed(2)}</p>
              <p className={styles.totalLine}><strong>Total:</strong> ${(orderData.total_amount / 100).toFixed(2)}</p>
            </div>

            <div className={styles.orderItems}>
              <h2 className="text-xl font-bold mb-2 text-[var(--text)]">Items Purchased</h2>
              {orderData.order_items.map((item) => {
                const displayName = getOrderItemDisplayName(item);
                return (
                  <div key={item.id} className={styles.orderItem}>
                    <div className={styles.itemName}>
                      {displayName}
                      {item.is_additional_part && (
                        <span className={styles.partBadge}>Part Only</span>
                      )}
                    </div>
                    <div className={styles.itemDetails}>
                      <span>
                        {item.base_price && item.base_price > item.price ? (
                          <>
                            <span style={{ textDecoration: 'line-through' }}>
                              ${item.base_price.toFixed(2)}
                            </span>
                            <br />
                            Discounted Price: ${item.price.toFixed(2)}
                          </>
                        ) : (
                          `Price: $${item.price.toFixed(2)}`
                        )}
                        <br />
                        Quantity: {item.quantity}
                      </span>
                    </div>
                    {item.order_item_parts.length > 0 && (
                      <div className={styles.customizations}>
                        <h3 className="text-lg font-semibold text-[var(--text)]">
                          {item.is_additional_part ? 'Selected Color:' : 'Customizations:'}
                        </h3>
                        {item.order_item_parts.map((part) => (
                          <div key={part.id} className={styles.customization}>
                            <span>{part.product_part.name}:</span>
                            <span>{part.color.name}</span>
                            <div className={styles.colorBubbleContainer}>
                              <div
                                className={styles.colorBubble}
                                style={{
                                  background:
                                    part.color.type === "rainbow" &&
                                    part.color.hex_codes.length >= 2
                                      ? `linear-gradient(to right, ${part.color.hex_codes
                                          .map((h) => h.hex_code)
                                          .join(", ")})`
                                      : part.color.hex_codes[0]?.hex_code || "#ccc",
                                }}
                              ></div>
                              <div className={styles.colorTooltip}>
                                <p>{part.color.name}</p>
                                {part.color.hex_codes.map((h, index) => (
                                  <p key={index}>
                                    {h.name}: {h.hex_code}
                                  </p>
                                ))}
                                <p>Type: {part.color.type}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {item.promotions.length > 0 && (
                      <div className={styles.promotions}>
                        <h3 className="text-lg font-semibold text-[var(--text)]">Promotions:</h3>
                        {item.promotions.map((promo) => (
                          <p key={promo.id}>{promo.name}</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className={styles.orderSection}>
        <h3 className="text-xl font-bold mb-3 text-[var(--text)]">What Happens Next?</h3>
        <div className={styles.timeline}>
          <div className={styles.timelineItem}>
            <div className={styles.timelineIcon}>1</div>
            <div className={styles.timelineContent}>
              <strong>Order Processing</strong>
              <p>Your order is being prepared for manufacturing (1-2 business days)</p>
            </div>
          </div>
          <div className={styles.timelineItem}>
            <div className={styles.timelineIcon}>2</div>
            <div className={styles.timelineContent}>
              <strong>Manufacturing</strong>
              <p>Custom cases are made to order (3-5 business days)</p>
            </div>
          </div>
          <div className={styles.timelineItem}>
            <div className={styles.timelineIcon}>3</div>
            <div className={styles.timelineContent}>
              <strong>Shipping</strong>
              <p>You'll receive a tracking number once your order ships</p>
            </div>
          </div>
        </div>
        <p className="text-[var(--secondary-text)] mb-2 mt-4">
          We'll send you a shipping confirmation email when your items are on the
          way. If you have any questions, please feel free to{" "}
          <Link
            href="/contact"
            className="text-[var(--orange)] underline hover:text-accent-blue dark:text-accent-blue dark:hover:text-[var(--orange)]"
          >
            contact us
          </Link>.
        </p>
        <p className={styles.contactInstructions}>
          If you have any questions, disputes, or want to make changes to your order, please use the contact form on our website and reference your order confirmation number.
        </p>
      </div>
    </main>
  );
}