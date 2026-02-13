/**
 * Shared order population patterns to avoid duplication across controllers.
 */

/** Full order populate — used when all relations are needed (status updates, emails, etc.) */
export const ORDER_POPULATE_FULL = {
  shipping_address: true,
  billing_address: true,
  order_items: {
    populate: {
      product: true,
      order_item_parts: { populate: ['product_part', 'color'] },
    },
  },
  user: true,
} as const;

/** Order populate with shipping box — used in admin order views */
export const ORDER_POPULATE_ADMIN = {
  ...ORDER_POPULATE_FULL,
  shipping_box: true,
} as const;

/** Cart items populate — used when fetching active carts */
export const CART_ITEMS_POPULATE = {
  cart_items: {
    populate: {
      product: {
        populate: ['thumbnail_image', 'promotions'],
      },
      cart_item_parts: {
        populate: ['product_part', 'color'],
      },
    },
  },
} as const;

/** Webhook order populate — includes all relations for email/processing */
export const ORDER_POPULATE_WEBHOOK = [
  'user',
  'shipping_address',
  'billing_address',
  'order_items.product',
  'order_items.order_item_parts.product_part',
  'order_items.order_item_parts.color',
  'order_items.promotions',
  'shipping_method',
] as const;
