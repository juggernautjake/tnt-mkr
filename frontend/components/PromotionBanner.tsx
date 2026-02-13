import React from "react";
import { useRouter } from "next/navigation";
import styles from "./PromotionBanner.module.css";

interface Product {
  id: number;
  name: string;
  default_price: number;
  effective_price: number;
  slug: string;
}

interface Promotion {
  id: number;
  name: string;
  end_date: string;
  discount_percentage?: number;
  discount_amount?: number;
  products?: Product[];
  discount_codes?: { code: string }[];
}

export default function PromotionBanner({ promotion }: { promotion: Promotion }) {
  const router = useRouter();

  const handleClick = () => {
    if (promotion.products && promotion.products.length > 0) {
      router.push(`/store/${promotion.products[0].slug}`);
    } else {
      router.push("/store");
    }
  };

  const calculateDiscountedPrice = (price: number, discountPercentage?: number, discountAmount?: number) => {
    let discountedPrice = price;
    if (discountPercentage) {
      const discount = price * (discountPercentage / 100);
      discountedPrice = price - discount;
      discountedPrice = Math.floor(discountedPrice) + 0.99;
    } else if (discountAmount) {
      discountedPrice = price - discountAmount;
    }
    return discountedPrice > 0 ? discountedPrice : 0;
  };

  if (!promotion) {
    return null;
  }

  let displayText = "";
  let originalPrice = 0;
  let discountedPrice = 0;
  let hasDiscount = false;

  if (promotion.products && promotion.products.length > 0) {
    const product = promotion.products[0];
    originalPrice = product.default_price;
    // Calculate discounted price using promotion details if available, otherwise use effective_price
    if (promotion.discount_percentage || promotion.discount_amount) {
      discountedPrice = calculateDiscountedPrice(product.default_price, promotion.discount_percentage, promotion.discount_amount);
    } else {
      discountedPrice = product.effective_price || product.default_price;
    }
    hasDiscount = discountedPrice < originalPrice;
    displayText = `${product.name} now just $${discountedPrice.toFixed(2)}${hasDiscount ? ` (was $${originalPrice.toFixed(2)})` : ""} during our ${promotion.name}. Offer ends ${new Date(promotion.end_date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}—RESERVE YOURS NOW!`;
  } else if (promotion.discount_codes && promotion.discount_codes.length > 0) {
    displayText = `${promotion.name}: Use code ${promotion.discount_codes[0].code} for a special discount!`;
  } else {
    displayText = promotion.name;
  }

  return (
    <div className={styles.promotionBanner} onClick={handleClick}>
      {promotion.products && promotion.products.length > 0 ? (
        <p className="font-semibold">
          <span className="text-white">{promotion.products[0].name}</span> now just{" "}
          {hasDiscount && (
            <span className={`line-through text-white ${styles.customStrikethrough}`}>
              ${originalPrice.toFixed(2)}
            </span>
          )}{" "}
          <span className="text-white text-xl">${discountedPrice.toFixed(2)}</span>{" "}
          during our {promotion.name}. Offer ends{" "}
          {new Date(promotion.end_date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}—{" "}
          <span className="text-white uppercase">RESERVE YOURS NOW!</span>
        </p>
      ) : promotion.discount_codes && promotion.discount_codes.length > 0 ? (
        <p className="font-semibold">
          {promotion.name}: Use code <strong>{promotion.discount_codes[0].code}</strong> for a special discount!
        </p>
      ) : (
        <p className="font-semibold">{promotion.name}</p>
      )}
    </div>
  );
}