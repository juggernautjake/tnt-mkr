// app/contact/success/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import styles from '../contact.module.css';

export default function ContactSuccess() {
  const router = useRouter();

  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen p-10"
      style={{
        background: 'var(--page-background)',
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      <div className={`${styles.contactContainer} space-y-6`}>
        <h1 className={styles.title}>Message Sent</h1>
        <p className={styles.successMessage}>
          Your message has been sent successfully! We will try to respond within two business days.
        </p>
        <button
          onClick={() => router.push('/')}
          className={`${styles.formButton} mt-4`}
        >
          Back to Home
        </button>
      </div>
    </main>
  );
}