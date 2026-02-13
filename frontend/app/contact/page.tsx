'use client';

import { useState, useEffect } from "react";
import axios from 'axios';
import { API } from '../../src/constant';
import { useRouter } from 'next/navigation';
import styles from './contact.module.css';

export default function Contact(): JSX.Element {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orderNumber: "ORD-", // Permanent "ORD-" prefix stored in formData
    message: "",
  });
  const [orderNumberDigits, setOrderNumberDigits] = useState(""); // Digits part of order number
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState<{ name: string | null, email: string | null, message: string | null, orderNumber: string | null }>({
    name: null,
    email: null,
    message: null,
    orderNumber: null,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isOrderNumberExists, setIsOrderNumberExists] = useState<boolean | null>(null); // null if not checked, true if exists, false if not
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    orderNumber: false,
    message: false,
  });
  const router = useRouter();

  // Validate form on every change
  useEffect(() => {
    validateForm();
  }, [formData, orderNumberDigits, isOrderNumberExists]);

  const validateForm = () => {
    const newErrors: { name: string | null, email: string | null, message: string | null, orderNumber: string | null } = {
      name: null,
      email: null,
      message: null,
      orderNumber: null,
    };

    if (!formData.name.trim()) {
      newErrors.name = "Please enter your name.";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Please enter your message.";
    }
    if (orderNumberDigits) {
      const digitCount = orderNumberDigits.replace('-', '').length;
      if (digitCount < 16) {
        newErrors.orderNumber = "Please enter a complete 16-digit order number.";
      } else if (isOrderNumberExists === false) {
        newErrors.orderNumber = "The order number entered does not exist.";
      }
    }

    setErrors(newErrors);
    const isValid = Object.values(newErrors).every((error) => error === null);
    setIsFormValid(isValid);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrorMessage('');
    setIsSubmitted(false); // Reset submission state on change
  };

  const handleOrderNumberChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 16) value = value.slice(0, 16); // Limit to 16 digits

    let formattedValue = '';
    if (value.length > 13) {
      formattedValue = value.slice(0, 13) + '-' + value.slice(13); // Insert hyphen after 13 digits
    } else {
      formattedValue = value;
    }

    setOrderNumberDigits(formattedValue);
    setFormData((prev) => ({ ...prev, orderNumber: `ORD-${formattedValue}` }));

    if (value.length === 16) {
      const fullOrderNumber = `ORD-${value.slice(0, 13)}-${value.slice(13)}`;
      try {
        const response = await axios.get(`${API}/api/orders?filters[order_number][$eq]=${fullOrderNumber}`);
        const orders = response.data.data;
        setIsOrderNumberExists(orders.length > 0);
      } catch (error) {
        console.error('Error validating order number:', error);
        setIsOrderNumberExists(false);
      }
    } else {
      setIsOrderNumberExists(null);
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTouched({
      name: true,
      email: true,
      orderNumber: true,
      message: true,
    });

    if (!isFormValid) {
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await axios.post(`${API}/api/contacts`, {
        data: {
          name: formData.name,
          email: formData.email,
          orderNumber: orderNumberDigits ? `ORD-${orderNumberDigits}` : null,
          message: formData.message,
        },
      });

      router.push('/contact/success');
    } catch (error: unknown) {
      console.error('Contact form submission error:', error);
      setStatus('error');
      let errorMsg = 'Failed to send message. Please try again later.';
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data;
        errorMsg = errorData?.error?.message || errorMsg;
      }
      setErrorMessage(errorMsg);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-10" style={{
      background: 'var(--page-background)',
      fontFamily: "'Roboto', sans-serif"
    }}>
      <div className={styles.contactContainer}>
        <h1 className={styles.title}>Contact Us</h1>
        <p className={styles.description}>
          Use this form to ask about products or orders. For disputes about an order, please include your order confirmation number (found in your order confirmation email from TNT MKR). We aim to respond within 2 business days. Please ensure your email address is correct.
        </p>
        <form onSubmit={handleSubmit} className={styles.contactForm}>
          <label htmlFor="name" className={styles.formLabel}>Your Name</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Your Name"
            className={styles.formInput}
            value={formData.name}
            onChange={handleChange}
            onBlur={() => handleBlur('name')}
            required
          />
          {(touched.name || isSubmitted) && errors.name && <p className={styles.errorText}>{errors.name}</p>}

          <label htmlFor="email" className={styles.formLabel}>Your Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Your Email"
            className={`${styles.formInput} ${(touched.email || isSubmitted) && errors.email ? styles.inputError : ''}`}
            value={formData.email}
            onChange={handleChange}
            onBlur={() => handleBlur('email')}
            required
          />
          {(touched.email || isSubmitted) && errors.email && <p className={styles.errorText}>{errors.email}</p>}

          <label htmlFor="orderNumberDigits" className={styles.formLabel}>Order Number (optional)</label>
          {(touched.orderNumber || isSubmitted) && errors.orderNumber && <p className={styles.errorText}>{errors.orderNumber}</p>}
          <div className={styles.orderNumberWrapper}>
            <span className={styles.orderPrefix}>ORD-</span>
            <input
              id="orderNumberDigits"
              type="text"
              name="orderNumberDigits"
              placeholder="#############-###"
              className={styles.orderNumberInput}
              value={orderNumberDigits}
              onChange={handleOrderNumberChange}
              onBlur={() => handleBlur('orderNumber')}
              maxLength={17} // 13 digits + hyphen + 3 digits
            />
          </div>

          <label htmlFor="message" className={styles.formLabel}>Your Message</label>
          <textarea
            id="message"
            name="message"
            placeholder="Your Message"
            className={styles.formTextarea}
            value={formData.message}
            onChange={handleChange}
            onBlur={() => handleBlur('message')}
            required
          />
          {(touched.message || isSubmitted) && errors.message && <p className={styles.errorText}>{errors.message}</p>}

          {status === 'error' && <p className={styles.errorMessage}>{errorMessage}</p>}

          <button
            type="submit"
            className={`${styles.formButton} ${!isFormValid || status === 'loading' ? styles.formButtonDisabled : ''}`}
            disabled={!isFormValid || status === 'loading'}
          >
            {status === 'loading' ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </main>
  );
}