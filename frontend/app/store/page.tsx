"use client";

import React, { useState, useEffect } from "react";
import ProductWidget from "../../components/ProductWidget";
import axios from "axios";
import { useNavbarHeight } from "../../hooks/useNavbarHeight";
import LoadingIndicator from "../../components/LoadingIndicator";
import type { StoreProduct, SimpleProductPart, SimpleColor } from "../../lib/types";

async function fetchProducts(): Promise<StoreProduct[]> {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
      params: {
        populate: "product_parts,product_parts.colors,thumbnail_image,promotions",
        "filters[publishedAt][$ne]": null,
      },
    });

    const rawData = response.data.data || response.data;

    if (!Array.isArray(rawData) || rawData.length === 0) {
      return [];
    }

    const products: StoreProduct[] = rawData.map((item: any) => ({
      id: item.id ?? 0,
      name: item.name ?? "Unnamed Product",
      default_price: item.default_price ? parseFloat(item.default_price) : 0,
      effective_price: item.effective_price ? parseFloat(item.effective_price) : 0,
      slug: item.slug ?? "",
      on_sale: item.on_sale ?? false,
      product_parts: item.product_parts?.map((part: any) => ({
        id: part.id,
        name: part.name,
        colors: part.colors?.map((color: any) => ({
          id: color.id,
          name: color.name,
          hex_code: color.hex_code,
        })) || [],
      })) || [],
      thumbnail_url: item.thumbnail_image?.url || "/placeholder.jpg",
      is_preorder_sale: item.is_preorder_sale || false,
    }));

    return products;
  } catch (error) {
    console.error("[ERROR] Failed to fetch products:", error);
    return [];
  }
}

export default function StorePage(): JSX.Element {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navbarHeight = useNavbarHeight();
  const notificationTop = navbarHeight + 10;

  useEffect(() => {
    fetchProducts()
      .then((fetchedProducts) => {
        setProducts(fetchedProducts);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
        setProducts([]);
        setLoading(false);
      });
  }, []);

  function triggerNotification(message: string) {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
  }

  return (
    <main
      className="flex flex-col items-center w-full min-h-screen text-[var(--orange)] relative"
      style={{
        background: 'var(--page-background)',
        fontFamily: "'Roboto', sans-serif"
      }}
    >
      {showNotification && (
        <div
          className="fixed right-4 z-50 cart-notification"
          style={{ top: `${notificationTop}px`, minWidth: "220px" }}
          role="status"
          aria-live="polite"
        >
          <p>{notificationMessage}</p>
        </div>
      )}
      <div className="text-center mt-10 mb-6 px-4 md:mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">Our Store</h1>
      </div>
      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : products.length === 0 ? (
        <p>No published products available at this time. Please check back later.</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-6 px-4">
          {products.map((product) => (
            <ProductWidget
              key={product.id}
              product={product}
              triggerNotification={triggerNotification}
            />
          ))}
        </div>
      )}
    </main>
  );
}