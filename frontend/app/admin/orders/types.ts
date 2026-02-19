export interface Address {
  street: string;
  street2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface OrderItemPart {
  product_part: { id: number; name: string };
  color: { id: number; name: string };
}

export interface OrderItem {
  id: number;
  product: { id: number; name: string };
  quantity: number;
  price: number;
  is_additional_part?: boolean;
  order_item_parts: OrderItemPart[];
}

export interface ShippingBox {
  id: number;
  name: string;
  length: number;
  width: number;
  height: number;
  empty_weight_oz: number;
}

export interface Order {
  id: number;
  order_number: string;
  ordered_at: string;
  shipped_at?: string;
  customer_name: string;
  customer_email?: string;
  guest_email?: string;
  customer_phone?: string;
  order_status: string;
  payment_status: string;
  total_amount: number;
  subtotal: number;
  shipping_cost: number;
  sales_tax: number;
  discount_total?: number;
  tracking_number?: string;
  carrier_service?: string;
  estimated_delivery_date?: string;
  package_weight_oz?: number;
  package_length?: number;
  package_width?: number;
  package_height?: number;
  shipping_address?: Address;
  order_items: OrderItem[];
  shipping_box?: ShippingBox;
  admin_notes?: string;
  admin_hidden?: boolean;
  shipping_notification_sent?: boolean;
  user?: { id: number; email: string };
  label_url?: string;
  label_format?: string;
  label_purchased_at?: string;
  easypost_shipment_id?: string;
}

export interface LabelRate {
  id: string;
  carrier: string;
  service: string;
  rate: number;
  delivery_days?: number;
  delivery_date?: string;
  est_delivery_days?: number;
}

// Statuses that indicate the order is past the packaged stage
export const POST_PACKAGED_STATUSES = ['shipped', 'in_transit', 'out_for_delivery', 'delivered'];

export interface PackageCalculation {
  calculated_packages: Array<{
    weight_oz: number;
    length: number;
    width: number;
    height: number;
    box_name: string;
    box_priority: number;
    items_count: number;
  }>;
  recommended_box: ShippingBox | null;
  available_boxes: ShippingBox[];
  current_package?: {
    weight_oz: number;
    length: number;
    width: number;
    height: number;
    box: ShippingBox | null;
  };
}

export interface OrderStats {
  preparation: number;
  packaged: number;
  in_transit: number;
  delivered: number;
  total: number;
}

export interface PendingStatusChange {
  orderId: number;
  currentStatus: string;
  newStatus: string;
  order: Order;
}

export interface UpdateStatusBody {
  order_status: string;
  send_email: boolean;
  tracking_number?: string;
  carrier_service?: string;
  force?: boolean;
}

// Unified status options combining packing and shipping stages
export const UNIFIED_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', emoji: '⏳' },
  { value: 'paid', label: 'Paid', emoji: '💰' },
  { value: 'printing', label: 'Printing', emoji: '🖨️' },
  { value: 'printed', label: 'Printed', emoji: '📄' },
  { value: 'assembling', label: 'Assembling', emoji: '🔧' },
  { value: 'packaged', label: 'Packaged & Ready', emoji: '📦' },
  { value: 'shipped', label: 'Shipped', emoji: '🚚' },
  { value: 'in_transit', label: 'In Transit', emoji: '🛣️' },
  { value: 'out_for_delivery', label: 'Out for Delivery', emoji: '🏠' },
  { value: 'delivered', label: 'Delivered', emoji: '✅' },
  { value: 'canceled', label: 'Canceled', emoji: '❌' },
  { value: 'returned', label: 'Returned', emoji: '↩️' },
];

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  printing: 'Printing',
  printed: 'Printed',
  assembling: 'Assembling',
  packaged: 'Packaged & Ready',
  shipped: 'Shipped',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  canceled: 'Canceled',
  returned: 'Returned',
};

// Email subject and preview for each status
export const STATUS_EMAIL_INFO: Record<string, { subject: string; preview: string }> = {
  pending: {
    subject: 'Order Received - We Got Your Order!',
    preview: 'Thank you for your order! We have received it and will begin processing shortly.',
  },
  paid: {
    subject: 'Payment Confirmed - Your Order is Being Processed',
    preview: 'Great news! Your payment has been confirmed and we are now preparing your order.',
  },
  printing: {
    subject: 'Your Order is Being Printed',
    preview: 'Exciting update! Your custom items are now being 3D printed with care.',
  },
  printed: {
    subject: 'Printing Complete - Moving to Assembly',
    preview: 'Your items have finished printing and are now moving to our assembly team.',
  },
  assembling: {
    subject: 'Your Order is Being Assembled',
    preview: 'Your order is being carefully assembled and prepared for shipping.',
  },
  packaged: {
    subject: 'Your Order is Packaged and Ready to Ship',
    preview: 'Your order has been packaged and will be shipped very soon!',
  },
  shipped: {
    subject: 'Your Order Has Shipped!',
    preview: 'Your package is on its way! Track your delivery with the included tracking number.',
  },
  in_transit: {
    subject: 'Your Package is On Its Way',
    preview: 'Your package is currently in transit and making its way to you.',
  },
  out_for_delivery: {
    subject: 'Your Package is Out for Delivery Today!',
    preview: 'Great news! Your package is out for delivery and should arrive today.',
  },
  delivered: {
    subject: 'Your Package Has Been Delivered!',
    preview: 'Your order has been delivered. We hope you love your new items!',
  },
  canceled: {
    subject: 'Order Canceled',
    preview: 'Your order has been canceled. If you have questions, please contact us.',
  },
  returned: {
    subject: 'Order Return Processed',
    preview: 'We have received your return. Your refund will be processed shortly.',
  },
};

// ─── Formatting Helpers ─────────────────────────────────────────

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCurrency = (amount: number): string => {
  const dollars = amount / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars);
};

export const getEmail = (order: Order): string => {
  return order.customer_email || order.guest_email || order.user?.email || 'N/A';
};

export const getTrackingUrl = (trackingNumber: string, carrier: string = 'USPS'): string => {
  const upperCarrier = carrier.toUpperCase();
  if (upperCarrier === 'USPS') {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  }
  if (upperCarrier === 'UPS') {
    return `https://www.ups.com/track?tracknum=${trackingNumber}`;
  }
  if (upperCarrier === 'FEDEX') {
    return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
  }
  return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
};

// Helper to get border color class based on unified status
export const getStatusBorderClass = (status: string): string => {
  // Blue: pending through assembling (preparation stages)
  if (['pending', 'paid', 'printing', 'printed', 'assembling'].includes(status)) {
    return 'borderBlue';
  }
  // Orange: packaged
  if (status === 'packaged') {
    return 'borderOrange';
  }
  // Yellow: shipped, in_transit, out_for_delivery
  if (['shipped', 'in_transit', 'out_for_delivery'].includes(status)) {
    return 'borderYellow';
  }
  // Green: delivered
  if (status === 'delivered') {
    return 'borderGreen';
  }
  // Red: canceled
  if (status === 'canceled') {
    return 'borderRed';
  }
  // Purple: returned
  if (status === 'returned') {
    return 'borderPurple';
  }
  return '';
};
