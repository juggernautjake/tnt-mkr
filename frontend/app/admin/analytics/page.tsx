'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './analytics.module.css';

interface OrderItemPart {
  product_part: { id: number; name: string };
  color: { id: number; name: string; hex_code?: string };
}

interface OrderItem {
  id: number;
  product: { id: number; name: string };
  quantity: number;
  price: number;
  is_additional_part?: boolean;
  order_item_parts: OrderItemPart[];
}

interface Order {
  id: number;
  order_number: string;
  ordered_at: string;
  order_status: string;
  total_amount: number;
  order_items: OrderItem[];
  admin_hidden?: boolean;
}

interface ColorStat {
  colorId: number;
  colorName: string;
  hexCode?: string;
  count: number;
  percentage: number;
}

interface PartStat {
  partId: number;
  partName: string;
  totalSelections: number;
  colors: ColorStat[];
}

interface ProductStat {
  productId: number;
  productName: string;
  unitsSold: number;
  revenue: number;
  parts: PartStat[];
}

type DateFilter = 'all' | '30' | '90' | '365';

const EXCLUDED_STATUSES = ['canceled', 'returned'];

// Predefined bar colors
const BAR_COLORS = [
  '#fe5100', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
  '#d946ef', '#0ea5e9', '#eab308', '#ef4444', '#6366f1',
];

