'use client';

import React, { useState } from 'react';
import styles from '../orders/orders.module.css';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  guest_email?: string;
  user?: { id: number; email: string };
}

interface CustomMessageModalProps {
  order: Order;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
}

export default function CustomMessageModal({ order, onClose, onSuccess, onError }: CustomMessageModalProps) {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tnt-mkr.com';

  const getCustomerEmail = () => {
    return order.customer_email || order.guest_email || order.user?.email || 'N/A';
  };

  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminJwt') || localStorage.getItem('jwt');
  };

  const handleSend = async () => {
    if (!message.trim()) {
      onError('Please enter a message');
      return;
    }

    setSending(true);
    try {
      const token = getToken();
      if (!token) {
        onError('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch(`${API_URL}/api/shipping/admin/orders/${order.id}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: message.trim(),
          subject: subject.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to send message');
      }

      const data = await response.json();
      onSuccess(`Message sent successfully to ${data.sentTo}`);
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      onError(errorMessage);
    } finally {
      setSending(false);
    }
  };

  // Convert newlines to <br> tags for HTML display in preview
  const formatMessageForPreview = (text: string) => {
    return text.split('\n').map((line, index, array) => (
      <React.Fragment key={index}>
        {line}
        {index < array.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const defaultSubject = `Message About Your Order #${order.order_number} | TNT MKR`;

  return (
    <div className={styles.modalOverlay} onClick={() => !sending && onClose()}>
      <div className={styles.messageModalWide} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>💬 Send Message to Customer</h2>
          {!sending && (
            <button onClick={onClose} className={styles.closeBtn}>×</button>
          )}
        </div>
        <div className={styles.modalBody}>
          <div className={styles.messageOrderInfo}>
            <p><strong>Order:</strong> {order.order_number}</p>
            <p><strong>Customer:</strong> {order.customer_name}</p>
            <p><strong>Email:</strong> {getCustomerEmail()}</p>
          </div>

          {!showPreview ? (
            <>
              <div className={styles.formGroup}>
                <label>Subject (Optional)</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={defaultSubject}
                  className={styles.formInput}
                  disabled={sending}
                />
                <p className={styles.helpTextSmall}>
                  Leave blank to use default subject
                </p>
              </div>

              <div className={styles.formGroup}>
                <label>Message *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Type your message to the customer here...

Example:

Hi! We wanted to let you know that we noticed a small issue with one of the items in your order. We've already fixed it and your order is back on track!

Please let us know if you have any questions.

Best regards,
The TNT MKR Team`}
                  className={styles.customMessageTextarea}
                  disabled={sending}
                />
                <div className={styles.textareaInfo}>
                  <span className={styles.charCount}>{message.length} characters</span>
                  <span className={styles.lineBreakHint}>💡 Line breaks will be preserved in the email</span>
                </div>
              </div>

              <div className={styles.messageActions}>
                <button
                  onClick={() => setShowPreview(true)}
                  className={styles.previewBtn}
                  disabled={!message.trim() || sending}
                >
                  👁️ Preview Email
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.emailPreviewFull}>
                <h4>📧 Email Preview</h4>
                <div className={styles.previewMetaInfo}>
                  <div className={styles.previewSubject}>
                    <strong>Subject:</strong> {subject.trim() || defaultSubject}
                  </div>
                  <div className={styles.previewTo}>
                    <strong>To:</strong> {getCustomerEmail()}
                  </div>
                </div>
                <div className={styles.previewBody}>
                  <div className={styles.previewHeader}>
                    <span className={styles.previewBadge}>Order #{order.order_number}</span>
                    <h3>Message About Your Order 💬</h3>
                    <p>Hello {order.customer_name},</p>
                  </div>
                  <div className={styles.previewMessageContent}>
                    {formatMessageForPreview(message)}
                  </div>
                  <div className={styles.previewFooter}>
                    <p><strong>Order Number:</strong> {order.order_number}</p>
                    <p><strong>Customer:</strong> {order.customer_name}</p>
                  </div>
                </div>
              </div>

              <div className={styles.messageActions}>
                <button
                  onClick={() => setShowPreview(false)}
                  className={styles.backBtn}
                  disabled={sending}
                >
                  ← Edit Message
                </button>
              </div>
            </>
          )}

          <div className={styles.emailNote}>
            <p>📧 This message will be sent to <strong>{getCustomerEmail()}</strong></p>
            <p>📋 A copy will be BCC&apos;d to customer service for records</p>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button 
            onClick={onClose} 
            className={styles.cancelBtn}
            disabled={sending}
          >
            Cancel
          </button>
          <button 
            onClick={handleSend} 
            className={styles.submitBtn}
            disabled={sending || !message.trim()}
          >
            {sending ? 'Sending...' : '📤 Send Message'}
          </button>
        </div>
      </div>
    </div>
  );
}