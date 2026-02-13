/**
 * Shared TypeScript interfaces for the TNT MKR frontend.
 * Centralizes types used across multiple pages and components
 * to eliminate duplication and ensure consistency.
 */

// ─── Color & Product Parts ──────────────────────────────────────

export interface HexCode {
  hex_code: string;
  name: string;
}

export interface Color {
  id: number;
  name: string;
  hex_codes: HexCode[];
  type: 'standard' | 'metallic' | 'rainbow';
}

/** Simplified color (used on store listing page) */
export interface SimpleColor {
  id: number;
  name: string;
  hex_code: string;
}

export interface ProductPart {
  id: number;
  name: string;
  description?: string;
  price: number;
  discounted_price?: number;
  colors: Color[];
}

/** Simplified product part (used on store listing page) */
export interface SimpleProductPart {
  id: number;
  name: string;
  colors: SimpleColor[];
}

// ─── Media & Devices ────────────────────────────────────────────

export interface Media {
  id: number;
  url: string;
  name?: string;
}

export interface Device {
  id: number;
  brand: string;
  model: string;
}

// ─── Products ───────────────────────────────────────────────────

/** Full product (used on product detail page) */
export interface Product {
  id: number;
  name: string;
  description?: string;
  default_price: number;
  effective_price: number;
  on_sale: boolean;
  is_preorder_sale?: boolean;
  product_parts: ProductPart[];
  case_image_files?: Media[];
  thumbnail_image?: Media;
  slug: string;
  device?: Device;
}

/** Product card display (used on homepage and store listing) */
export interface ProductListItem {
  id: number;
  name: string;
  default_price: number;
  effective_price: number;
  slug: string;
  thumbnailUrl: string;
  is_preorder_sale: boolean;
  on_sale: boolean;
}

/** Store listing product (includes parts for widget customization) */
export interface StoreProduct {
  id: number;
  name: string;
  default_price: number;
  effective_price: number;
  slug: string;
  on_sale: boolean;
  product_parts: SimpleProductPart[];
  thumbnail_url?: string;
  is_preorder_sale?: boolean;
}

/** Related product (shown on product detail page) */
export interface RelatedProduct {
  id: number;
  name: string;
  default_price: number;
  thumbnail_image?: Media;
  slug: string;
}

// ─── Promotions ─────────────────────────────────────────────────

export interface DiscountCode {
  code: string;
}

export interface Promotion {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  discount_percentage?: number;
  discount_amount?: number;
  products?: ProductListItem[];
  discount_codes?: DiscountCode[];
  terms_and_conditions?: string;
  is_preorder?: boolean;
}

// ─── Cart ───────────────────────────────────────────────────────

export interface CartItemPart {
  id: number;
  product_part: { id: number; name: string };
  color: Color;
}

export interface CartItem {
  id: string;
  quantity: number;
  price: number;
  base_price: number;
  is_additional_part: boolean;
  product: {
    id: string;
    name: string;
    default_price: number;
    discounted_price?: number;
    on_sale: boolean;
    thumbnail_image?: { url: string };
    product_parts: ProductPart[];
  };
  cart_item_parts: CartItemPart[];
}

export interface Cart {
  id: string;
  total: number;
  cart_items: CartItem[];
}

// ─── Checkout ───────────────────────────────────────────────────

export interface CheckoutCartItem {
  id: string;
  productId: number;
  productName: string;
  price: number;
  base_price: number;
  quantity: number;
  is_additional_part: boolean;
  cart_item_parts: {
    id: number;
    product_part: { id: number; name: string };
    color: { id: number; name: string; hex_codes: HexCode[]; type: string };
  }[];
  productOnSale: boolean;
  thumbnailUrl: string;
}

export interface ShippingAddress {
  street: string;
  street2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
}

export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface ShippingRate {
  id: string;
  carrier: string;
  service: string;
  rate_cents: number;
  rate_with_handling_cents: number;
  estimated_delivery_days: number | null;
  estimated_delivery_date: string | null;
  delivery_guarantee: boolean;
}

// ─── Order Confirmation ────────────────────────────────────────

export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  base_price?: number;
  is_additional_part?: boolean;
  product: { id: number; name: string };
  order_item_parts: CartItemPart[];
  promotions: { id: number; name: string }[];
}

export interface OrderData {
  id: number;
  order_number: string;
  customer_name: string;
  total_amount: number;
  subtotal: number;
  shipping_cost: number;
  sales_tax: number;
  discount_total: number;
  transaction_fee: number;
  carrier_service: string;
  estimated_delivery_date: string | null;
  shipping_address: {
    street: string;
    street2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
  billing_address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  payment_last_four: string;
  ordered_at: string;
  order_items: OrderItem[];
}

// ─── API Helpers ────────────────────────────────────────────────

export interface AuthHeaders {
  [key: string]: string | undefined;
  'Content-Type'?: string;
  Authorization?: string;
  'x-guest-session'?: string;
}
