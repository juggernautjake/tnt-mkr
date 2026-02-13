/**
 * Shared pricing service — extracted from cart controller.
 * Calculates effective prices for cart items considering promotions and discounts.
 */

async function roundTo99Cents(price: number): Promise<number> {
  const dollars = Math.floor(price);
  const cents = price - dollars;
  if (cents === 0.99) {
    return price;
  }
  return dollars + 0.99;
}

/**
 * Calculate the effective price for a single cart item, considering:
 * - Additional part pricing (uses product_part price)
 * - Active promotions (percentage or fixed amount discounts)
 * - On-sale / discounted prices as fallback
 */
export async function calculateEffectivePriceForCartItem(strapi: any, item: any): Promise<number> {
  // Additional part purchase — price comes from the part itself
  if (item.is_additional_part && item.cart_item_parts && item.cart_item_parts.length === 1) {
    const partData = item.cart_item_parts[0].product_part;
    if (!partData?.id) {
      return item.effective_price || 0;
    }

    const part = await strapi.entityService.findOne('api::product-part.product-part', partData.id, {});
    if (!part) {
      return item.effective_price || 0;
    }

    let effectivePrice = part.discounted_price && part.discounted_price < part.price
      ? part.discounted_price
      : part.price;

    if (part.discounted_price && part.discounted_price < part.price) {
      effectivePrice = await roundTo99Cents(effectivePrice);
    }

    return Number(effectivePrice.toFixed(2));
  }

  // Full product purchase
  if (!item.product?.id) {
    return item.effective_price || 0;
  }

  const currentDate = new Date().toISOString().split('T')[0];

  const product = await strapi.entityService.findOne('api::product.product', item.product.id, {
    populate: ['promotions'],
  });

  if (!product) {
    return item.effective_price || 0;
  }

  let effectivePrice = product.default_price;

  const promotions = await strapi.db.query('api::promotion.promotion').findMany({
    where: {
      products: { id: item.product.id },
      start_date: { $lte: currentDate },
      end_date: { $gte: currentDate },
      publishedAt: { $ne: null },
    },
  });

  promotions.forEach((promotion: any) => {
    if (promotion.discount_percentage) {
      const discount = product.default_price * (promotion.discount_percentage / 100);
      effectivePrice = Math.min(effectivePrice, product.default_price - discount);
    } else if (promotion.discount_amount) {
      effectivePrice = Math.min(effectivePrice, product.default_price - promotion.discount_amount);
    }
  });

  if (promotions.length === 0 && product.on_sale && product.discounted_price) {
    effectivePrice = product.discounted_price;
  }

  return Number(effectivePrice.toFixed(2));
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
 * Calculate total for an array of cart items using effective pricing.
 */
export async function calculateCartTotal(strapi: any, cartItems: any[]): Promise<number> {
  let total = 0;
  for (const item of cartItems) {
    const effectivePrice = await calculateEffectivePriceForCartItem(strapi, item);
    total += effectivePrice * (item.quantity || 1);
  }
  return Number(total.toFixed(2));
}
