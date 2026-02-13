"use client";

import React, { useState, useEffect } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import axios from "axios";
import { useAuthContext } from "../../../context/AuthContext";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import styles from "./ProductPage.module.css";
import { useNavbarHeight } from "../../../hooks/useNavbarHeight";
import TermsAndConditionsPopup from './TermsAndConditionsPopup';
import { parseTermsAndConditionsToComponents } from './termsParser';
import { v4 as uuidv4 } from 'uuid';
import type { Product, RelatedProduct, Promotion } from "../../../lib/types";
import { buildHeaders } from "../../../lib/api";

async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products?filters[slug][$eq]=${encodeURIComponent(slug)}&filters[publishedAt][$ne]=null&populate=product_parts.colors,case_image_files,thumbnail_image,device,promotions`
    );

    let products = response.data?.data || response.data;

    if (!Array.isArray(products) || products.length === 0) {
      return null;
    }

    const productData = products[0];

    const parsedProduct = {
      id: productData.id,
      name: productData.name,
      description: productData.description,
      default_price: parseFloat(productData.default_price),
      effective_price: parseFloat(productData.effective_price),
      on_sale: productData.on_sale || false,
      is_preorder_sale: productData.is_preorder_sale || false,
      product_parts: productData.product_parts?.map((part: any) => {
        return {
          id: part.id,
          name: part.name,
          description: part.description || '',
          price: parseFloat(part.price) || 0,
          discounted_price: part.discounted_price ? parseFloat(part.discounted_price) : undefined,
          colors: part.colors?.map((color: any) => {
            return {
              id: color.id,
              name: color.name,
              hex_codes: color.hex_codes || [],
              type: color.type || 'standard',
            };
          }) || [],
        };
      }) || [],
      case_image_files: productData.case_image_files?.map((media: any) => ({
        id: media.id,
        url: media.url,
        name: media.name,
      })) || [],
      thumbnail_image: productData.thumbnail_image
        ? {
            id: productData.thumbnail_image.id,
            url: productData.thumbnail_image.url,
            name: productData.thumbnail_image.name,
          }
        : undefined,
      slug: productData.slug,
      device: productData.device
        ? {
            id: productData.device.id,
            brand: productData.device.brand,
            model: productData.device.model,
          }
        : undefined,
    };

    return parsedProduct;
  } catch (err) {
    console.error("[ERROR] fetchProduct - Error fetching product:", err);
    return null;
  }
}

async function fetchActivePromotions(): Promise<Promotion[]> {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/promotions`, {
      params: {
        populate: "products,discount_codes,products.thumbnail_image",
        "filters[start_date][$lte]": new Date().toISOString().split("T")[0],
        "filters[end_date][$gte]": new Date().toISOString().split("T")[0],
      },
    });
    const rawData = response.data.data || response.data;
    if (!Array.isArray(rawData)) {
      console.error("[ERROR] fetchActivePromotions - Unexpected API response structure:", rawData);
      return [];
    }
    const promotions = rawData.map((item: any) => {
      const attributes = item.attributes || {};
      const promo = {
        id: item.id,
        name: attributes.name,
        start_date: attributes.start_date,
        end_date: attributes.end_date,
        discount_percentage: attributes.discount_percentage ? parseFloat(attributes.discount_percentage) : undefined,
        discount_amount: attributes.discount_amount ? parseFloat(attributes.discount_amount) : undefined,
        products: attributes.products?.data?.map((prod: any) => {
          const prodAttributes = prod.attributes || {};
          return {
            id: prod.id,
            name: prodAttributes.name,
            default_price: parseFloat(prodAttributes.default_price) || 0,
            effective_price: parseFloat(prodAttributes.effective_price) || 0,
            slug: prodAttributes.slug,
            thumbnail_url: prodAttributes.thumbnail_image?.data?.attributes?.url ?? "/placeholder.jpg",
          };
        }) || [],
        discount_codes: attributes.discount_codes?.data?.map((code: any) => ({
          code: code.attributes?.code || code.code,
        })) || [],
        terms_and_conditions: attributes.terms_and_conditions || null,
        is_preorder: attributes.is_preorder || false,
      };
      return promo;
    });
    return promotions;
  } catch (error) {
    console.error("[ERROR] fetchActivePromotions - Failed to fetch promotions:", error);
    return [];
  }
}

