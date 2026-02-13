"use client";

import React, { useEffect, useState, useRef, useMemo, useLayoutEffect, Suspense, lazy } from "react";
import axios from "axios";

import ProductCard from "../components/ProductCard";
import CustomerReviewsCarousel from "../components/CustomerReviewsCarousel";
import LoadingIndicator from "../components/LoadingIndicator";
import { FaShoppingCart, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import type { ProductListItem, Promotion } from "../lib/types";

const PromotionBanner = lazy(() => import("../components/PromotionBanner"));

function useContainerWidth() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    function updateWidth() {
      if (containerRef.current) setWidth(containerRef.current.offsetWidth);
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return { containerRef, width };
}

async function fetchProductsOptimized(): Promise<ProductListItem[]> {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
      params: {
        populate: "thumbnail_image",
        "filters[publishedAt][$ne]": null,
        "fields[0]": "id",
        "fields[1]": "name",
        "fields[2]": "default_price",
        "fields[3]": "effective_price",
        "fields[4]": "slug",
        "fields[5]": "on_sale",
        "fields[6]": "is_preorder_sale",
      },
    });

    const rawData = Array.isArray(response.data) ? response.data : [];
    if (rawData.length === 0) {
      return [];
    }

    const products: ProductListItem[] = rawData.map((item: any) => ({
      id: item.id ?? 0,
      name: item.name ?? "Unnamed Product",
      default_price: item.default_price ? parseFloat(item.default_price) : 0,
      effective_price: item.effective_price ? parseFloat(item.effective_price) : 0,
      slug: item.slug ?? "",
      thumbnailUrl: item.thumbnail_image?.url ?? "/icons/Phone_Case_Icon.png",
      is_preorder_sale: item.is_preorder_sale || false,
      on_sale: item.on_sale || false,
    }));

    return products;
  } catch (error) {
    console.error("[ERROR] Failed to fetch products:", error);
    return [];
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
      console.error("[ERROR] fetchActivePromotions - Unexpected API response structure:", response.data);
      return [];
    }

    const promotions = rawData.map((item: any) => {
      const attributes = item.attributes || item;
      return {
        id: item.id,
        name: attributes.name,
        start_date: attributes.start_date,
        end_date: attributes.end_date,
        discount_percentage: attributes.discount_percentage ? parseFloat(attributes.discount_percentage) : undefined,
        discount_amount: attributes.discount_amount ? parseFloat(attributes.discount_amount) : undefined,
        is_preorder: attributes.is_preorder ?? false,
        products: attributes.products?.data?.map((prod: any) => {
          const prodAttributes = prod.attributes || prod;
          return {
            id: prod.id,
            name: prodAttributes.name,
            default_price: parseFloat(prodAttributes.default_price),
            effective_price: parseFloat(prodAttributes.effective_price || prodAttributes.default_price),
            slug: prodAttributes.slug,
            thumbnailUrl: prodAttributes.thumbnail_image?.data?.attributes?.url ?? "/icons/Phone_Case_Icon.png",
            on_sale: prodAttributes.on_sale || false,
            is_preorder_sale: prodAttributes.is_preorder_sale || false,
          };
        }) || [],
        discount_codes: attributes.discount_codes?.data?.map((code: any) => ({
          code: code.attributes?.code || code.code,
        })) || [],
      };
    });

    const currentDate = new Date();
    const filteredPromos = promotions.filter((promo) => {
      const startDate = new Date(promo.start_date);
      const endDate = new Date(promo.end_date);
      return startDate <= currentDate && endDate >= currentDate;
    });

    return filteredPromos;
  } catch (error) {
    console.error("[ERROR] Failed to fetch promotions:", error);
    return [];
  }
}

