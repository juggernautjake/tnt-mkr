"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuthContext } from "../context/AuthContext";
import styles from "./ProductWidget.module.css";
import Link from "next/link";
import { v4 as uuidv4 } from 'uuid';

interface Color {
  id: number;
  name: string;
  hex_code: string;
}

interface ProductPart {
  id: number;
  name: string;
  colors: Color[];
}

interface Product {
  id: number;
  name: string;
  default_price: number;
  effective_price: number;
  slug: string;
  on_sale: boolean;
  product_parts: ProductPart[];
  thumbnail_url?: string;
  is_preorder_sale?: boolean;
}

interface ProductWidgetProps {
  product: Product;
  triggerNotification: (message: string) => void;
}

export default function ProductWidget({ product, triggerNotification }: ProductWidgetProps) {
  const router = useRouter();
  const { isAuthenticated, token, guestSessionId, setGuestSessionId } = useAuthContext();

  const handleAddToCart = async (redirectToCheckout: boolean = false) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const headers = {
      "Content-Type": "application/json",
      ...(isAuthenticated && token ? { Authorization: `Bearer ${token}` } : {}),
      ...(guestSessionId ? { 'x-guest-session': guestSessionId } : {}),
    };

    try {
      let currentGuestSessionId = guestSessionId;
      if (!isAuthenticated && !currentGuestSessionId) {
        currentGuestSessionId = uuidv4();
        setGuestSessionId(currentGuestSessionId);
        localStorage.setItem('guestSessionId', currentGuestSessionId);
      }

      const cartResponse = await axios.get(
        `${apiUrl}/api/carts?filters[status][$eq]=active${!isAuthenticated && currentGuestSessionId ? `&filters[guest_session][$eq]=${currentGuestSessionId}` : ''}&populate=cart_items`,
        { headers, withCredentials: true }
      );

      let cart = Array.isArray(cartResponse.data.data) ? cartResponse.data.data[0] : cartResponse.data.data;
      if (!cart?.id) {
        const newCartResponse = await axios.post(
          `${apiUrl}/api/carts`,
          { data: { status: "active", guest_session: currentGuestSessionId, total: "0.00" } },
          { headers, withCredentials: true }
        );
        cart = newCartResponse.data.data;
        if (!cart?.id) throw new Error("Failed to create active cart");
        localStorage.setItem('cartId', cart.id.toString());
      }

      const customizations = product.product_parts
        .filter(part => part.colors && part.colors.length > 0)
        .map(part => ({
          product_part: { id: part.id },
          color: { id: part.colors[0].id },
        }));

      const newItemData = {
        product: product.id,
        quantity: 1,
        base_price: product.default_price,
        effective_price: product.effective_price,
        customizations,
        cart: cart.id,
      };

      const newItemResponse = await axios.post(
        `${apiUrl}/api/cart-items`,
        { data: newItemData },
        { headers, withCredentials: true }
      );

      if (!newItemResponse.data?.data?.id) {
        throw new Error("Failed to create cart item: Invalid response");
      }

      window.dispatchEvent(new Event("cartUpdated"));
      const selectedColorNames = product.product_parts
        .filter(part => part.colors && part.colors.length > 0)
        .map(part => `${part.name}: ${part.colors[0].name}`)
        .join(", ") || "No customizations";
      triggerNotification(`${product.name} Added! Price: $${product.effective_price.toFixed(2)}. Customizations: ${selectedColorNames}. This item is now in your cart.`);

      if (redirectToCheckout) {
        router.push("/checkout");
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      let errorMessage = "Unknown error";
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data?.error?.message || err.message;
      }
      triggerNotification(`Error: Failed to add ${product.name}. ${errorMessage}`);
    }
  };

  return (
    <div className={styles.productWidget}>
      {product.on_sale && (
        <div className={styles.saleBubble}>
          <span className={styles.saleText}>
            {product.is_preorder_sale ? "PREORDER SALE!" : "ON SALE!"}
          </span>
        </div>
      )}
      <div className={styles.productInfo}>
        <h3 className={styles.productName}>{product.name}</h3>
        <p className={styles.productPrice}>
          <span>$</span>
          <strong>
            {product.effective_price.toFixed(2)}
          </strong>
          {product.on_sale && (
            <span className={styles.strikethrough}>${product.default_price.toFixed(2)}</span>
          )}
        </p>
        {product.thumbnail_url && (
          <Link href={`/store/${product.slug}`}>
            <Image src={product.thumbnail_url} alt={product.name} className={styles.productImage} width={300} height={400} unoptimized />
          </Link>
        )}
        <div className={styles.actionButtons}>
          <button className={styles.cartButton} onClick={() => handleAddToCart(false)}>
            Add to Cart
          </button>
          <button className={styles.buyButton} onClick={() => handleAddToCart(true)}>
            Buy Now
          </button>
        </div>
        <a href={`/store/${product.slug}`} className={styles.productPageLink}>
          Go to Product Page
        </a>
      </div>
    </div>
  );
}