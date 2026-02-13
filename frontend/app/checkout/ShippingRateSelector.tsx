'use client';

import React, { useState, useEffect } from 'react';
import styles from './ShippingRateSelector.module.css';
import type { ShippingAddress, ShippingRate } from '../../lib/types';

interface ShippingRateCartItem {
  id?: string;
  productId?: number;
  product_id?: number;
  quantity: number;
  is_additional_part?: boolean;
  cart_item_parts?: Array<{
    id?: number;
    product_part?: { id: number; name?: string };
    product_part_id?: number
  }>;
}

interface ShippingRateSelectorProps {
  address: ShippingAddress;
  cartItems: ShippingRateCartItem[];
  isAddressValidated: boolean;
  onRateSelected: (rate: ShippingRate | null, shipmentId?: string) => void;
  selectedRateId?: string;
}

// Filter rates to only include USPS Ground Advantage, Priority, and Express
function filterUSPSRates(rates: ShippingRate[]): ShippingRate[] {
  return rates.filter((rate) => {
    if (rate.carrier !== 'USPS') return false;
    
    const serviceLower = rate.service.toLowerCase();
    
    // Match Ground Advantage
    if (serviceLower.includes('ground') && serviceLower.includes('advantage')) {
      return true;
    }
    
    // Match Priority Mail (but not Priority Mail Express)
    if (serviceLower.includes('priority') && !serviceLower.includes('express')) {
      return true;
    }
    
    // Match Priority Mail Express or Express
    if (serviceLower.includes('express')) {
      return true;
    }
    
    return false;
  });
}

// Sort rates: Ground Advantage (0), Priority (1), Express (2)
function sortUSPSRates(rates: ShippingRate[]): ShippingRate[] {
  const getServiceOrder = (service: string): number => {
    const serviceLower = service.toLowerCase();
    if (serviceLower.includes('ground') && serviceLower.includes('advantage')) return 0;
    if (serviceLower.includes('priority') && !serviceLower.includes('express')) return 1;
    if (serviceLower.includes('express')) return 2;
    return 99;
  };
  
  return [...rates].sort((a, b) => getServiceOrder(a.service) - getServiceOrder(b.service));
}

// Get standardized display name for service
function getDisplayName(service: string): string {
  const serviceLower = service.toLowerCase();
  
  if (serviceLower.includes('ground') && serviceLower.includes('advantage')) {
    return 'USPS Ground Advantage';
  }
  if (serviceLower.includes('express')) {
    return 'USPS Priority Mail Express';
  }
  if (serviceLower.includes('priority')) {
    return 'USPS Priority Mail';
  }
  
  return service;
}

// Get delivery time description
function getDeliveryDescription(service: string): string {
  const serviceLower = service.toLowerCase();
  
  if (serviceLower.includes('ground') && serviceLower.includes('advantage')) {
    return '3-5 business days';
  }
  if (serviceLower.includes('express')) {
    return '1-2 business days';
  }
  if (serviceLower.includes('priority')) {
    return '2-3 business days';
  }
  
  return 'Varies';
}