export default function Home(): JSX.Element {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [activePromos, setActivePromos] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promoIndex, setPromoIndex] = useState(0);
  const [promoDisplayIndex, setPromoDisplayIndex] = useState(0);
  const [currentProductIndex, setCurrentProductIndex] = useState(1);
  const [productDisplayIndex, setProductDisplayIndex] = useState(0);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [isProductAutoScrollEnabled, setIsProductAutoScrollEnabled] = useState(true);
  const [currentBannerHeight, setCurrentBannerHeight] = useState(100);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const bannerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const productInactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { containerRef, width: containerWidth } = useContainerWidth();
  const slidesWrapperRef = useRef<HTMLDivElement>(null);

  const extendedProducts = useMemo(() => {
    if (products.length <= 1) return products;
    return [products[products.length - 1], ...products, products[0]];
  }, [products]);

  const extendedPromos = useMemo(() => {
    if (activePromos.length === 0) return [];
    if (activePromos.length === 1) return [activePromos[0]];
    return [activePromos[activePromos.length - 1], ...activePromos, activePromos[0]];
  }, [activePromos]);

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedProducts = await fetchProductsOptimized();
        setProducts(fetchedProducts);
        setCurrentProductIndex(fetchedProducts.length > 1 ? 1 : 0);
        if (fetchedProducts.length === 0) {
          setError("No products available at this time.");
        }
      } catch (err) {
        setError("Failed to load products. Please try again later.");
      } finally {
        setIsLoading(false);
      }

      try {
        const filteredPromos = await fetchActivePromotions();
        const enhancedPromos = filteredPromos.map(promo => {
          if (promo.products && promo.products.length > 0) {
            const enhancedProducts = promo.products.map(promoProduct => {
              const fullProduct = products.find(p => p.id === promoProduct.id);
              return fullProduct ? { ...promoProduct, effective_price: fullProduct.effective_price } : promoProduct;
            });
            return { ...promo, products: enhancedProducts };
          }
          return promo;
        });
        setActivePromos(enhancedPromos);
      } catch (err) {
        console.error("Failed to load promotions:", err);
      }
    }
    loadData();
  }, []);

  useLayoutEffect(() => {
    if (bannerRefs.current.length > 0) {
      const currentIndex = activePromos.length === 1 ? 0 : Math.floor(promoDisplayIndex) % activePromos.length;
      const adjustedIndex = activePromos.length > 1 && currentIndex === 0 ? activePromos.length : currentIndex;
      const currentBannerRef = bannerRefs.current[adjustedIndex];
      const height = currentBannerRef?.offsetHeight || 100;
      setCurrentBannerHeight(height);
    }
  }, [activePromos, promoDisplayIndex]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 1000;
    const startIndex = promoDisplayIndex;
    const targetIndex = promoIndex;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentIndex = startIndex + (targetIndex - startIndex) * progress;
      setPromoDisplayIndex(currentIndex);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (targetIndex === extendedPromos.length - 1) {
          setPromoDisplayIndex(1);
          setPromoIndex(1);
        } else if (targetIndex === 0) {
          setPromoDisplayIndex(extendedPromos.length - 2);
          setPromoIndex(extendedPromos.length - 2);
        }
      }
    };

    if (startIndex !== targetIndex) {
      requestAnimationFrame(animate);
    }
  }, [promoIndex, extendedPromos]);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 1000;
    const startIndex = productDisplayIndex;
    const targetIndex = currentProductIndex;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentIndex = startIndex + (targetIndex - startIndex) * progress;
      setProductDisplayIndex(currentIndex);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (targetIndex === extendedProducts.length - 1) {
          setProductDisplayIndex(1);
          setCurrentProductIndex(1);
        } else if (targetIndex === 0) {
          setProductDisplayIndex(extendedProducts.length - 2);
          setCurrentProductIndex(extendedProducts.length - 2);
        }
      }
    };

    if (startIndex !== targetIndex) {
      requestAnimationFrame(animate);
    }
  }, [currentProductIndex, extendedProducts]);

  useEffect(() => {
    if (activePromos.length <= 1 || !isAutoScrollEnabled) return;

    const holdDuration = 5000;
    const transitionDuration = 1000;
    const totalDuration = holdDuration + transitionDuration;

    const interval = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % extendedPromos.length);
    }, totalDuration);

    return () => clearInterval(interval);
  }, [activePromos, isAutoScrollEnabled, extendedPromos]);

  useEffect(() => {
    if (!isSmallScreen || products.length <= 1 || !isProductAutoScrollEnabled) return;

    const holdDuration = 6000;
    const transitionDuration = 1000;
    const totalDuration = holdDuration + transitionDuration;

    const interval = setInterval(() => {
      setCurrentProductIndex((prev) => (prev + 1) % extendedProducts.length);
    }, totalDuration);

    return () => clearInterval(interval);
  }, [isSmallScreen, products, isProductAutoScrollEnabled, extendedProducts]);

  const handlePrevPromo = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    setIsAutoScrollEnabled(false);
    setPromoIndex((prev) => (prev - 1 + extendedPromos.length) % extendedPromos.length);
    inactivityTimeoutRef.current = setTimeout(() => {
      setIsAutoScrollEnabled(true);
    }, 10000);
  };

  const handleNextPromo = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    setIsAutoScrollEnabled(false);
    setPromoIndex((prev) => (prev + 1) % extendedPromos.length);
    inactivityTimeoutRef.current = setTimeout(() => {
      setIsAutoScrollEnabled(true);
    }, 10000);
  };

  const handlePrevProduct = () => {
    if (productInactivityTimeoutRef.current) {
      clearTimeout(productInactivityTimeoutRef.current);
    }
    setIsProductAutoScrollEnabled(false);
    setCurrentProductIndex((prev) => (prev - 1 + extendedProducts.length) % extendedProducts.length);
    productInactivityTimeoutRef.current = setTimeout(() => {
      setIsProductAutoScrollEnabled(true);
    }, 10000);
  };

  const handleNextProduct = () => {
    if (productInactivityTimeoutRef.current) {
      clearTimeout(productInactivityTimeoutRef.current);
    }
    setIsProductAutoScrollEnabled(false);
    setCurrentProductIndex((prev) => (prev + 1) % extendedProducts.length);
    productInactivityTimeoutRef.current = setTimeout(() => {
      setIsProductAutoScrollEnabled(true);
    }, 10000);
  };

  const getPromoStyle = (index: number): React.CSSProperties => {
    const viewerWidth = viewerRef.current?.offsetWidth || 1200;

    if (isSmallScreen) {
      return {
        position: "relative",
        width: "100%",
        opacity: index === promoIndex ? 1 : 0,
        height: index === promoIndex ? "auto" : "0",
        overflow: index === promoIndex ? "visible" : "hidden",
      };
    }

    if (activePromos.length === 1) {
      return {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: "100%",
        maxWidth: "42rem",
        opacity: 1,
      };
    }

    const offset = index - promoDisplayIndex;
    const translateX = offset * viewerWidth;
    const absOffset = Math.abs(offset);
    const opacity = Math.max(0, 1 - absOffset);

    return {
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: `translate(-50%, -50%) translateX(${translateX}px)`,
      width: "100%",
      maxWidth: "42rem",
      opacity: opacity,
    };
  };

  const getProductStyle = (index: number): React.CSSProperties => {
    const viewerWidth = containerRef.current?.offsetWidth || 1200;

    if (products.length === 1) {
      return {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        opacity: 1,
      };
    }

    const offset = index - productDisplayIndex;
    const translateX = offset * viewerWidth;
    const absOffset = Math.abs(offset);
    const opacity = Math.max(0, 1 - absOffset);

    return {
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: `translate(-50%, -50%) translateX(${translateX}px)`,
      opacity: opacity,
    };
  };

  const extendedSlides = useMemo(() => {
    if (products.length <= 1) return products;
    return [products[products.length - 1], ...products, products[0]];
  }, [products]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProductTransitionEnabled, setIsProductTransitionEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const transitionDuration = 2000;
  const holdDuration = 7000;
  const totalDelay = holdDuration + transitionDuration;
  const baseEasing = "cubic-bezier(0.77,0,0.175,1)";
  const hoverEasing = "cubic-bezier(0.77,0,0.175,1)";

  useEffect(() => {
    setIsProductTransitionEnabled(false);
    const timer = setTimeout(() => {
      setIsProductTransitionEnabled(true);
      setCurrentIndex(1);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isPaused || products.length < 4) return;
    const timer = setTimeout(() => handleNext(), totalDelay);
    return () => clearTimeout(timer);
  }, [currentIndex, isPaused, products.length]);

  useEffect(() => {
    const wrapper = slidesWrapperRef.current;
    if (!wrapper || products.length < 4) return;

    function onTransitionEnd() {
      if (currentIndex === extendedSlides.length - 1) {
        setIsProductTransitionEnabled(false);
        setCurrentIndex(1);
      } else if (currentIndex === 0) {
        setIsProductTransitionEnabled(false);
        setCurrentIndex(extendedSlides.length - 2);
      }
    }
    wrapper.addEventListener("transitionend", onTransitionEnd);
    return () => wrapper.removeEventListener("transitionend", onTransitionEnd);
  }, [currentIndex, extendedSlides, products.length]);

  useEffect(() => {
    if (!isProductTransitionEnabled) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsProductTransitionEnabled(true));
      });
    }
  }, [isProductTransitionEnabled]);

  const handleNext = () => setCurrentIndex((prev) => prev + 1);
  const handlePrev = () => setCurrentIndex((prev) => prev - 1);

  const handleMouseEnter = (idx: number) => {
    if (isVisible(idx)) setIsPaused(true);
    setHoveredIndex(idx);
  };
  const handleMouseLeave = (idx: number) => {
    if (isVisible(idx)) setIsPaused(false);
    setHoveredIndex((prev) => (prev === idx ? null : prev));
  };

  function isVisible(i: number) {
    if (products.length < 4) return true;
    let dist = (i - currentIndex) % extendedSlides.length;
    dist = (dist + extendedSlides.length) % extendedSlides.length;
    return (
      dist === 0 ||
      dist === 1 ||
      dist === 2 ||
      dist === extendedSlides.length - 1 ||
      dist === extendedSlides.length - 2
    );
  }

  function getItemStyle(i: number): React.CSSProperties {
    if (products.length >= 4) {
      let dist = (i - currentIndex) % extendedSlides.length;
      dist = (dist + extendedSlides.length) % extendedSlides.length;

      let transformTransition = isProductTransitionEnabled
        ? `transform ${transitionDuration}ms ${baseEasing}, opacity ${transitionDuration}ms ${baseEasing}`
        : "none";

      if (hoveredIndex === i) {
        transformTransition = isProductTransitionEnabled
          ? `transform 500ms ${hoverEasing}, opacity 500ms ${hoverEasing}`
          : "none";
      }

      const cw = containerWidth || 1;
      const edgeShift = cw * 0.3;
      const offScreenShift = cw * 1.2;

      const style: React.CSSProperties = {
        position: "absolute",
        left: "50%",
        top: "50%",
        transition: transformTransition,
        zIndex: 1,
        display: "none",
      };

      switch (dist) {
        case 0:
          style.transform = "translate(-50%, -50%) scale(1)";
          style.opacity = 1;
          style.zIndex = 3;
          style.display = "block";
          break;
        case 1:
          style.transform = `translate(calc(-50% + ${edgeShift}px), -50%) scale(0.8)`;
          style.opacity = 0.5;
          style.zIndex = 2;
          style.display = "block";
          break;
        case 2:
          style.transform = `translate(calc(-50% + ${offScreenShift}px), -50%) scale(0.7)`;
          style.opacity = 0.3;
          style.zIndex = 1;
          style.display = "block";
          break;
        case extendedSlides.length - 1:
          style.transform = `translate(calc(-50% - ${edgeShift}px), -50%) scale(0.8)`;
          style.opacity = 0.5;
          style.zIndex = 2;
          style.display = "block";
          break;
        case extendedSlides.length - 2:
          style.transform = `translate(calc(-50% - ${offScreenShift}px), -50%) scale(0.7)`;
          style.opacity = 0.3;
          style.zIndex = 1;
          style.display = "block";
          break;
        default:
          break;
      }

      if (hoveredIndex === i) {
        style.transform = style.transform?.replace(/scale\([^)]*\)/, "scale(1.05)") || "";
        style.opacity = 1;
        style.zIndex = 99;
      }

      return style;
    }
    return {};
  }

  return (
    <main className="flex flex-col items-center justify-start w-full min-h-screen py-8 px-4 text-[var(--orange)]">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 dark:text-orange-500">
          Crafted to Protect, Designed to Impress
        </h1>
        <p className="text-base sm:text-lg dark:text-white">
          TNT MKR creates premium 3D-printed phone cases with a purpose—blending durability, style, and faith-inspired values.
        </p>
      </div>

      <Suspense fallback={<LoadingIndicator />}>
        {activePromos.length > 0 && (
          <div
            ref={viewerRef}
            className={`${styles.promoViewer} mb-8 md:mb-12`}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "1200px",
              height: isSmallScreen ? "auto" : `${currentBannerHeight}px`,
              minHeight: isSmallScreen ? "auto" : "50px",
              overflow: isSmallScreen ? "visible" : "hidden",
              margin: "0 auto",
              transition: isSmallScreen ? "none" : "height 0.3s ease",
              padding: isSmallScreen ? "0" : "calc(2rem + 25px) 0 calc(2rem + 25px) 0",
            }}
          >
            {activePromos.length > 1 && (
              <button className="promo-arrow left" onClick={handlePrevPromo} aria-label="Previous promotion">
                <FaChevronLeft />
              </button>
            )}
            <div
              ref={carouselRef}
              style={{
                position: "relative",
                height: "100%",
              }}
            >
              {(activePromos.length === 1 ? activePromos : extendedPromos).map((promo, index) => (
                <div
                  key={`${promo.id}-${index}`}
                  ref={(el) => {
                    bannerRefs.current[index] = el;
                  }}
                  style={getPromoStyle(index)}
                >
                  <PromotionBanner promotion={promo} />
                </div>
              ))}
            </div>
            {activePromos.length > 1 && (
              <button className="promo-arrow right" onClick={handleNextPromo} aria-label="Next promotion">
                <FaChevronRight />
              </button>
            )}
          </div>
        )}
      </Suspense>

      <div
        ref={containerRef}
        className="relative w-full mt-6 mb-1 product-card-viewer"
        style={{ overflowX: "hidden", overflowY: "visible", zIndex: 10 }}
      >
        {error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : isLoading ? (
          <LoadingIndicator />
        ) : products.length === 0 ? (
          <p className="text-center">No products available.</p>
        ) : isSmallScreen ? (
          <div
            className="relative flex justify-center items-center"
            style={{
              height: "calc(50vw * 4 / 3 + 40px)",
              overflow: "hidden",
            }}
          >
            {products.length > 1 && (
              <>
                <button className="promo-arrow left" onClick={handlePrevProduct} aria-label="Previous product">
                  <FaChevronLeft />
                </button>
                <div style={{ position: "relative", width: "100%", height: "100%" }}>
                  {extendedProducts.map((product, index) => (
                    <div
                      key={`${product.id}-${index}`}
                      style={{
                        ...getProductStyle(index),
                        transition: 'opacity 1s ease, transform 1s ease',
                      }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
                <button className="promo-arrow right" onClick={handleNextProduct} aria-label="Next product">
                  <FaChevronRight />
                </button>
              </>
            )}
            {products.length === 1 && (
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                <ProductCard product={products[0]} />
              </div>
            )}
          </div>
        ) : products.length < 4 ? (
          <div className="flex flex-col sm:flex-row justify-center items-center h-full gap-4" style={{ height: "50vh" }}>
            {products.map((product) => (
              <div key={product.id} className="transform transition-transform duration-200 ease-in-out hover:scale-105">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div ref={slidesWrapperRef} style={{ width: "100%", height: "50vh", position: "relative" }}>
            {extendedSlides.map((item, i) => (
              <div
                key={i}
                style={getItemStyle(i)}
                onMouseEnter={() => handleMouseEnter(i)}
                onMouseLeave={() => handleMouseLeave(i)}
              >
                <ProductCard product={item} />
              </div>
            ))}
          </div>
        )}
        {!isSmallScreen && products.length >= 4 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous product"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 text-[var(--orange)] rounded text-3xl font-extrabold px-3 py-2 bg-transparent hover:text-white hover:bg-[var(--orange)] transition-colors"
            >
              {"<"}
            </button>
            <button
              onClick={handleNext}
              aria-label="Next product"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 text-[var(--orange)] rounded text-3xl font-extrabold px-3 py-2 bg-transparent hover:text-white hover:bg-[var(--orange)] transition-colors"
            >
              {">"}
            </button>
          </>
        )}
      </div>

      {products.length === 1 && (
        <p className="text-center text-orange-500 dark:text-white mt-1 mb-4">
          More products coming soon!
        </p>
      )}

      <div className="flex justify-center mt-12 mb-12">
        <div style={{ position: 'relative' }}>
          <button className={`${styles.cartButton} ${styles.cartButtonFilled}`} style={{ visibility: 'hidden' }}>
            <FaShoppingCart size={20} className="mr-2" />
            Shop Now
          </button>
          <Link href="/store">
            <button className={`${styles.cartButton} ${styles.cartButtonFilled}`} style={{ position: 'absolute', top: 0, left: 0 }} aria-label="Shop now">
              <FaShoppingCart size={20} className="mr-2" />
              Shop Now
            </button>
          </Link>
        </div>
      </div>

      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-12 mb-24 px-4 mt-16">
        <div className="flex flex-col items-center text-center p-6 w-[350px] h-[350px] bg-[#faf0e2] dark:bg-dark-navy rounded-[10px] shadow-[8px_8px_20px_rgba(0,0,0,0.25)] dark:shadow-[0px_0px_20px_4px_rgba(254,81,0,0.5)]">
          <Image
            src="/icons/Shield_Icon.png"
            alt="Protection Icon"
            width={96}
            height={96}
            className="info-icon object-contain w-14 h-14 mb-4 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24"
          />
          <h2 className="font-bold text-2xl mb-3 text-[var(--orange)]">Superior Protection</h2>
          <p className="text-lg text-gray-700 dark:text-accent-blue">
            Advanced 3D-printed materials to absorb shocks and drops. Guard your phone without compromising on style.
          </p>
        </div>
        <div className="flex flex-col items-center text-center p-6 w-[350px] h-[350px] bg-[#faf0e2] dark:bg-dark-navy rounded-[10px] shadow-[8px_8px_20px_rgba(0,0,0,0.25)] dark:shadow-[0px_0px_20px_4px_rgba(254,81,0,0.5)]">
          <Image
            src="/icons/American_Flag_Icon.png"
            alt="Made in USA Icon"
            width={96}
            height={96}
            className="info-icon object-contain w-14 h-14 mb-4 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24"
          />
          <h2 className="font-bold text-2xl mb-3 text-[var(--orange)]">Made in the USA</h2>
          <p className="text-lg text-gray-700 dark:text-accent-blue">
            All of our products are proudly designed and 3D-printed in the United States, ensuring quality craftsmanship.
          </p>
        </div>
        <div className="flex flex-col items-center text-center p-6 w-[350px] h-[350px] bg-[#faf0e2] dark:bg-dark-navy rounded-[10px] shadow-[8px_8px_20px_rgba(0,0,0,0.25)] dark:shadow-[0px_0px_20px_4px_rgba(254,81,0,0.5)]">
          <Image
            src="/icons/3D_Printer_Icon.png"
            alt="About Us Icon"
            width={96}
            height={96}
            className="info-icon object-contain w-14 h-14 mb-4 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24"
          />
          <h2 className="font-bold text-2xl mb-3 text-[var(--orange)]">Crafted with Purpose</h2>
          <p className="text-lg text-gray-700 dark:text-accent-blue">
            At TNT MKR, we fuse 3D printing innovation with faith-driven values to craft quality phone cases that are designed to protect and inspire.
          </p>
        </div>
      </div>

      <CustomerReviewsCarousel />
    </main>
  );
}