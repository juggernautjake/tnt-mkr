'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import styles from './orders.module.css';
import CustomMessageModal from '../components/CustomMessageModal';
import {
  Address,
  Order,
  OrderItem,
  OrderItemPart,
  OrderStats,
  PackageCalculation,
  PendingStatusChange,
  ShippingBox,
  UpdateStatusBody,
  UNIFIED_STATUS_OPTIONS,
  STATUS_LABELS,
  STATUS_EMAIL_INFO,
  getStatusBorderClass,
  formatDate,
  formatCurrency,
  getEmail,
  getTrackingUrl,
} from './types';

// Helper to get status badge class
const getStatusBadgeClass = (status: string): string => {
  if (['pending', 'paid', 'printing', 'printed', 'assembling'].includes(status)) {
    return styles.statusPreparation;
  }
  if (status === 'packaged') {
    return styles.statusPackaged;
  }
  if (['shipped', 'in_transit', 'out_for_delivery'].includes(status)) {
    return styles.statusInTransit;
  }
  if (status === 'delivered') {
    return styles.statusDelivered;
  }
  if (status === 'canceled') {
    return styles.statusCanceled;
  }
  if (status === 'returned') {
    return styles.statusReturned;
  }
  return '';
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [stats, setStats] = useState<OrderStats>({ preparation: 0, packaged: 0, in_transit: 0, delivered: 0, total: 0 });

  // Delivered orders section
  const [showDelivered, setShowDelivered] = useState(false);
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);
  const [deliveredPage, setDeliveredPage] = useState(1);
  const [hasMoreDelivered, setHasMoreDelivered] = useState(true);
  const [loadingDelivered, setLoadingDelivered] = useState(false);

  // Modal states
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [showBulkTrackingModal, setShowBulkTrackingModal] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showCustomMessageModal, setShowCustomMessageModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [packageCalc, setPackageCalc] = useState<PackageCalculation | null>(null);
  const [packageLoading, setPackageLoading] = useState(false);

  const [trackingInput, setTrackingInput] = useState('');
  const [carrierInput, setCarrierInput] = useState('USPS');
  const [pendingStatusChange, setPendingStatusChange] = useState<PendingStatusChange | null>(null);
  const [sendEmailOnStatusChange, setSendEmailOnStatusChange] = useState(true);
  const [bulkTrackingInput, setBulkTrackingInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<{ count: number; url?: string; failed?: number } | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [refreshingTracking, setRefreshingTracking] = useState(false);
  const [updatingStatusOrderId, setUpdatingStatusOrderId] = useState<number | null>(null);
  const [packageForm, setPackageForm] = useState({
    weight_oz: 0,
    length: 0,
    width: 0,
    height: 0,
    box_id: 0,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tnt-mkr.com';

  // Suppress unused variable warning for resolvedTheme if not currently used
  void resolvedTheme;

  useEffect(() => {
    setMounted(true);
  }, []);

  const getAdminToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminJwt') || localStorage.getItem('jwt');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminJwt');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('jwt');
    router.push('/admin/login');
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAdminToken();
      if (!token) {
        router.push('/admin/login?redirect=/admin/orders');
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: '50',
      });
      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`${API_URL}/api/shipping/admin/orders?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('adminJwt');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('jwt');
        router.push('/admin/login?redirect=/admin/orders');
        return;
      }

      if (response.status === 403) {
        setError('Admin access required. Please login with an admin account.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to fetch orders');
      }

      const data = await response.json();
      // Filter out hidden orders
      const allOrders = (data.orders || []).filter((o: Order) => !o.admin_hidden);
      
      const activeOrders = allOrders.filter((o: Order) => o.order_status !== 'delivered');
      const delivered = allOrders.filter((o: Order) => o.order_status === 'delivered');
      
      // Sort by status priority: preparation first, then packaged, then in transit
      activeOrders.sort((a: Order, b: Order) => {
        const getPriority = (status: string) => {
          if (['pending', 'paid', 'printing', 'printed', 'assembling'].includes(status)) return 1;
          if (status === 'packaged') return 2;
          if (['shipped', 'in_transit', 'out_for_delivery'].includes(status)) return 3;
          return 4;
        };
        return getPriority(a.order_status) - getPriority(b.order_status);
      });
      
      setOrders(activeOrders);
      setDeliveredOrders(delivered.slice(0, 10));
      setHasMoreDelivered(delivered.length > 10);
      setTotalPages(data.pagination?.pageCount || 1);
      setTotalOrders(data.pagination?.total || 0);

      // Calculate stats based on unified status
      setStats({
        preparation: allOrders.filter((o: Order) => ['pending', 'paid', 'printing', 'printed', 'assembling'].includes(o.order_status)).length,
        packaged: allOrders.filter((o: Order) => o.order_status === 'packaged').length,
        in_transit: allOrders.filter((o: Order) => ['shipped', 'in_transit', 'out_for_delivery'].includes(o.order_status)).length,
        delivered: delivered.length,
        total: data.pagination?.total || 0,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load orders';
      console.error('Fetch orders error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [API_URL, currentPage, statusFilter, searchQuery, router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const loadMoreDelivered = async () => {
    setLoadingDelivered(true);
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_URL}/api/shipping/admin/orders?status=delivered&page=${deliveredPage + 1}&pageSize=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const newDelivered = (data.orders || []).filter((o: Order) => !o.admin_hidden);
        setDeliveredOrders(prev => [...prev, ...newDelivered]);
        setDeliveredPage(prev => prev + 1);
        setHasMoreDelivered(newDelivered.length === 10);
      }
    } catch (err) {
      console.error('Error loading more delivered orders:', err);
    } finally {
      setLoadingDelivered(false);
    }
  };

  const fetchPackageCalculation = async (orderId: number) => {
    setPackageLoading(true);
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_URL}/api/shipping/admin/orders/${orderId}/package`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to calculate package');

      const data = await response.json();
      setPackageCalc(data);

      if (data.current_package) {
        setPackageForm({
          weight_oz: data.current_package.weight_oz || 0,
          length: data.current_package.length || 0,
          width: data.current_package.width || 0,
          height: data.current_package.height || 0,
          box_id: data.current_package.box?.id || 0,
        });
      } else if (data.calculated_packages && data.calculated_packages.length > 0) {
        const pkg = data.calculated_packages[0];
        setPackageForm({
          weight_oz: pkg.weight_oz,
          length: pkg.length,
          width: pkg.width,
          height: pkg.height,
          box_id: data.recommended_box?.id || 0,
        });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Package calculation error:', err);
      alert(`Error calculating package: ${errorMessage}`);
    } finally {
      setPackageLoading(false);
    }
  };

  const openPackageModal = async (order: Order) => {
    setSelectedOrder(order);
    setShowPackageModal(true);
    setPackageCalc(null);

    if (order.package_weight_oz) {
      setPackageForm({
        weight_oz: order.package_weight_oz,
        length: order.package_length || 0,
        width: order.package_width || 0,
        height: order.package_height || 0,
        box_id: order.shipping_box?.id || 0,
      });
    } else {
      setPackageForm({ weight_oz: 0, length: 0, width: 0, height: 0, box_id: 0 });
    }

    await fetchPackageCalculation(order.id);
  };

  const openTrackingModal = (order: Order) => {
    setSelectedOrder(order);
    setTrackingInput(order.tracking_number || '');
    setCarrierInput(order.carrier_service || 'USPS');
    setShowTrackingModal(true);
  };

  const openOrderDetailModal = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetailModal(true);
  };

  const openNotesModal = (order: Order) => {
    setSelectedOrder(order);
    setNotesInput(order.admin_notes || '');
    setShowNotesModal(true);
  };

  const openCustomMessageModal = (order: Order) => {
    setSelectedOrder(order);
    setShowCustomMessageModal(true);
  };

  const handleUpdatePackage = async () => {
    if (!selectedOrder) return;

    setActionLoading(true);
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_URL}/api/shipping/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          package_weight_oz: packageForm.weight_oz,
          package_length: packageForm.length,
          package_width: packageForm.width,
          package_height: packageForm.height,
          shipping_box_id: packageForm.box_id || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to update package');
      }

      setShowPackageModal(false);
      fetchOrders();
      alert('Package information updated successfully!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert(`Error: ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle unified status change - opens confirmation modal
  const handleStatusChange = async (orderId: number, newStatus: string, order: Order) => {
    // If status hasn't changed, do nothing
    if (newStatus === order.order_status) return;

    // Open the status change confirmation modal
    setPendingStatusChange({
      orderId,
      currentStatus: order.order_status,
      newStatus,
      order,
    });
    
    // Pre-fill tracking info if changing to shipped
    if (newStatus === 'shipped' && !order.tracking_number) {
      setTrackingInput('');
      setCarrierInput('USPS');
    } else {
      setTrackingInput(order.tracking_number || '');
      setCarrierInput(order.carrier_service || 'USPS');
    }
    
    // Default to sending email
    setSendEmailOnStatusChange(true);
    setShowStatusChangeModal(true);
  };

  // Confirm status change and optionally send email
  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;

    setActionLoading(true);
    try {
      const token = getAdminToken();
      const body: UpdateStatusBody = {
        order_status: pendingStatusChange.newStatus,
        send_email: sendEmailOnStatusChange,
      };
      
      // If changing to shipped and tracking number provided
      if (pendingStatusChange.newStatus === 'shipped' && trackingInput.trim()) {
        body.tracking_number = trackingInput.trim();
        body.carrier_service = carrierInput || 'USPS';
      }

      const response = await fetch(`${API_URL}/api/shipping/admin/orders/${pendingStatusChange.orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to update order status');
      }

      const data = await response.json();
      
      setShowStatusChangeModal(false);
      setPendingStatusChange(null);
      setTrackingInput('');
      fetchOrders();
      
      // Show detailed result
      let message = `Status updated: ${data.previous_status} → ${data.new_status}`;
      if (data.tracking_added) {
        message += '\n📦 Tracking number added';
      }
      if (data.email_sent) {
        message += '\n✅ Customer notification email sent';
      } else if (sendEmailOnStatusChange && !data.email_sent) {
        message += '\n⚠️ Email notification could not be sent';
      }
      
      alert(message);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Update order status error:', err);
      alert(`Error: ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateNotes = async () => {
    if (!selectedOrder) return;

    setActionLoading(true);
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_URL}/api/shipping/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ admin_notes: notesInput }),
      });

      if (!response.ok) throw new Error('Failed to update notes');

      setShowNotesModal(false);
      fetchOrders();
      alert('Notes updated successfully!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert(`Error: ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsShipped = async () => {
    if (!selectedOrder) return;

    if (!trackingInput.trim()) {
      alert('Please enter a tracking number');
      return;
    }

    setActionLoading(true);
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_URL}/api/shipping/admin/orders/${selectedOrder.id}/ship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tracking_number: trackingInput.trim(),
          carrier_service: carrierInput,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to mark as shipped');
      }

      const data = await response.json();
      
      setShowTrackingModal(false);
      setTrackingInput('');
      fetchOrders();
      
      // Show detailed success message
      let message = `Order marked as shipped! Status: ${data.tracking_status || 'shipped'}`;
      if (data.email_sent) {
        message += '\n✅ Customer notification email sent.';
      } else if (data.email_details?.reason === 'already_sent') {
        message += '\n📧 Email was already sent previously.';
      } else {
        message += '\n⚠️ Email notification could not be sent.';
      }
      alert(message);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert(`Error: ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefreshTrackingStatus = async (orderId: number) => {
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_URL}/api/shipping/admin/orders/${orderId}/refresh-tracking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to refresh tracking');
      }

      const data = await response.json();
      fetchOrders();
      
      if (data.previous_status !== data.new_status) {
        alert(`Tracking updated! Status changed from "${data.previous_status}" to "${data.new_status}"`);
      } else {
        alert(`Tracking status is current: "${data.new_status}"`);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleRefreshAllTracking = async () => {
    if (!confirm('This will refresh tracking status for all shipped orders. Continue?')) return;

    setRefreshingTracking(true);
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_URL}/api/shipping/admin/refresh-all-tracking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to refresh tracking');
      }

      const data = await response.json();
      fetchOrders();
      alert(data.message);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert(`Error: ${errorMessage}`);
    } finally {
      setRefreshingTracking(false);
    }
  };

  const handleBulkTracking = async () => {
    if (!bulkTrackingInput.trim()) {
      alert('Please enter tracking numbers in the format: ORDER_NUMBER,TRACKING_NUMBER');
      return;
    }

    setActionLoading(true);
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_URL}/api/shipping/admin/bulk-tracking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ csv_data: bulkTrackingInput }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to process bulk tracking');
      }

      const data = await response.json();
      setShowBulkTrackingModal(false);
      setBulkTrackingInput('');
      fetchOrders();
      alert(`Bulk tracking complete!\nSuccessful: ${data.successful}\nFailed: ${data.failed}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert(`Error: ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSyncToGoogleSheets = async () => {
    setSyncLoading(true);
    setSyncResult(null);
    setShowSyncModal(true);

    try {
      const token = getAdminToken();
      const response = await fetch(`${API_URL}/api/shipping/admin/sync-google-sheets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to sync to Google Sheets');
      }

      const data = await response.json();
      setSyncResult({ count: data.synced_count, url: data.sheet_url, failed: data.failed_count });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert(`Error: ${errorMessage}`);
      setShowSyncModal(false);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleExportPirateShip = async () => {
    try {
      const token = getAdminToken();
      const orderIds = selectedOrderIds.length > 0 
        ? selectedOrderIds 
        : [];

      const response = await fetch(`${API_URL}/api/shipping/admin/export-pirate-ship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ order_ids: orderIds.length > 0 ? orderIds : undefined }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Failed to export' } }));
        throw new Error(errorData.error?.message || 'Failed to export for Pirate Ship');
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/csv')) {
        const csvText = await response.text();
        const blob = new Blob([csvText], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pirate-ship-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        alert('CSV exported successfully!');
      } else {
        const data = await response.json();
        if (data.csv) {
          const blob = new Blob([data.csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `pirate-ship-export-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }
        alert(data.message || 'Export complete!');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedOrderIds.length > 0) {
      setShowDeleteConfirmModal(true);
    }
  };

  const confirmDeleteSelected = async () => {
    setDeleteLoading(true);
    try {
      const token = getAdminToken();
      let successCount = 0;
      let failCount = 0;

      for (const orderId of selectedOrderIds) {
        try {
          const response = await fetch(`${API_URL}/api/shipping/admin/orders/${orderId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ admin_hidden: true }),
          });

          if (response.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch {
          failCount++;
        }
      }

      setShowDeleteConfirmModal(false);
      setSelectedOrderIds([]);
      fetchOrders();
      
      if (failCount === 0) {
        alert(`Successfully hidden ${successCount} order(s) from admin view.`);
      } else {
        alert(`Hidden ${successCount} order(s). Failed to hide ${failCount} order(s).`);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert(`Error: ${errorMessage}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleOrderSelection = (orderId: number) => {
    setSelectedOrderIds(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  const isOrderSelected = (orderId: number): boolean => {
    return selectedOrderIds.includes(orderId);
  };

  const selectAllPreparation = () => {
    const prepIds = orders.filter(o => ['pending', 'paid', 'printing', 'printed', 'assembling'].includes(o.order_status)).map(o => o.id);
    setSelectedOrderIds(prepIds);
  };

  const selectAllPackaged = () => {
    const packagedIds = orders.filter(o => o.order_status === 'packaged').map(o => o.id);
    setSelectedOrderIds(packagedIds);
  };

  const clearSelection = () => {
    if (selectedOrderIds.length > 0) {
      setShowClearConfirmModal(true);
    }
  };

  const confirmClearSelection = () => {
    setSelectedOrderIds([]);
    setShowClearConfirmModal(false);
  };

  if (!mounted) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.pageTitle}>ORDER MANAGEMENT</h1>

        <div className={styles.statsBar}>
          <div className={`${styles.statCard} ${styles.statBlue}`}>
            <span className={styles.statNumber}>{stats.preparation}</span>
            <span className={styles.statLabel}>In Preparation</span>
          </div>
          <div className={`${styles.statCard} ${styles.statOrange}`}>
            <span className={styles.statNumber}>{stats.packaged}</span>
            <span className={styles.statLabel}>Packaged</span>
          </div>
          <div className={`${styles.statCard} ${styles.statYellow}`}>
            <span className={styles.statNumber}>{stats.in_transit}</span>
            <span className={styles.statLabel}>In Transit</span>
          </div>
          <div className={`${styles.statCard} ${styles.statGreen}`}>
            <span className={styles.statNumber}>{stats.delivered}</span>
            <span className={styles.statLabel}>Delivered</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{stats.total}</span>
            <span className={styles.statLabel}>Total Orders</span>
          </div>
        </div>

        <div className={styles.actionBar}>
          <div className={styles.actionGroup}>
            <button onClick={handleSyncToGoogleSheets} className={styles.actionBtn}>
              📊 Sync to Sheets
            </button>
            <button onClick={handleExportPirateShip} className={styles.actionBtn}>
              🏴‍☠️ Export for Pirate Ship ({selectedOrderIds.length || 'all packaged'})
            </button>
            <button onClick={() => setShowBulkTrackingModal(true)} className={styles.actionBtn}>
              📦 Bulk Add Tracking
            </button>
            <button 
              onClick={handleRefreshAllTracking} 
              className={styles.actionBtn}
              disabled={refreshingTracking}
            >
              {refreshingTracking ? '🔄 Refreshing...' : '🔄 Refresh All Tracking'}
            </button>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>

        <div className={styles.filtersRow}>
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Statuses</option>
            {UNIFIED_STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.emoji} {opt.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.selectionActions}>
          <button onClick={selectAllPreparation} className={styles.selectionBtn}>
            Select In Preparation
          </button>
          <button onClick={selectAllPackaged} className={styles.selectionBtn}>
            Select Packaged
          </button>
          <button 
            onClick={clearSelection} 
            className={styles.selectionBtn} 
            disabled={selectedOrderIds.length === 0}
          >
            Clear Selection ({selectedOrderIds.length})
          </button>
          <button 
            onClick={handleDeleteSelected} 
            className={`${styles.selectionBtn} ${styles.deleteBtn}`}
            disabled={selectedOrderIds.length === 0}
          >
            🗑️ Delete Selected ({selectedOrderIds.length})
          </button>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <span>⚠️</span> {error}
          </div>
        )}

        {loading && (
          <div className={styles.loadingWrapper}>
            <div className={styles.spinner}></div>
            <p>Loading orders...</p>
          </div>
        )}

        {!loading && !error && (
          <div className={styles.ordersGrid}>
            {orders.map(order => {
              const isSelected = isOrderSelected(order.id);
              const isUpdatingStatus = updatingStatusOrderId === order.id;
              const borderClass = getStatusBorderClass(order.order_status);
              return (
                <div 
                  key={order.id} 
                  className={`${styles.orderCard} ${borderClass ? styles[borderClass] : ''} ${isSelected ? styles.selected : ''}`}
                >
                  <div className={styles.orderHeader}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOrderSelection(order.id)}
                      className={styles.orderCheckbox}
                    />
                    <div className={styles.orderInfo}>
                      <span className={styles.orderNumber}>{order.order_number}</span>
                      <span className={styles.orderDate}>{formatDate(order.ordered_at)}</span>
                    </div>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(order.order_status)}`}>
                      {STATUS_LABELS[order.order_status] || order.order_status}
                    </span>
                  </div>

                  <div className={styles.orderBody}>
                    <div className={styles.customerInfo}>
                      <p className={styles.customerName}>{order.customer_name}</p>
                      <p className={styles.customerEmail}>{getEmail(order)}</p>
                    </div>

                    <div className={styles.orderTotal}>
                      {formatCurrency(order.total_amount)}
                    </div>

                    <div className={styles.itemsSummary}>
                      {order.order_items?.map((item, idx) => (
                        <div key={idx} className={styles.itemLine}>
                          {item.product?.name || 'Product'} × {item.quantity}: {formatCurrency(item.price * 100 * item.quantity)}
                        </div>
                      ))}
                    </div>

                    {/* Unified Status Dropdown */}
                    <div className={styles.statusWrapper}>
                      <label className={styles.statusLabel}>Status:</label>
                      <select
                        value={order.order_status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value, order)}
                        className={styles.statusSelect}
                        disabled={isUpdatingStatus}
                      >
                        {UNIFIED_STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.emoji} {opt.label}</option>
                        ))}
                      </select>
                      {isUpdatingStatus && <span className={styles.statusSpinner}>⏳</span>}
                    </div>

                    {order.tracking_number && (
                      <div className={styles.trackingInfo}>
                        <span>📦 {order.carrier_service || 'USPS'}: </span>
                        <a 
                          href={getTrackingUrl(order.tracking_number, order.carrier_service)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.trackingLink}
                        >
                          {order.tracking_number}
                        </a>
                        <button
                          onClick={() => handleRefreshTrackingStatus(order.id)}
                          className={styles.refreshTrackingBtn}
                          title="Refresh tracking status from carrier"
                        >
                          🔄
                        </button>
                      </div>
                    )}

                    {order.admin_notes && (
                      <div className={styles.notesPreview}>
                        📝 {order.admin_notes.substring(0, 100)}{order.admin_notes.length > 100 ? '...' : ''}
                      </div>
                    )}
                  </div>

                  <div className={styles.orderActions}>
                    <button onClick={() => openOrderDetailModal(order)} className={styles.orderActionBtn}>
                      📋 Details
                    </button>
                    <button onClick={() => openPackageModal(order)} className={styles.orderActionBtn}>
                      📦 Package
                    </button>
                    <button onClick={() => openNotesModal(order)} className={styles.orderActionBtn}>
                      📝 Notes
                    </button>
                    <button onClick={() => openCustomMessageModal(order)} className={styles.orderActionBtn}>
                      💬 Message
                    </button>
                    {!order.tracking_number && (
                      <button onClick={() => openTrackingModal(order)} className={`${styles.orderActionBtn} ${styles.primaryBtn}`}>
                        🚚 Add Tracking
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className={styles.emptyState}>
            <p>No active orders found.</p>
          </div>
        )}

        <div className={styles.deliveredSection}>
          <button 
            onClick={() => setShowDelivered(!showDelivered)} 
            className={styles.deliveredToggle}
          >
            {showDelivered ? '▼' : '▶'} Delivered Orders ({stats.delivered})
          </button>
          
          {showDelivered && (
            <div className={styles.deliveredGrid}>
              {deliveredOrders.map(order => (
                <div key={order.id} className={`${styles.orderCard} ${styles.borderGreen}`}>
                  <div className={styles.orderHeader}>
                    <div className={styles.orderInfo}>
                      <span className={styles.orderNumber}>{order.order_number}</span>
                      <span className={styles.orderDate}>{formatDate(order.ordered_at)}</span>
                    </div>
                    <span className={`${styles.statusBadge} ${styles.statusDelivered}`}>
                      DELIVERED
                    </span>
                  </div>
                  <div className={styles.orderBody}>
                    <p className={styles.customerName}>{order.customer_name}</p>
                    <div className={styles.orderTotal}>{formatCurrency(order.total_amount)}</div>
                    
                    {/* Status dropdown for delivered orders too */}
                    <div className={styles.statusWrapper}>
                      <label className={styles.statusLabel}>Status:</label>
                      <select
                        value={order.order_status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value, order)}
                        className={styles.statusSelect}
                        disabled={updatingStatusOrderId === order.id}
                      >
                        {UNIFIED_STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.emoji} {opt.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    {order.tracking_number && (
                      <div className={styles.trackingInfo}>
                        <a 
                          href={getTrackingUrl(order.tracking_number, order.carrier_service)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.trackingLink}
                        >
                          {order.tracking_number}
                        </a>
                      </div>
                    )}
                  </div>
                  <div className={styles.orderActions}>
                    <button onClick={() => openOrderDetailModal(order)} className={styles.orderActionBtn}>
                      📋 Details
                    </button>
                    <button onClick={() => openCustomMessageModal(order)} className={styles.orderActionBtn}>
                      💬 Message
                    </button>
                  </div>
                </div>
              ))}
              
              {hasMoreDelivered && (
                <button 
                  onClick={loadMoreDelivered} 
                  className={styles.loadMoreBtn}
                  disabled={loadingDelivered}
                >
                  {loadingDelivered ? 'Loading...' : 'Load More (10)'}
                </button>
              )}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={styles.pageButton}
            >
              Previous
            </button>
            <span className={styles.pageInfo}>
              Page {currentPage} of {totalPages} ({totalOrders} orders)
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={styles.pageButton}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Custom Message Modal */}
      {showCustomMessageModal && selectedOrder && (
        <CustomMessageModal
          order={selectedOrder}
          onClose={() => {
            setShowCustomMessageModal(false);
            setSelectedOrder(null);
          }}
          onSuccess={(message: string) => {
            alert(message);
          }}
          onError={(errorMsg: string) => {
            alert(`Error: ${errorMsg}`);
          }}
        />
      )}

      {/* Clear Selection Confirmation Modal */}
      {showClearConfirmModal && (
        <div className={styles.modalOverlay} onClick={() => setShowClearConfirmModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Confirm Clear Selection</h2>
              <button onClick={() => setShowClearConfirmModal(false)} className={styles.closeBtn}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to clear the selection of {selectedOrderIds.length} order(s)?</p>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={() => setShowClearConfirmModal(false)} className={styles.cancelBtn}>Cancel</button>
              <button onClick={confirmClearSelection} className={styles.submitBtn}>Yes, Clear</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className={styles.modalOverlay} onClick={() => !deleteLoading && setShowDeleteConfirmModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>⚠️ Confirm Delete</h2>
              {!deleteLoading && (
                <button onClick={() => setShowDeleteConfirmModal(false)} className={styles.closeBtn}>×</button>
              )}
            </div>
            <div className={styles.modalBody}>
              <p className={styles.deleteWarning}>
                Are you sure you want to hide {selectedOrderIds.length} order(s) from the admin page?
              </p>
              <p className={styles.deleteNote}>
                This will remove the order(s) from this view but they will still be available in the Strapi admin panel.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                onClick={() => setShowDeleteConfirmModal(false)} 
                className={styles.cancelBtn}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteSelected} 
                className={styles.deleteBtnConfirm}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Confirmation Modal */}
      {showStatusChangeModal && pendingStatusChange && (
        <div className={styles.modalOverlay} onClick={() => !actionLoading && setShowStatusChangeModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>📝 Update Order Status</h2>
              {!actionLoading && (
                <button onClick={() => { setShowStatusChangeModal(false); setPendingStatusChange(null); }} className={styles.closeBtn}>×</button>
              )}
            </div>
            <div className={styles.modalBody}>
              <div className={styles.statusChangeInfo}>
                <span>{STATUS_LABELS[pendingStatusChange.currentStatus] || pendingStatusChange.currentStatus}</span>
                <span className={styles.statusArrow}>→</span>
                <span><strong>{STATUS_LABELS[pendingStatusChange.newStatus] || pendingStatusChange.newStatus}</strong></span>
              </div>

              {/* Show tracking input if changing to shipped */}
              {pendingStatusChange.newStatus === 'shipped' && !pendingStatusChange.order.tracking_number && (
                <>
                  <div className={styles.formGroup}>
                    <label>Tracking Number (Optional)</label>
                    <input
                      type="text"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder="Enter tracking number"
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Carrier</label>
                    <select
                      value={carrierInput}
                      onChange={(e) => setCarrierInput(e.target.value)}
                      className={styles.formSelect}
                    >
                      <option value="USPS">USPS</option>
                      <option value="UPS">UPS</option>
                      <option value="FedEx">FedEx</option>
                      <option value="DHL">DHL</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </>
              )}

              <label className={styles.emailCheckbox}>
                <input
                  type="checkbox"
                  checked={sendEmailOnStatusChange}
                  onChange={(e) => setSendEmailOnStatusChange(e.target.checked)}
                />
                <span>📧 Send email notification to customer</span>
              </label>

              {sendEmailOnStatusChange && STATUS_EMAIL_INFO[pendingStatusChange.newStatus] && (
                <div className={styles.emailPreview}>
                  <h4>Email Preview:</h4>
                  <p><strong>Subject:</strong> {STATUS_EMAIL_INFO[pendingStatusChange.newStatus].subject}</p>
                  <p><strong>Message:</strong> {STATUS_EMAIL_INFO[pendingStatusChange.newStatus].preview}</p>
                  <p style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                    📬 Will be sent to: {getEmail(pendingStatusChange.order)}
                  </p>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button 
                onClick={() => { setShowStatusChangeModal(false); setPendingStatusChange(null); }} 
                className={styles.cancelBtn}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                onClick={confirmStatusChange} 
                className={styles.submitBtn}
                disabled={actionLoading}
              >
                {actionLoading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package Modal */}
      {showPackageModal && selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setShowPackageModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Package Details - {selectedOrder.order_number}</h2>
              <button onClick={() => setShowPackageModal(false)} className={styles.closeBtn}>×</button>
            </div>
            <div className={styles.modalBody}>
              {packageLoading ? (
                <div className={styles.loadingWrapper}>
                  <div className={styles.spinner}></div>
                  <p>Calculating package...</p>
                </div>
              ) : (
                <>
                  {packageCalc?.calculated_packages && packageCalc.calculated_packages.length > 0 && (
                    <div className={styles.recommendation}>
                      <h4>Recommended Package:</h4>
                      <p>Box: {packageCalc.calculated_packages[0].box_name}</p>
                      <p>Dimensions: {packageCalc.calculated_packages[0].length}&quot; × {packageCalc.calculated_packages[0].width}&quot; × {packageCalc.calculated_packages[0].height}&quot;</p>
                      <p>Estimated Weight: {packageCalc.calculated_packages[0].weight_oz} oz</p>
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label>Weight (oz)</label>
                    <input
                      type="number"
                      value={packageForm.weight_oz}
                      onChange={(e) => setPackageForm(prev => ({ ...prev, weight_oz: parseFloat(e.target.value) || 0 }))}
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.dimensionsRow}>
                    <div className={styles.formGroup}>
                      <label>Length (in)</label>
                      <input
                        type="number"
                        value={packageForm.length}
                        onChange={(e) => setPackageForm(prev => ({ ...prev, length: parseFloat(e.target.value) || 0 }))}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Width (in)</label>
                      <input
                        type="number"
                        value={packageForm.width}
                        onChange={(e) => setPackageForm(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Height (in)</label>
                      <input
                        type="number"
                        value={packageForm.height}
                        onChange={(e) => setPackageForm(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                        className={styles.formInput}
                      />
                    </div>
                  </div>

                  {packageCalc?.available_boxes && packageCalc.available_boxes.length > 0 && (
                    <div className={styles.formGroup}>
                      <label>Shipping Box</label>
                      <select
                        value={packageForm.box_id}
                        onChange={(e) => setPackageForm(prev => ({ ...prev, box_id: parseInt(e.target.value) || 0 }))}
                        className={styles.formSelect}
                      >
                        <option value={0}>Custom / No Box</option>
                        {packageCalc.available_boxes.map(box => (
                          <option key={box.id} value={box.id}>
                            {box.name} ({box.length}&quot; × {box.width}&quot; × {box.height}&quot;)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button onClick={() => setShowPackageModal(false)} className={styles.cancelBtn}>Cancel</button>
              <button onClick={handleUpdatePackage} disabled={actionLoading} className={styles.submitBtn}>
                {actionLoading ? 'Saving...' : 'Save Package Info'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {showTrackingModal && selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setShowTrackingModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Add Tracking - {selectedOrder.order_number}</h2>
              <button onClick={() => setShowTrackingModal(false)} className={styles.closeBtn}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Tracking Number</label>
                <input
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Enter tracking number"
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Carrier</label>
                <select
                  value={carrierInput}
                  onChange={(e) => setCarrierInput(e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="USPS">USPS</option>
                  <option value="UPS">UPS</option>
                  <option value="FedEx">FedEx</option>
                  <option value="DHL">DHL</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <p className={styles.helpText}>
                📧 A shipping notification will be sent to {getEmail(selectedOrder)} and BCC&apos;d to customer service.
              </p>
              <p className={styles.helpText}>
                🔄 The tracking status will be automatically updated via EasyPost integration.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={() => setShowTrackingModal(false)} className={styles.cancelBtn}>Cancel</button>
              <button onClick={handleMarkAsShipped} disabled={actionLoading} className={styles.submitBtn}>
                {actionLoading ? 'Processing...' : 'Mark as Shipped'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Tracking Modal */}
      {showBulkTrackingModal && (
        <div className={styles.modalOverlay} onClick={() => setShowBulkTrackingModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Bulk Add Tracking Numbers</h2>
              <button onClick={() => setShowBulkTrackingModal(false)} className={styles.closeBtn}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.helpText}>
                Enter one order per line in the format: <code>ORDER_NUMBER,TRACKING_NUMBER</code>
              </p>
              <textarea
                value={bulkTrackingInput}
                onChange={(e) => setBulkTrackingInput(e.target.value)}
                placeholder={`ORD-1234567890-123,9400111899223334445566\nORD-1234567890-456,9400111899223334445577`}
                className={styles.bulkTextarea}
                rows={10}
              />
            </div>
            <div className={styles.modalFooter}>
              <button onClick={() => setShowBulkTrackingModal(false)} className={styles.cancelBtn}>Cancel</button>
              <button onClick={handleBulkTracking} disabled={actionLoading} className={styles.submitBtn}>
                {actionLoading ? 'Processing...' : 'Add Tracking Numbers'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setShowNotesModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Order Notes - {selectedOrder.order_number}</h2>
              <button onClick={() => setShowNotesModal(false)} className={styles.closeBtn}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Internal Notes</label>
                <textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Add internal notes about this order..."
                  className={styles.notesTextarea}
                  rows={6}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={() => setShowNotesModal(false)} className={styles.cancelBtn}>Cancel</button>
              <button onClick={handleUpdateNotes} disabled={actionLoading} className={styles.submitBtn}>
                {actionLoading ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync Modal */}
      {showSyncModal && (
        <div className={styles.modalOverlay} onClick={() => !syncLoading && setShowSyncModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Google Sheets Sync</h2>
              {!syncLoading && (
                <button onClick={() => setShowSyncModal(false)} className={styles.closeBtn}>×</button>
              )}
            </div>
            <div className={styles.modalBody}>
              {syncLoading ? (
                <div className={styles.loadingWrapper}>
                  <div className={styles.spinner}></div>
                  <p>Syncing orders to Google Sheets...</p>
                </div>
              ) : syncResult ? (
                <div className={styles.syncResult}>
                  <p className={styles.successText}>✅ Successfully synced {syncResult.count} orders!</p>
                  {syncResult.failed && syncResult.failed > 0 && (
                    <p className={styles.warningText}>⚠️ {syncResult.failed} orders failed to sync.</p>
                  )}
                  {syncResult.url && (
                    <a href={syncResult.url} target="_blank" rel="noopener noreferrer" className={styles.sheetLink}>
                      Open Google Sheet →
                    </a>
                  )}
                </div>
              ) : null}
            </div>
            {!syncLoading && (
              <div className={styles.modalFooter}>
                <button onClick={() => setShowSyncModal(false)} className={styles.submitBtn}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showOrderDetailModal && selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setShowOrderDetailModal(false)}>
          <div className={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Order Details - {selectedOrder.order_number}</h2>
              <button onClick={() => setShowOrderDetailModal(false)} className={styles.closeBtn}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailSection}>
                  <h4>Customer Information</h4>
                  <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                  <p><strong>Email:</strong> {getEmail(selectedOrder)}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customer_phone || 'N/A'}</p>
                </div>

                <div className={styles.detailSection}>
                  <h4>Shipping Address</h4>
                  {selectedOrder.shipping_address ? (
                    <>
                      <p>{selectedOrder.shipping_address.street}</p>
                      {selectedOrder.shipping_address.street2 && <p>{selectedOrder.shipping_address.street2}</p>}
                      <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}</p>
                      <p>{selectedOrder.shipping_address.country}</p>
                    </>
                  ) : (
                    <p>No address on file</p>
                  )}
                </div>

                <div className={styles.detailSection}>
                  <h4>Order Status</h4>
                  <p><strong>Status:</strong> {STATUS_LABELS[selectedOrder.order_status] || selectedOrder.order_status}</p>
                  <p><strong>Payment Status:</strong> {selectedOrder.payment_status}</p>
                  <p><strong>Ordered:</strong> {formatDate(selectedOrder.ordered_at)}</p>
                  {selectedOrder.shipped_at && (
                    <p><strong>Shipped:</strong> {formatDate(selectedOrder.shipped_at)}</p>
                  )}
                </div>

                <div className={styles.detailSection}>
                  <h4>Order Totals</h4>
                  <p><strong>Subtotal:</strong> {formatCurrency(selectedOrder.subtotal)}</p>
                  <p><strong>Shipping:</strong> {formatCurrency(selectedOrder.shipping_cost)}</p>
                  <p><strong>Tax:</strong> {formatCurrency(selectedOrder.sales_tax)}</p>
                  {selectedOrder.discount_total && selectedOrder.discount_total > 0 && (
                    <p><strong>Discount:</strong> -{formatCurrency(selectedOrder.discount_total)}</p>
                  )}
                  <p className={styles.totalAmount}><strong>Total:</strong> {formatCurrency(selectedOrder.total_amount)}</p>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h4>Order Items</h4>
                <div className={styles.itemsList}>
                  {selectedOrder.order_items?.map((item, index) => (
                    <div key={item.id || index} className={styles.itemRow}>
                      <span className={styles.itemName}>
                        {item.product?.name || 'Product'}
                        {item.is_additional_part && ' (Additional Part)'}
                      </span>
                      <span className={styles.itemQty}> × {item.quantity}</span>
                      <span className={styles.itemPrice}>: {formatCurrency(item.price * 100)}</span>
                      {item.order_item_parts?.length > 0 && (
                        <div className={styles.itemParts}>
                          {item.order_item_parts.map((part, pIndex) => (
                            <span key={pIndex} className={styles.partDetail}>
                              {part.product_part?.name}: {part.color?.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.tracking_number && (
                <div className={styles.detailSection}>
                  <h4>Shipping Information</h4>
                  <p><strong>Carrier:</strong> {selectedOrder.carrier_service}</p>
                  <p>
                    <strong>Tracking:</strong>{' '}
                    <a 
                      href={getTrackingUrl(selectedOrder.tracking_number, selectedOrder.carrier_service)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.trackingLink}
                    >
                      {selectedOrder.tracking_number}
                    </a>
                  </p>
                  {selectedOrder.estimated_delivery_date && (
                    <p><strong>Est. Delivery:</strong> {formatDate(selectedOrder.estimated_delivery_date)}</p>
                  )}
                </div>
              )}

              {selectedOrder.admin_notes && (
                <div className={styles.detailSection}>
                  <h4>Internal Notes</h4>
                  <p className={styles.notesContent}>{selectedOrder.admin_notes}</p>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button onClick={() => openCustomMessageModal(selectedOrder)} className={styles.cancelBtn}>
                💬 Send Message
              </button>
              <button onClick={() => setShowOrderDetailModal(false)} className={styles.submitBtn}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}