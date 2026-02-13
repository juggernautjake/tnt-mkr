// "use client";

// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import axios from "axios";
// import { useAuthContext } from "../../../context/AuthContext";
// import styles from "./orders.module.css";

// // Interfaces for order data
// interface Color {
//   id: number;
//   name: string;
//   hex_codes: { hex_code: string; name: string }[];
//   type: "standard" | "metallic" | "rainbow";
// }

// interface ProductPart {
//   id: number;
//   name: string;
// }

// interface OrderItemPart {
//   id: number;
//   product_part: ProductPart;
//   color: Color;
// }

// interface Product {
//   id: number;
//   name: string;
// }

// interface OrderItem {
//   id: number;
//   quantity: number;
//   price: number;
//   product: Product;
//   order_item_parts: OrderItemPart[];
// }

// interface Order {
//   id: string;
//   order_number: string;
//   createdAt: string;
//   status: string;
//   total: number;
//   paymentIntentId: string;
//   order_items: OrderItem[];
// }

// export default function MyOrdersPage(): JSX.Element {
//   const { isAuthenticated, user, token } = useAuthContext();
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!isAuthenticated || !user) {
//       setLoading(false);
//       return;
//     }

//     // Early return if user is null
//     if (user === null) {
//       setError("User data is not available.");
//       setLoading(false);
//       return;
//     }

//     // Extract userId where user is guaranteed non-null
//     const userId = user.id;

//     // Pass userId to fetchOrders
//     async function fetchOrders(userId: number) {
//       try {
//         const apiUrl = process.env.NEXT_PUBLIC_API_URL;
//         const response = await axios.get(
//           `${apiUrl}/api/orders?filters[user][id][$eq]=${userId}&populate[order_items][populate][product]=*&populate[order_items][populate][order_item_parts][populate][product_part]=*&populate[order_items][populate][order_item_parts][populate][color]=*`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         const mappedOrders = response.data.data.map((order: any) => ({
//           id: order.id,
//           order_number: order.attributes.order_number,
//           createdAt: order.attributes.ordered_at || order.attributes.createdAt,
//           status: order.attributes.order_status,
//           total: order.attributes.total_amount,
//           paymentIntentId: order.attributes.payment_intent_id,
//           order_items: order.attributes.order_items.data.map((item: any) => ({
//             id: item.id,
//             quantity: item.attributes.quantity,
//             price: parseFloat(item.attributes.price),
//             product: {
//               id: item.attributes.product.data.id,
//               name: item.attributes.product.data.attributes.name,
//             },
//             order_item_parts: item.attributes.order_item_parts.data.map((part: any) => ({
//               id: part.id,
//               product_part: {
//                 id: part.attributes.product_part.data.id,
//                 name: part.attributes.product_part.data.attributes.name,
//               },
//               color: {
//                 id: part.attributes.color.data.id,
//                 name: part.attributes.color.data.attributes.name,
//                 hex_codes: part.attributes.color.data.attributes.hex_codes || [],
//                 type: part.attributes.color.data.attributes.type || "standard",
//               },
//             })),
//           })),
//         }));
//         setOrders(mappedOrders);
//       } catch (err) {
//         console.error("Error fetching orders:", err);
//         setError("Failed to load your orders. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchOrders(userId);
//   }, [isAuthenticated, user, token]);

//   const toggleOrder = (orderId: string) => {
//     setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
//   };

//   const isWithin24Hours = (createdAt: string): boolean => {
//     const orderTime = new Date(createdAt).getTime();
//     const now = Date.now();
//     return now - orderTime < 24 * 60 * 60 * 1000;
//   };

//   if (!isAuthenticated) {
//     return (
//       <main className={styles.ordersContainer}>
//         <h1 className="text-3xl font-bold mb-6 text-black">My Orders</h1>
//         <p className="text-black text-center">
//           To view your order history, please{" "}
//           <Link href="/login" className="underline text-[var(--orange)]">
//             log in to your account
//           </Link>. If you’ve made purchases as a guest, please check your email for order confirmation details. For further assistance, feel free to{" "}
//           <Link href="/contact" className="underline text-[var(--orange)]">
//             contact us
//           </Link>.
//         </p>
//       </main>
//     );
//   }

//   if (loading) {
//     return (
//       <main className={styles.ordersContainer}>
//         <p className="text-black">Loading your orders...</p>
//       </main>
//     );
//   }

//   if (error) {
//     return (
//       <main className={styles.ordersContainer}>
//         <p className="text-red-500">{error}</p>
//       </main>
//     );
//   }

//   if (orders.length === 0) {
//     return (
//       <main className={styles.ordersContainer}>
//         <h1 className="text-3xl font-bold mb-6 text-black">My Orders</h1>
//         <p className="text-black">
//           You haven’t placed any orders yet.{" "}
//           <Link href="/store" className="underline text-[var(--orange)]">
//             Start shopping now!
//           </Link>
//         </p>
//       </main>
//     );
//   }

//   return (
//     <main className={styles.ordersContainer}>
//       <h1 className="text-3xl font-bold mb-6 text-black">My Orders</h1>
//       <div className={styles.orderList}>
//         {orders.map((order) => {
//           const isExpanded = expandedOrderId === order.id;
//           const canCancel = isWithin24Hours(order.createdAt);
//           return (
//             <div key={order.id} className={styles.orderItem}>
//               <div
//                 className={styles.orderHeader}
//                 onClick={() => toggleOrder(order.id)}
//               >
//                 <span>Order #{order.order_number}</span>
//                 <span>{new Date(order.createdAt).toLocaleDateString()}</span>
//               </div>
//               <div
//                 className={`${styles.orderDetails} ${
//                   isExpanded ? styles.expanded : styles.collapsed
//                 }`}
//               >
//                 <div className={styles.orderInfo}>
//                   <p>
//                     <strong>Status:</strong> {order.status}
//                   </p>
//                   <p>
//                     <strong>Total:</strong> ${order.total.toFixed(2)}
//                   </p>
//                 </div>
//                 <div className={styles.itemsList}>
//                   {order.order_items.map((item) => (
//                     <div key={item.id} className={styles.item}>
//                       <p>
//                         <strong>{item.product.name}</strong> - Quantity: {item.quantity}, Price: ${item.price.toFixed(2)}
//                       </p>
//                       {item.order_item_parts.length > 0 && (
//                         <div className={styles.colorSelections}>
//                           {item.order_item_parts.map((part) => {
//                             const backgroundStyle =
//                               part.color.hex_codes.length > 0
//                                 ? part.color.type === "rainbow" && part.color.hex_codes.length >= 2
//                                   ? `linear-gradient(to right, ${part.color.hex_codes
//                                       .map((h) => h.hex_code)
//                                       .join(", ")})`
//                                   : part.color.hex_codes[0].hex_code
//                                 : "#ccc";
//                             return (
//                               <div key={part.id} className={styles.colorBubbleContainer}>
//                                 <span>{part.product_part.name}:</span>
//                                 <div
//                                   className={styles.colorBubble}
//                                   style={{ background: backgroundStyle }}
//                                 />
//                                 <div className={styles.colorTooltip}>
//                                   <p>{part.color.name}</p>
//                                   {part.color.hex_codes.map((h, index) => (
//                                     <p key={index}>
//                                       {h.name}: {h.hex_code}
//                                     </p>
//                                   ))}
//                                   <p>Type: {part.color.type}</p>
//                                 </div>
//                               </div>
//                             );
//                           })}
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//                 {canCancel && (
//                   <p className={styles.cancellationMessage}>
//                     This order was placed within the last 24 hours. To cancel, please{" "}
//                     <Link href="/contact" className="underline text-[var(--orange)]">
//                       contact us
//                     </Link>.
//                   </p>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </main>
//   );
// }

export default function MyOrdersPage(): JSX.Element {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-dark-navy p-10 text-black dark:text-white">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md max-w-lg w-full">
        <h1 className="text-3xl font-bold mb-4 text-orange-500">My Orders</h1>
        <p>Order functionality is temporarily disabled.</p>
      </div>
    </main>
  );
}