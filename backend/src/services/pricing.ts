/**
 * Shared pricing service — calculates effective prices for cart items.
 * Uses batch loading to avoid N+1 queries.
 */

function roundTo99Cents(price: number): number {
  const dollars = Math.floor(price);
  const cents = price - dollars;
  if (cents === 0.99) {
    return price;
  }
  return dollars + 0.99;
}

/**
 * Filter active promotions from a pre-loaded promotions array.
 * Used in order creation where promotions are already populated on the product.
 */
export function filterActivePromotions(promotions: any[], currentDate: string): any[] {
  return promotions.filter(
    (promo: any) => promo.start_date <= currentDate && promo.end_date >= currentDate && promo.publishedAt
  );
}

/**
 * Apply promotions to a product's default_price, returning the effective price.
 */
function applyPromotions(product: any, activePromotions: any[]): number {
  let effectivePrice = product.default_price;

  activePromotions.forEach((promotion: any) => {
    if (promotion.discount_percentage) {
      const discount = product.default_price * (promotion.discount_percentage / 100);
      effectivePrice = Math.min(effectivePrice, product.default_price - discount);
    } else if (promotion.discount_amount) {
      effectivePrice = Math.min(effectivePrice, product.default_price - promotion.discount_amount);
    }
  });

  if (activePromotions.length === 0 && product.on_sale && product.discounted_price) {
    effectivePrice = product.discounted_price;
  }

  return Number(effectivePrice.toFixed(2));
}

/**
 * Calculate the effective price for a single cart item using pre-loaded data.
 * This is the in-memory version — no DB calls.
 */
function calculateItemPrice(
  item: any,
  productMap: Map<number, any>,
  partMap: Map<number, any>,
  currentDate: string
): number {
  // Additional part purchase — price comes from the part itself
  if (item.is_additional_part && item.cart_item_parts && item.cart_item_parts.length === 1) {
    const partId = item.cart_item_parts[0].product_part?.id;
    if (!partId) return item.effective_price || 0;

    const part = partMap.get(partId);
    if (!part) return item.effective_price || 0;

    let effectivePrice = part.discounted_price && part.discounted_price < part.price
      ? part.discounted_price
      : part.price;

    if (part.discounted_price && part.discounted_price < part.price) {
      effectivePrice = roundTo99Cents(effectivePrice);
    }

    return Number(effectivePrice.toFixed(2));
  }

  // Full product purchase
  if (!item.product?.id) return item.effective_price || 0;

  const product = productMap.get(item.product.id);
  if (!product) return item.effective_price || 0;

  const activePromotions = filterActivePromotions(product.promotions || [], currentDate);
  return applyPromotions(product, activePromotions);
}

/**
 * Calculate total for an array of cart items.
 * Batch-loads all products and parts upfront (2 queries max instead of 2-3N).
 */
export async function calculateCartTotal(strapi: any, cartItems: any[]): Promise<number> {
  if (cartItems.length === 0) return 0;

  const currentDate = new Date().toISOString().split('T')[0];

  // Collect unique IDs to batch-load
  const productIds = new Set<number>();
  const partIds = new Set<number>();

  for (const item of cartItems) {
    if (item.is_additional_part && item.cart_item_parts?.length === 1) {
      const partId = item.cart_item_parts[0].product_part?.id;
      if (partId) partIds.add(partId);
    } else if (item.product?.id) {
      productIds.add(item.product.id);
    }
  }

  // Batch-load all products and parts in parallel (2 queries total)
  const [products, parts] = await Promise.all([
    productIds.size > 0
      ? strapi.db.query('api::product.product').findMany({
          where: { id: { $in: [...productIds] } },
          populate: ['promotions'],
        })
      : [],
    partIds.size > 0
      ? strapi.db.query('api::product-part.product-part').findMany({
          where: { id: { $in: [...partIds] } },
        })
      : [],
  ]);

  const productMap = new Map(products.map((p: any) => [p.id, p]));
  const partMap = new Map(parts.map((p: any) => [p.id, p]));

  let total = 0;
  for (const item of cartItems) {
    const price = calculateItemPrice(item, productMap, partMap, currentDate);
    total += price * (item.quantity || 1);
  }
  return Number(total.toFixed(2));
}
