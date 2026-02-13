'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './ShippingAddressForm.module.css';
import type { ShippingAddress } from '../../lib/types';

interface AddressSuggestion {
  id: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  postal_code: string;
  full_address: string;
}

interface ValidationResult {
  is_valid: boolean;
  easypost_id?: string;
  suggested_address?: {
    street: string;
    street2?: string;
    city: string;
    state: string;
    postal_code: string;
  };
  error?: string;
}

interface ShippingAddressFormProps {
  address: ShippingAddress;
  onChange: (address: ShippingAddress) => void;
  onValidated: (isValid: boolean, easypostId?: string) => void;
  disabled?: boolean;
}

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' }, { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' }, { code: 'DC', name: 'District of Columbia' },
  { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' },
  { code: 'ID', name: 'Idaho' }, { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' }, { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' }, { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' }, { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' }, { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' }, { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

const NON_CONTINENTAL = ['AK', 'HI', 'PR', 'VI', 'GU', 'AS', 'MP'];

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ShippingAddressForm({
  address,
  onChange,
  onValidated,
  disabled = false,
}: ShippingAddressFormProps) {
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  
  // Autocomplete state
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [streetInputFocused, setStreetInputFocused] = useState(false);
  
  const streetInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  // Debounce the street address for autocomplete
  const debouncedStreet = useDebounce(address.street, 350);

  // Fetch address suggestions when street changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      // Need at least 5 characters and the input must be focused
      if (debouncedStreet.length < 5 || !streetInputFocused) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const response = await fetch(`${API_URL}/api/shipping/address-suggestions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            partial_address: debouncedStreet,
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions(data.suggestions && data.suggestions.length > 0);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [debouncedStreet, address.city, address.state, address.postal_code, streetInputFocused, API_URL]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        streetInputRef.current &&
        !streetInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (field: keyof ShippingAddress, value: string) => {
    const newAddress = { ...address, [field]: value };
    onChange(newAddress);
    setValidationResult(null);
    setShowSuggestion(false);
    onValidated(false);
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleChange('phone', formatted);
  };

  const handleStreetChange = (value: string) => {
    handleChange('street', value);
    setSelectedSuggestionIndex(-1);
  };

  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    const newAddress: ShippingAddress = {
      ...address,
      street: suggestion.street,
      street2: suggestion.street2 || '',
      city: suggestion.city,
      state: suggestion.state,
      postal_code: suggestion.postal_code,
    };
    onChange(newAddress);
    setShowSuggestions(false);
    setSuggestions([]);
    setValidationResult(null);
    setShowSuggestion(false);
    
    // Auto-validate after selecting a suggestion
    setTimeout(() => {
      validateAddressWithData(newAddress);
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const validateAddressWithData = async (addressToValidate: ShippingAddress) => {
    if (NON_CONTINENTAL.includes(addressToValidate.state)) {
      setValidationResult({
        is_valid: false,
        error: 'We currently only ship to the continental United States (excludes Alaska, Hawaii, and US territories).',
      });
      onValidated(false);
      return;
    }

    if (!addressToValidate.street || !addressToValidate.city || !addressToValidate.state || !addressToValidate.postal_code) {
      setValidationResult({
        is_valid: false,
        error: 'Please fill in all required address fields.',
      });
      onValidated(false);
      return;
    }

    if (!addressToValidate.phone || addressToValidate.phone.replace(/\D/g, '').length < 10) {
      setValidationResult({
        is_valid: false,
        error: 'Please enter a valid 10-digit phone number.',
      });
      onValidated(false);
      return;
    }

    setValidating(true);
    try {
      const response = await fetch(`${API_URL}/api/shipping/validate-address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addressToValidate }),
      });

      const result: ValidationResult = await response.json();
      setValidationResult(result);

      if (result.is_valid) {
        // Check if suggested address is different from entered address
        if (result.suggested_address && hasAddressDifferences(addressToValidate, result.suggested_address)) {
          setShowSuggestion(true);
          onValidated(false);
        } else {
          onValidated(true, result.easypost_id);
          setShowSuggestion(false);
        }
      } else {
        onValidated(false);
      }
    } catch (error) {
      console.error('Address validation error:', error);
      setValidationResult({
        is_valid: false,
        error: 'Unable to validate address. Please check your connection and try again.',
      });
      onValidated(false);
    } finally {
      setValidating(false);
    }
  };

  const hasAddressDifferences = (
    original: ShippingAddress,
    suggested: { street: string; street2?: string; city: string; state: string; postal_code: string }
  ): boolean => {
    const normalizeStr = (s: string) => s.toUpperCase().trim().replace(/\s+/g, ' ');
    return (
      normalizeStr(original.street) !== normalizeStr(suggested.street) ||
      normalizeStr(original.city) !== normalizeStr(suggested.city) ||
      normalizeStr(original.state) !== normalizeStr(suggested.state) ||
      original.postal_code !== suggested.postal_code
    );
  };

  const validateAddress = async () => {
    await validateAddressWithData(address);
  };

  const applySuggestion = (suggestion: { street: string; street2?: string; city: string; state: string; postal_code: string }) => {
    const newAddress: ShippingAddress = {
      ...address,
      street: suggestion.street,
      street2: suggestion.street2 || address.street2,
      city: suggestion.city,
      state: suggestion.state,
      postal_code: suggestion.postal_code,
    };
    onChange(newAddress);
    setShowSuggestion(false);
    setValidationResult({ is_valid: true });
    onValidated(true);
  };

  const keepOriginal = () => {
    setShowSuggestion(false);
    setValidationResult({ is_valid: true });
    onValidated(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Street Address *</label>
          <div className={styles.autocompleteWrapper}>
            <input
              ref={streetInputRef}
              type="text"
              value={address.street}
              onChange={(e) => handleStreetChange(e.target.value)}
              onFocus={() => setStreetInputFocused(true)}
              onBlur={() => {
                // Delay to allow click on suggestion
                setTimeout(() => setStreetInputFocused(false), 200);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Start typing your address..."
              disabled={disabled}
              required
              autoComplete="off"
              className={styles.streetInput}
            />
            {loadingSuggestions && (
              <div className={styles.inputSpinner}></div>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <div ref={suggestionsRef} className={styles.suggestionsDropdown}>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id}
                    className={`${styles.suggestionItem} ${index === selectedSuggestionIndex ? styles.suggestionItemActive : ''}`}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    onMouseEnter={() => setSelectedSuggestionIndex(index)}
                  >
                    <span className={styles.suggestionIcon}>📍</span>
                    <span className={styles.suggestionText}>{suggestion.full_address}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <span className={styles.hint}>Start typing to see address suggestions</span>
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Apt, Suite, Unit (optional)</label>
          <input
            type="text"
            value={address.street2}
            onChange={(e) => handleChange('street2', e.target.value)}
            placeholder="Apt 4B"
            disabled={disabled}
          />
        </div>
      </div>

      <div className={styles.formRowThird}>
        <div className={styles.formGroup}>
          <label>City *</label>
          <input
            type="text"
            value={address.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="City"
            disabled={disabled}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>State *</label>
          <select
            value={address.state}
            onChange={(e) => handleChange('state', e.target.value)}
            disabled={disabled}
            required
          >
            <option value="">Select</option>
            {US_STATES.map((state) => (
              <option key={state.code} value={state.code}>
                {state.code}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>ZIP *</label>
          <input
            type="text"
            value={address.postal_code}
            onChange={(e) => handleChange('postal_code', e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="12345"
            maxLength={5}
            disabled={disabled}
            required
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Phone Number *</label>
          <input
            type="tel"
            value={address.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="(555) 123-4567"
            disabled={disabled}
            required
          />
          <span className={styles.hint}>Required for shipping carrier contact</span>
        </div>
      </div>

      <div className={styles.validationSection}>
        <button
          type="button"
          onClick={validateAddress}
          disabled={validating || disabled}
          className={styles.validateButton}
        >
          {validating ? 'Validating...' : 'Validate Address'}
        </button>

        {validationResult && !showSuggestion && (
          <div
            className={`${styles.validationResult} ${
              validationResult.is_valid ? styles.valid : styles.invalid
            }`}
          >
            {validationResult.is_valid ? (
              <span>✓ Address verified</span>
            ) : (
              <span>⚠ {validationResult.error}</span>
            )}
          </div>
        )}
      </div>

      {showSuggestion && validationResult?.suggested_address && (
        <div className={styles.suggestionBox}>
          <p className={styles.suggestionTitle}>We found a more accurate address:</p>
          <button
            type="button"
            onClick={() => applySuggestion(validationResult.suggested_address!)}
            className={styles.suggestionButton}
          >
            <span className={styles.suggestionAddress}>
              {validationResult.suggested_address.street}
              {validationResult.suggested_address.street2 && `, ${validationResult.suggested_address.street2}`}
              <br />
              {validationResult.suggested_address.city}, {validationResult.suggested_address.state} {validationResult.suggested_address.postal_code}
            </span>
            <span className={styles.useThis}>Use this address →</span>
          </button>
          <button
            type="button"
            onClick={keepOriginal}
            className={styles.keepOriginal}
          >
            Keep my original address
          </button>
        </div>
      )}
    </div>
  );
}