export default function ShippingRateSelector({
  address,
  cartItems,
  isAddressValidated,
  onRateSelected,
  selectedRateId,
}: ShippingRateSelectorProps) {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [shipmentId, setShipmentId] = useState<string | undefined>();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!isAddressValidated || cartItems.length === 0) {
      setRates([]);
      setError(null);
      return;
    }

    const fetchRates = async () => {
      setLoading(true);
      setError(null);

      try {
        const transformedItems = cartItems.map(item => ({
          product_id: item.productId || item.product_id,
          quantity: item.quantity,
          is_additional_part: item.is_additional_part || false,
          cart_item_parts: item.cart_item_parts?.map(part => ({
            product_part_id: part.product_part?.id || part.product_part_id,
          })) || [],
        }));

        const response = await fetch(`${API_URL}/api/shipping/rates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address,
            cart_items: transformedItems,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to get shipping rates');
        }

        const data = await response.json();
        
        // Filter and sort rates on client side as well (backend should already do this)
        const filteredRates = filterUSPSRates(data.rates || []);
        const sortedRates = sortUSPSRates(filteredRates);
        
        setRates(sortedRates);
        setFallbackUsed(data.fallback_used || false);
        setShipmentId(data.shipment_id);

        // Auto-select first rate if none selected
        if (sortedRates.length > 0 && !selectedRateId) {
          onRateSelected(sortedRates[0], data.shipment_id);
        }
      } catch (err: unknown) {
        console.error('Fetch rates error:', err);
        setError(err instanceof Error ? err.message : 'Failed to get shipping rates');
        setRates([]);
        onRateSelected(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, [isAddressValidated, address.postal_code, address.state, cartItems.length, API_URL]);

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDeliveryDate = (dateStr: string | null, days: number | null) => {
    // Add 5 days for manufacturing
    const manufacturingDays = 5;
    
    if (dateStr) {
      const date = new Date(dateStr);
      date.setDate(date.getDate() + manufacturingDays);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
    if (days !== null) {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + days + manufacturingDays);
      return deliveryDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
    return 'Varies';
  };

  const getServiceIcon = (service: string) => {
    const serviceLower = service.toLowerCase();
    
    if (serviceLower.includes('express')) return '⚡';
    if (serviceLower.includes('priority')) return '🚀';
    if (serviceLower.includes('ground')) return '📦';
    return '📬';
  };

  if (!isAddressValidated) {
    return (
      <div className={styles.container}>
        <div className={styles.placeholder}>
          <span className={styles.placeholderIcon}>📍</span>
          <p>Please validate your shipping address to see available shipping options</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Calculating shipping rates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <span className={styles.errorIcon}>⚠️</span>
          <div>
            <p className={styles.errorTitle}>Unable to get shipping rates</p>
            <p className={styles.errorMessage}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (rates.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.noRates}>
          <span className={styles.noRatesIcon}>📭</span>
          <p>No shipping options available for this address.</p>
          <p className={styles.noRatesHint}>Please verify your address is correct and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {fallbackUsed && (
        <div className={styles.fallbackNotice}>
          <span>ℹ️</span>
          <span>Estimated rates shown. Final rates will be confirmed at shipment.</span>
        </div>
      )}

      <div className={styles.manufacturingNotice}>
        <span>🏭</span>
        <span><strong>Note:</strong> Add up to 5 business days for manufacturing before shipping begins.</span>
      </div>

      <div className={styles.ratesList}>
        {rates.map((rate) => {
          const displayName = getDisplayName(rate.service);
          const deliveryDesc = getDeliveryDescription(rate.service);
          
          return (
            <label
              key={rate.id}
              className={`${styles.rateOption} ${selectedRateId === rate.id ? styles.selected : ''}`}
            >
              <input
                type="radio"
                name="shipping_rate"
                value={rate.id}
                checked={selectedRateId === rate.id}
                onChange={() => onRateSelected(rate, shipmentId)}
                className={styles.radioInput}
              />
              <div className={styles.rateContent}>
                <div className={styles.rateHeader}>
                  <span className={styles.carrierLogo}>🇺🇸</span>
                  <span className={styles.serviceIcon}>{getServiceIcon(rate.service)}</span>
                  <span className={styles.serviceName}>{displayName}</span>
                  {rate.delivery_guarantee && (
                    <span className={styles.guarantee}>✓ Guaranteed</span>
                  )}
                </div>
                <div className={styles.rateDetails}>
                  <span className={styles.serviceDescription}>{deliveryDesc}</span>
                  <span className={styles.deliveryTime}>
                    📅 Est. arrival: {formatDeliveryDate(rate.estimated_delivery_date, rate.estimated_delivery_days)}
                  </span>
                </div>
              </div>
              <div className={styles.ratePrice}>
                {formatCurrency(rate.rate_with_handling_cents)}
              </div>
            </label>
          );
        })}
      </div>

      <p className={styles.handlingNote}>
        * All rates include secure packaging and handling
      </p>
    </div>
  );
}