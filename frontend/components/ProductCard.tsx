import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./ProductCard.module.css";

interface Product {
  id: number;
  name: string;
  default_price: number;
  effective_price: number;
  slug: string;
  thumbnailUrl: string;
  on_sale: boolean;
  is_preorder_sale?: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/store/${product.slug}`} className={styles.productCard}>
      {product.on_sale && (
        <div className={styles.saleBubble}>
          <span className={styles.saleText}>
            {product.is_preorder_sale ? "PREORDER SALE!" : "ON SALE!"}
          </span>
        </div>
      )}
      <h3 className={styles.productName}>{product.name}</h3>
      <div className={styles.imageContainer}>
        <Image src={product.thumbnailUrl} alt={product.name} className={styles.productImage} width={300} height={400} unoptimized />
      </div>
      <p className={styles.productPrice}>
        {product.on_sale ? (
          <>
            <strong>${product.effective_price.toFixed(2)} </strong>
            <span className={styles.strikethrough}>${product.default_price.toFixed(2)}</span>
          </>
        ) : (
          <strong>${product.default_price.toFixed(2)}</strong>
        )}
      </p>
    </Link>
  );
}