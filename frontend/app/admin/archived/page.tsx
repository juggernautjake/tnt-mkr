'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './archived.module.css';

interface OrderItem {
  id: number;
  product: { id: number; name: string };
  quantity: number;
  price: number;
  order_item_parts: Array<{
    product_part: { id: number; name: string };
    color: { id: number; name: string };
  }>;
}

interface Order {
  id: number;
  order_number: string;
  ordered_at: string;
  archived_at?: string;
  customer_name: string;
  customer_email?: string;
  guest_email?: string;
  order_status: string;
  total_amount: number;
  order_items: OrderItem[];
  user?: { id: number; email: string };
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100);
};

export default function ArchivedOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [restoringId, setRestoringId] = useState<number | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tnt-mkr.com';

  const getAdminToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminJwt') || localStorage.getItem('jwt');
  };

  const fetchArchivedOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAdminToken();
      if (!token) {
        router.push('/admin/login?redirect=/admin/archived');
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '50',
      });
      if (search) params.set('search', search);

      const response = await fetch(`${API_URL}/api/shipping/admin/archived-orders?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401 || response.status === 403) {
        router.push('/admin/login?redirect=/admin/archived');
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch archived orders');

      const data = await response.json();
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.pageCount || 1);
      setTotalOrders(data.pagination?.total || 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load archived orders';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [API_URL, page, search, router]);

  useEffect(() => {
    fetchArchivedOrders();
  }, [fetchArchivedOrders]);

  const handleRestore = async (orderId: number) => {
    setRestoringId(orderId);
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_URL}/api/shipping/admin/orders/${orderId}/restore`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to restore order');
      }

      setOrders(prev => prev.filter(o => o.id !== orderId));
      setTotalOrders(prev => prev - 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      alert(`Error restoring order: ${msg}`);
    } finally {
      setRestoringId(null);
    }
  };

  const getEmail = (order: Order): string => {
    return order.customer_email || order.guest_email || order.user?.email || 'N/A';
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.pageHeader}>
          <button onClick={() => router.push('/admin/orders')} className={styles.backBtn}>
            ← Back to Orders
          </button>
          <h1 className={styles.pageTitle}>ARCHIVED ORDERS</h1>
          <div className={styles.totalBadge}>
            {totalOrders} archived
          </div>
        </div>

        {/* Search */}
        <div className={styles.searchRow}>
          <input
            type="text"
            placeholder="Search archived orders by order #, name, or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className={styles.searchInput}
          />
        </div>

        {loading ? (
          <div className={styles.loadingWrapper}>
            <div className={styles.spinner}></div>
            <p>Loading archived orders...</p>
          </div>
        ) : error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No archived orders found.</p>
          </div>
        ) : (
          <>
            <div className={styles.ordersGrid}>
              {orders.map((order) => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div className={styles.orderInfo}>
                      <span className={styles.orderNumber}>{order.order_number}</span>
                      <span className={styles.orderDate}>
                        Ordered: {formatDate(order.ordered_at)}
                      </span>
                      {order.archived_at && (
                        <span className={styles.archivedDate}>
                          Archived: {formatDate(order.archived_at)}
                        </span>
                      )}
                    </div>
                    <span className={styles.statusBadge}>{order.order_status}</span>
                  </div>

                  <div className={styles.orderBody}>
                    <p className={styles.customerName}>{order.customer_name}</p>
                    <p className={styles.customerEmail}>{getEmail(order)}</p>
                    <p className={styles.orderTotal}>{formatCurrency(order.total_amount)}</p>

                    {order.order_items && order.order_items.length > 0 && (
                      <div className={styles.itemsSummary}>
                        {order.order_items.map((item) => (
                          <div key={item.id} className={styles.itemLine}>
                            {item.quantity}x {item.product?.name || 'Unknown'}
                            {item.order_item_parts?.length > 0 && (
                              <span className={styles.partColors}>
                                {' '}({item.order_item_parts.map(p => p.color?.name).filter(Boolean).join(', ')})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.orderActions}>
                    <button
                      onClick={() => handleRestore(order.id)}
                      disabled={restoringId === order.id}
                      className={styles.restoreBtn}
                    >
                      {restoringId === order.id ? 'Restoring...' : '↩️ Restore Order'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className={styles.pageButton}
                >
                  Previous
                </button>
                <span className={styles.pageInfo}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className={styles.pageButton}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
