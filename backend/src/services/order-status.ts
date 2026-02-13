/**
 * Shared order status types, state machine, and mapping logic.
 * Extracted from shipping controller to be reusable across the codebase.
 */

export type OrderStatus = 'pending' | 'paid' | 'printing' | 'printed' | 'assembling' | 'packaged' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'canceled' | 'returned';

export const ALL_ORDER_STATUSES: OrderStatus[] = [
  'pending', 'paid', 'printing', 'printed', 'assembling', 'packaged',
  'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'canceled', 'returned',
];

/** State machine: defines which transitions are allowed for each status */
export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['paid', 'canceled'],
  paid: ['printing', 'packaged', 'shipped', 'canceled'],
  printing: ['printed', 'canceled'],
  printed: ['assembling', 'canceled'],
  assembling: ['packaged', 'canceled'],
  packaged: ['shipped', 'canceled'],
  shipped: ['in_transit', 'out_for_delivery', 'delivered', 'canceled', 'returned'],
  in_transit: ['out_for_delivery', 'delivered', 'returned'],
  out_for_delivery: ['delivered', 'returned'],
  delivered: ['returned'],
  canceled: [],
  returned: [],
};

export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  const allowed = VALID_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

/** Map EasyPost tracking status to order status */
export function mapTrackingStatusToOrderStatus(trackingStatus: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    'pre_transit': 'shipped',
    'in_transit': 'in_transit',
    'out_for_delivery': 'out_for_delivery',
    'delivered': 'delivered',
    'return_to_sender': 'returned',
    'failure': 'returned',
    'cancelled': 'canceled',
    'error': 'shipped',
    'unknown': 'shipped',
  };
  return statusMap[trackingStatus] || 'shipped';
}