export default function AnalyticsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tnt-mkr.com';

  const getAdminToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminJwt') || localStorage.getItem('jwt');
  };

  const fetchAllOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAdminToken();
      if (!token) {
        router.push('/admin/login?redirect=/admin/analytics');
        return;
      }

      // Fetch orders in batches to get all of them
      let allOrders: Order[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: '200',
        });

        const response = await fetch(`${API_URL}/api/shipping/admin/orders?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401 || response.status === 403) {
          router.push('/admin/login?redirect=/admin/analytics');
          return;
        }

        if (!response.ok) throw new Error('Failed to fetch orders');

        const data = await response.json();
        const fetched = (data.orders || []).filter((o: Order) => !o.admin_hidden);
        allOrders = [...allOrders, ...fetched];

        hasMore = fetched.length === 200 && page < 10; // Safety limit
        page++;
      }

      setOrders(allOrders);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load orders';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [API_URL, router]);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  // Filter orders by date range and exclude canceled/returned
  const filteredOrders = orders.filter((order) => {
    if (EXCLUDED_STATUSES.includes(order.order_status)) return false;

    if (dateFilter === 'all') return true;

    const orderDate = new Date(order.ordered_at);
    const now = new Date();
    const daysAgo = parseInt(dateFilter);
    const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return orderDate >= cutoff;
  });

  // Build analytics data
  const buildAnalytics = (): {
    productStats: ProductStat[];
    totalUnits: number;
    totalRevenue: number;
    uniqueColors: Set<string>;
  } => {
    const productMap = new Map<number, ProductStat>();
    let totalUnits = 0;
    let totalRevenue = 0;
    const uniqueColors = new Set<string>();

    for (const order of filteredOrders) {
      totalRevenue += order.total_amount;

      for (const item of order.order_items || []) {
        totalUnits += item.quantity;

        const productId = item.product?.id;
        const productName = item.product?.name || 'Unknown Product';

        if (!productId) continue;

        if (!productMap.has(productId)) {
          productMap.set(productId, {
            productId,
            productName,
            unitsSold: 0,
            revenue: 0,
            parts: [],
          });
        }

        const productStat = productMap.get(productId)!;
        productStat.unitsSold += item.quantity;
        productStat.revenue += item.price * item.quantity * 100;

        for (const oip of item.order_item_parts || []) {
          const partId = oip.product_part?.id;
          const partName = oip.product_part?.name || 'Unknown Part';
          const colorId = oip.color?.id;
          const colorName = oip.color?.name || 'Unknown Color';
          const hexCode = (oip.color as any)?.hex_code;

          if (!partId || !colorId) continue;
          uniqueColors.add(colorName);

          let partStat = productStat.parts.find((p) => p.partId === partId);
          if (!partStat) {
            partStat = { partId, partName, totalSelections: 0, colors: [] };
            productStat.parts.push(partStat);
          }

          partStat.totalSelections += item.quantity;

          let colorStat = partStat.colors.find((c) => c.colorId === colorId);
          if (!colorStat) {
            colorStat = { colorId, colorName, hexCode, count: 0, percentage: 0 };
            partStat.colors.push(colorStat);
          }
          colorStat.count += item.quantity;
        }
      }
    }

    // Calculate percentages and sort
    const productStats = Array.from(productMap.values()).sort((a, b) => b.unitsSold - a.unitsSold);

    for (const product of productStats) {
      for (const part of product.parts) {
        part.colors.sort((a, b) => b.count - a.count);
        for (const color of part.colors) {
          color.percentage = part.totalSelections > 0 ? (color.count / part.totalSelections) * 100 : 0;
        }
      }
      product.parts.sort((a, b) => b.totalSelections - a.totalSelections);
    }

    return { productStats, totalUnits, totalRevenue, uniqueColors };
  };

  const { productStats, totalUnits, totalRevenue, uniqueColors } = buildAnalytics();

  // Build global top colors
  const globalColorCounts = new Map<string, { count: number; hexCode?: string }>();
  for (const product of productStats) {
    for (const part of product.parts) {
      for (const color of part.colors) {
        const existing = globalColorCounts.get(color.colorName) || { count: 0, hexCode: color.hexCode };
        existing.count += color.count;
        globalColorCounts.set(color.colorName, existing);
      }
    }
  }
  const topGlobalColors = Array.from(globalColorCounts.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const toggleProduct = (productId: number) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const formatCurrency = (cents: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.pageHeader}>
          <button onClick={() => router.push('/admin/orders')} className={styles.backBtn}>
            ← Back to Orders
          </button>
          <h1 className={styles.pageTitle}>PRODUCT & COLOR ANALYTICS</h1>
          <div style={{ width: '140px' }}></div>
        </div>

        {/* Date Filter */}
        <div className={styles.filterBar}>
          {([['all', 'All Time'], ['30', 'Last 30 Days'], ['90', 'Last 90 Days'], ['365', 'Last Year']] as [DateFilter, string][]).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setDateFilter(value)}
              className={`${styles.filterBtn} ${dateFilter === value ? styles.filterBtnActive : ''}`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className={styles.loadingWrapper}>
            <div className={styles.spinner}></div>
            <p>Loading analytics data...</p>
          </div>
        ) : error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className={styles.summaryCards}>
              <div className={styles.summaryCard}>
                <span className={styles.summaryNumber}>{filteredOrders.length}</span>
                <span className={styles.summaryLabel}>Total Orders</span>
              </div>
              <div className={styles.summaryCard}>
                <span className={styles.summaryNumber}>{totalUnits}</span>
                <span className={styles.summaryLabel}>Units Sold</span>
              </div>
              <div className={styles.summaryCard}>
                <span className={styles.summaryNumber}>{formatCurrency(totalRevenue)}</span>
                <span className={styles.summaryLabel}>Revenue</span>
              </div>
              <div className={styles.summaryCard}>
                <span className={styles.summaryNumber}>{uniqueColors.size}</span>
                <span className={styles.summaryLabel}>Unique Colors Used</span>
              </div>
            </div>

            {/* Product Sections */}
            {productStats.map((product) => {
              const isExpanded = expandedProducts.has(product.productId);
              return (
                <div key={product.productId} className={styles.productSection}>
                  <div className={styles.productHeader} onClick={() => toggleProduct(product.productId)}>
                    <h3 className={styles.productName}>{product.productName}</h3>
                    <div className={styles.productStats}>
                      <span className={styles.productStat}>
                        <strong>{product.unitsSold}</strong> sold
                      </span>
                      <span className={styles.productStat}>
                        <strong>{formatCurrency(product.revenue)}</strong>
                      </span>
                      <span className={styles.toggleIcon}>{isExpanded ? '▼' : '▶'}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className={styles.productBody}>
                      {product.parts.length === 0 ? (
                        <p style={{ color: '#666', fontStyle: 'italic' }}>No part/color data available</p>
                      ) : (
                        product.parts.map((part) => (
                          <div key={part.partId} className={styles.partSection}>
                            <h4 className={styles.partName}>
                              {part.partName} ({part.totalSelections} selections)
                            </h4>
                            {part.colors.map((color, colorIdx) => {
                              const barColor = BAR_COLORS[colorIdx % BAR_COLORS.length];
                              const isTop = colorIdx === 0 && part.colors.length > 1;
                              return (
                                <div key={color.colorId} className={styles.colorBarRow}>
                                  <span className={styles.colorName}>
                                    {color.hexCode && (
                                      <span
                                        className={styles.colorSwatch}
                                        style={{ backgroundColor: color.hexCode }}
                                      ></span>
                                    )}
                                    {color.colorName}
                                    {isTop && <span className={styles.topBadge}>TOP</span>}
                                  </span>
                                  <div className={styles.colorBarWrapper}>
                                    <div
                                      className={styles.colorBar}
                                      style={{
                                        width: `${color.percentage}%`,
                                        backgroundColor: color.hexCode || barColor,
                                      }}
                                    ></div>
                                  </div>
                                  <span className={styles.colorCount}>
                                    {color.count} ({color.percentage.toFixed(0)}%)
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {productStats.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <p>No order data available for the selected time range.</p>
              </div>
            )}

            {/* Top Global Colors */}
            {topGlobalColors.length > 0 && (
              <div className={styles.topColorsSection}>
                <h3 className={styles.topColorsTitle}>Top Colors Across All Products</h3>
                <table className={styles.topColorsTable}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Color</th>
                      <th>Total Selections</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topGlobalColors.map((color, idx) => (
                      <tr key={color.name}>
                        <td>
                          <span className={styles.rankBadge}>{idx + 1}</span>
                        </td>
                        <td>
                          {color.hexCode && (
                            <span
                              className={styles.colorSwatch}
                              style={{ backgroundColor: color.hexCode }}
                            ></span>
                          )}
                          {color.name}
                        </td>
                        <td>{color.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