async function fetchRelatedProducts(slug: string): Promise<RelatedProduct[]> {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
      params: {
        "pagination[limit]": 5,
        populate: "thumbnail_image",
        "filters[publishedAt][$ne]": null,
      },
    });

    const related = response.data?.data || response.data;
    const mappedRelated = related
      .filter((item: any) => item.slug !== slug)
      .map((item: any) => ({
        id: item.id,
        name: item.name,
        default_price: parseFloat(item.default_price),
        thumbnail_image: item.thumbnail_image
          ? {
              id: item.thumbnail_image.id,
              url: item.thumbnail_image.url,
              name: item.thumbnail_image.name,
            }
          : undefined,
        slug: item.slug,
      }));
    return mappedRelated;
  } catch (err) {
    console.error("[ERROR] fetchRelatedProducts - Error fetching related products:", err);
    return [];
  }
}

export default function ProductPage() {
  const router = useRouter();
  const { slug } = useParams() as { slug: string };
  const { isAuthenticated, token, guestSessionId, setGuestSessionId } = useAuthContext();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [selectedColors, setSelectedColors] = useState<{ [partId: number]: number }>({});
  const [openParts, setOpenParts] = useState<{ [partId: number]: boolean }>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promotionEndDate, setPromotionEndDate] = useState<string | null>(null);
  const [termsAndConditions, setTermsAndConditions] = useState<string | null>(null);
  const [showTermsPopup, setShowTermsPopup] = useState(false);

  const navbarHeight = useNavbarHeight();
  const notificationTop = navbarHeight + 10;

  useEffect(() => {
    if (!slug) return;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [fetchedProduct, promos, related] = await Promise.all([
          fetchProduct(slug),
          fetchActivePromotions(),
          fetchRelatedProducts(slug),
        ]);

        if (!fetchedProduct) {
          notFound();
          return;
        }

        const currentDate = new Date().toISOString().split('T')[0];
        const activePromos = promos.filter(
          (promo) => promo.start_date <= currentDate && promo.end_date >= currentDate
        );

        let earliestEndDate: string | null = null;
        let promoTerms: string | null = null;

        for (const promo of activePromos) {
          const appliesToProduct = promo.products?.some((promoProduct) => promoProduct.id === fetchedProduct.id);
          if (appliesToProduct) {
            if (!earliestEndDate || promo.end_date < earliestEndDate) {
              earliestEndDate = promo.end_date;
              promoTerms = promo.terms_and_conditions ?? null;
            }
          }
        }

        setProduct(fetchedProduct);
        setPromotionEndDate(earliestEndDate);
        setTermsAndConditions(promoTerms);

        const initialColors: { [partId: number]: number } = {};
        fetchedProduct.product_parts.forEach((part) => {
          if (part.colors.length > 0) {
            initialColors[part.id] = part.colors[0].id;
          }
        });
        setSelectedColors(initialColors);
        setRelatedProducts(related);
      } catch (err) {
        console.error("[ERROR] fetchData - Error fetching data:", err);
        setError("Failed to load product. Please try again later.");
        notFound();
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  const handleColorSelect = (partId: number, colorId: number) => {
    setSelectedColors((prev) => ({ ...prev, [partId]: colorId }));
  };

  const handleImageChange = (direction: "next" | "prev") => {
    if (!product || !product.case_image_files) return;
    const totalImages = product.case_image_files.length;
    if (direction === "next") {
      setCurrentImageIndex((prev) => (prev + 1) % totalImages);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    }
  };

  const handleCarouselChange = (direction: "next" | "prev") => {
    const totalItems = relatedProducts.length;
    if (direction === "next") {
      setCarouselIndex((prev) => (prev + 1) % totalItems);
    } else {
      setCarouselIndex((prev) => (prev - 1 + totalItems) % totalItems);
    }
  };

  function triggerNotification(message: string) {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  }

  // Helper function to get or create cart
  async function getOrCreateCart(apiUrl: string, headers: any, currentGuestSessionId: string | null) {
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
    return cart;
  }

  // Function to add full product to cart
  async function handleAddToCart(redirectToCheckout: boolean = false) {
    if (!product) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const headers = buildHeaders(isAuthenticated, token, guestSessionId);

    try {
      let currentGuestSessionId = guestSessionId;
      if (!isAuthenticated && !currentGuestSessionId) {
        currentGuestSessionId = uuidv4();
        setGuestSessionId(currentGuestSessionId);
        localStorage.setItem('guestSessionId', currentGuestSessionId);
      }

      const cart = await getOrCreateCart(apiUrl!, headers, currentGuestSessionId);

      const customizations = product.product_parts
        .filter(part => part.colors && part.colors.length > 0)
        .map(part => {
          const selectedColorId = selectedColors[part.id] || part.colors[0].id;
          return {
            product_part: { id: part.id },
            color: { id: selectedColorId },
          };
        });

      const newItemData = {
        product: product.id,
        quantity: 1,
        base_price: product.default_price,
        effective_price: product.effective_price,
        customizations,
        cart: cart.id,
        is_additional_part: false,
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
        .map(part => {
          const selectedColorId = selectedColors[part.id] || part.colors[0].id;
          const color = part.colors.find(c => c.id === selectedColorId);
          return `${part.name}: ${color?.name || "Unknown"}`;
        })
        .join(", ");
      triggerNotification(`${product.name} Added! Price: $${product.effective_price.toFixed(2)}. Customizations: ${selectedColorNames}. This item is now in your cart.`);

      if (redirectToCheckout) {
        router.push("/checkout");
      }
    } catch (err) {
      console.error("[ERROR] handleAddToCart - Add to cart error:", err);
      let errorMessage = "Unknown error";
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data?.error?.message || err.message;
      }
      triggerNotification(`Error: Failed to add ${product.name}. ${errorMessage}`);
      setError("Failed to add item to cart. Please try again.");
    }
  }

  // Function to add individual part to cart
  async function handleAddPartToCart(partId: number, redirectToCheckout: boolean = false) {
    if (!product) return;

    const part = product.product_parts.find(p => p.id === partId);
    if (!part) {
      setError("Part not found");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const headers = buildHeaders(isAuthenticated, token, guestSessionId);

    try {
      let currentGuestSessionId = guestSessionId;
      if (!isAuthenticated && !currentGuestSessionId) {
        currentGuestSessionId = uuidv4();
        setGuestSessionId(currentGuestSessionId);
        localStorage.setItem('guestSessionId', currentGuestSessionId);
      }

      const cart = await getOrCreateCart(apiUrl!, headers, currentGuestSessionId);

      const selectedColorId = selectedColors[part.id] || part.colors[0]?.id;
      const selectedColor = part.colors.find(c => c.id === selectedColorId);
      
      // Calculate part prices
      const basePrice = part.price;
      const effectivePrice = part.discounted_price && part.discounted_price < part.price 
        ? part.discounted_price 
        : part.price;

      const newItemData = {
        product: product.id,
        quantity: 1,
        base_price: basePrice,
        effective_price: effectivePrice,
        customizations: [{
          product_part: { id: part.id },
          color: { id: selectedColorId },
        }],
        cart: cart.id,
        is_additional_part: true,
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

      triggerNotification(`${part.name} Added! Price: $${effectivePrice.toFixed(2)}. Color: ${selectedColor?.name || "Unknown"}. This part is now in your cart.`);

      if (redirectToCheckout) {
        router.push("/checkout");
      }
    } catch (err) {
      console.error("[ERROR] handleAddPartToCart - Add part to cart error:", err);
      let errorMessage = "Unknown error";
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data?.error?.message || err.message;
      }
      triggerNotification(`Error: Failed to add ${part.name}. ${errorMessage}`);
      setError("Failed to add part to cart. Please try again.");
    }
  }

  if (loading) return <div>Loading product...</div>;
  if (error) return <div>{error}</div>;
  if (!product) return null;

  const images = product.case_image_files || [];
  const currentImage = images[currentImageIndex]?.url || product.thumbnail_image?.url || "/placeholder.jpg";

  const viewerMaxHeight = 375;
  const viewerMaxWidth = 375;

  const formattedTerms = termsAndConditions ? parseTermsAndConditionsToComponents(termsAndConditions) : [];

  return (
    <main className={styles.main} style={{ marginTop: "2rem" }}>
      {showNotification && (
        <div
          className="fixed right-4 z-50 cart-notification"
          style={{ top: `${notificationTop}px` }}
          role="status"
          aria-live="polite"
        >
          <p>{notificationMessage}</p>
        </div>
      )}
      <div className={styles.productContainer}>
        <div className={styles.carousel} style={{ maxHeight: `${viewerMaxHeight}px` }}>
          {images.length > 0 && (
            <div className={styles.carouselInner}>
              <button onClick={() => handleImageChange("prev")} className={styles.arrowButton}>
                <ChevronLeft size={24} color="var(--orange)" />
              </button>
              <div className={styles.imageWrapper}>
                <Image
                  src={currentImage}
                  alt={product.name}
                  width={viewerMaxWidth}
                  height={viewerMaxHeight}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    width: "auto",
                    height: "auto",
                    objectFit: "contain",
                  }}
                  onLoadingComplete={(img) => {
                    const naturalWidth = img.naturalWidth;
                    const naturalHeight = img.naturalHeight;
                    const aspectRatio = naturalWidth / naturalHeight;
                    if (naturalHeight > naturalWidth) {
                      img.style.height = `${viewerMaxHeight}px`;
                      img.style.width = `${viewerMaxHeight * aspectRatio}px`;
                    } else {
                      img.style.width = `${viewerMaxWidth}px`;
                      img.style.height = `${viewerMaxWidth / aspectRatio}px`;
                    }
                  }}
                />
              </div>
              <button onClick={() => handleImageChange("next")} className={styles.arrowButton}>
                <ChevronRight size={24} color="var(--orange)" />
              </button>
            </div>
          )}
        </div>

        <div className={styles.productInfo}>
          <h1 className={styles.productTitle}>{product.name}</h1>
          {product.on_sale && (
            <div className={styles.saleBubble}>
              <span className={styles.saleText}>
                {product.is_preorder_sale ? "PREORDER SALE!" : "ON SALE!"}
              </span>
            </div>
          )}
          <div className={styles.priceContainer}>
            <p style={{ color: `#fe5100` }}>
              <strong className={styles.productPrice}>
                ${product.effective_price.toFixed(2)}
              </strong>
              {product.on_sale && (
                <span className={styles.strikethrough}>${product.default_price.toFixed(2)}</span>
              )}
            </p>
            {product.on_sale && (
              <p className={styles.offerEnds}>
                {promotionEndDate && (
                  `Offer ends: ${new Date(promotionEndDate).toLocaleDateString()}`
                )}
                {termsAndConditions && (
                  <>
                    {promotionEndDate && " | "}
                    
                      <a href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowTermsPopup(true);
                      }}
                      className={styles.termsLink}
                    >
                      See terms and conditions
                    </a>
                  </>
                )}
              </p>
            )}
          </div>
          <p className={styles.productDescription}>{product.description}</p>

          {product.device && (
            <p className={styles.deviceInfo}>
              Compatible with: {product.device.model}
            </p>
          )}

          <h2 className={styles.colorTitle}>Color Selections:</h2>
          <div className={styles.colorSections}>
            {product.product_parts.map((part) => {
              const partEffectivePrice = part.discounted_price && part.discounted_price < part.price 
                ? part.discounted_price 
                : part.price;
              const hasDiscount = part.discounted_price && part.discounted_price < part.price;
              
              return (
                <div key={part.id} className={styles.partSection}>
                  <button
                    className={styles.partToggle}
                    onClick={() => setOpenParts(prev => ({ ...prev, [part.id]: !prev[part.id] }))}
                  >
                    <span className={`${styles.toggleArrow} ${!openParts[part.id] ? styles.closed : ''}`}>
                      ▼
                    </span>
                    {part.name}
                  </button>
                  {openParts[part.id] && (
                    <div className={styles.partDetails}>
                      <p className={styles.partDescription}>{part.description}</p>
                      <div className={styles.colorBubbles}>
                        {part.colors.map((color) => (
                          <div key={color.id} className={styles.colorBubbleContainer}>
                            <div
                              className={`${styles.colorBubble} ${selectedColors[part.id] === color.id ? styles.selected : ""}`}
                              style={{
                                background: color.type === 'rainbow' && color.hex_codes.length >= 2
                                  ? `linear-gradient(to right, ${color.hex_codes.slice(0, 6).map(h => h.hex_code).join(', ')})`
                                  : color.hex_codes[0]?.hex_code || '#ccc',
                              }}
                              onClick={() => handleColorSelect(part.id, color.id)}
                            />
                            <div className={styles.colorTooltip}>
                              <p>{color.name}</p>
                              {color.hex_codes.map((h, index) => (
                                <p key={index}>{h.name}: {h.hex_code}</p>
                              ))}
                              <p>Type: {color.type}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Individual Part Purchase Section */}
                      <div className={styles.individualPartSection}>
                        <div className={styles.partPriceInfo}>
                          <span>Buy just this part:</span>
                          <span className={styles.partPrice}>
                            ${partEffectivePrice.toFixed(2)}
                          </span>
                          {hasDiscount && (
                            <span className={styles.partOriginalPrice}>
                              ${part.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={() => handleAddPartToCart(part.id)} 
                          className={styles.addPartButton}
                        >
                          <ShoppingCart size={16} />
                          Add Part
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.actionButtons}>
            <button onClick={() => handleAddToCart(false)} className={styles.cartButton}>
              Add Full Case to Cart
            </button>
            <button onClick={() => handleAddToCart(true)} className={styles.buyButton}>
              Buy Full Case Now
            </button>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <>
          <hr className={styles.divider} />
          <div className={styles.bottomCarousel}>
            <h2 className={styles.carouselTitle}>Related Products</h2>
            <div className={styles.carouselContainer}>
              <button onClick={() => handleCarouselChange("prev")} className={styles.carouselArrow}>
                <ChevronLeft size={24} />
              </button>
              <div
                className={styles.carouselItem}
                onClick={() => router.push(`/store/${relatedProducts[carouselIndex].slug}`)}
                style={{ cursor: "pointer" }}
              >
                <Image
                  src={relatedProducts[carouselIndex].thumbnail_image?.url || "/placeholder.jpg"}
                  alt={relatedProducts[carouselIndex].name}
                  width={150}
                  height={150}
                  style={{ objectFit: "contain" }}
                />
                <h3 className={styles.carouselItemTitle}>{relatedProducts[carouselIndex].name}</h3>
                <p className={styles.carouselItemPrice}>${relatedProducts[carouselIndex].default_price.toFixed(2)}</p>
              </div>
              <button onClick={() => handleCarouselChange("next")} className={styles.carouselArrow}>
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </>
      )}

      {showTermsPopup && termsAndConditions && (
        <TermsAndConditionsPopup
          formattedTerms={formattedTerms}
          onClose={() => setShowTermsPopup(false)}
        />
      )}
    </main>
  );
}