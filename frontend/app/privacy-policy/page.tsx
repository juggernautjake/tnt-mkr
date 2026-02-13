import React from "react";
import styles from "../legal.module.css";

export default function PrivacyPolicyPage() {
  return (
    <main className={styles.legalContainer}>
      <h1 className={styles.title}>Privacy Policy</h1>
      <p className={styles.effectiveDate}>
        Effective Date: January 1, 2025 &middot; Last Updated: January 1, 2025
      </p>

      {/* Introduction */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Introduction</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            TNT MKR (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates
            the website{" "}
            <a
              href="https://www.tnt-mkr.com"
              className={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              www.tnt-mkr.com
            </a>{" "}
            and is committed to protecting your privacy. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your personal
            information when you visit our website and purchase our custom
            3D-printed phone cases.
          </p>
          <p>
            By accessing or using our website, you agree to the terms of this
            Privacy Policy. If you do not agree with the practices described
            herein, please do not use our website.
          </p>
        </div>
      </section>

      {/* Information We Collect */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Information We Collect</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            We collect information that you provide directly to us, as well as
            information gathered automatically when you interact with our
            website.
          </p>
          <p className={styles.paragraphSmall}>
            <strong>Personal Information You Provide</strong>
          </p>
          <ul className={styles.list}>
            <li>Full name</li>
            <li>Email address</li>
            <li>Shipping address</li>
            <li>Phone number (if provided)</li>
            <li>
              Payment information (processed securely through Stripe; we do not
              store your full credit card details)
            </li>
            <li>Order history and transaction records</li>
            <li>Customer support correspondence</li>
          </ul>
          <p className={styles.paragraphSmall}>
            <strong>Information Collected Automatically</strong>
          </p>
          <ul className={styles.list}>
            <li>Browser type and version</li>
            <li>Device type and operating system</li>
            <li>IP address</li>
            <li>Pages visited and time spent on our website</li>
            <li>Referring website or source</li>
          </ul>
        </div>
      </section>

      {/* How We Use Your Information */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>How We Use Your Information</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            We use the information we collect for the following purposes:
          </p>
          <ul className={styles.list}>
            <li>
              <strong>Order Fulfillment:</strong> To process, manufacture, and
              ship your custom 3D-printed phone cases.
            </li>
            <li>
              <strong>Customer Support:</strong> To respond to inquiries,
              troubleshoot issues, and process returns or replacements.
            </li>
            <li>
              <strong>Communication:</strong> To send order confirmations,
              shipping notifications, and updates about your purchases.
            </li>
            <li>
              <strong>Website Improvement:</strong> To analyze usage patterns and
              improve our products and website experience.
            </li>
            <li>
              <strong>Legal Compliance:</strong> To comply with applicable laws,
              regulations, and legal obligations.
            </li>
          </ul>
          <p>
            We will never sell your personal information to third parties for
            marketing purposes.
          </p>
        </div>
      </section>

      {/* Third-Party Services */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Third-Party Services</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            We partner with trusted third-party service providers to operate our
            business. These providers only have access to the information
            necessary to perform their specific functions:
          </p>
          <ul className={styles.list}>
            <li>
              <strong>Stripe:</strong> Processes all payment transactions
              securely. Stripe&apos;s privacy practices are governed by their
              own privacy policy.
            </li>
            <li>
              <strong>EasyPost:</strong> Manages shipping label generation and
              package tracking for order deliveries.
            </li>
            <li>
              <strong>Cloudinary:</strong> Hosts and delivers product images
              displayed on our website.
            </li>
          </ul>
          <p>
            We encourage you to review the privacy policies of these third-party
            services for further details on how they handle your data.
          </p>
        </div>
      </section>

      {/* Cookies and Local Storage */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Cookies and Local Storage</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            Our website uses cookies and browser localStorage to enhance your
            browsing experience. These technologies help us:
          </p>
          <ul className={styles.list}>
            <li>Remember your preferences, such as theme settings</li>
            <li>Maintain your shopping cart between visits</li>
            <li>Keep you signed in to your account</li>
            <li>Analyze site traffic and usage patterns</li>
          </ul>
          <p>
            You can manage or disable cookies through your browser settings.
            Please note that disabling cookies may affect the functionality of
            certain features on our website.
          </p>
        </div>
      </section>

      {/* Data Retention */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Data Retention</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            We retain your personal information only for as long as necessary to
            fulfill the purposes outlined in this Privacy Policy, including
            order records, customer support history, and legal compliance. Order
            and transaction records may be retained for up to five years to
            comply with tax and accounting obligations.
          </p>
          <p>
            If you request deletion of your account, we will remove your
            personal data within a reasonable timeframe, except where retention
            is required by law.
          </p>
        </div>
      </section>

      {/* Your Rights */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Your Rights</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            You have the following rights regarding your personal information:
          </p>
          <ul className={styles.list}>
            <li>
              <strong>Access:</strong> You may request a copy of the personal
              data we hold about you.
            </li>
            <li>
              <strong>Correction:</strong> You may request that we correct any
              inaccurate or incomplete information.
            </li>
            <li>
              <strong>Deletion:</strong> You may request that we delete your
              personal data, subject to legal retention requirements.
            </li>
          </ul>
          <p>
            To exercise any of these rights, please contact us at{" "}
            <a href="mailto:support@tnt-mkr.com" className={styles.link}>
              support@tnt-mkr.com
            </a>
            . We will respond to your request within 30 days.
          </p>
        </div>
      </section>

      {/* Data Security */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Data Security</h2>
        <div className={styles.content}>
          <p>
            We implement industry-standard security measures to protect your
            personal information from unauthorized access, alteration,
            disclosure, or destruction. All payment transactions are encrypted
            and processed through Stripe&apos;s secure infrastructure. However,
            no method of transmission over the Internet is completely secure, and
            we cannot guarantee absolute security.
          </p>
        </div>
      </section>

      {/* Children's Privacy */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Children&apos;s Privacy</h2>
        <div className={styles.content}>
          <p>
            Our website and services are not directed to children under the age
            of 13. We do not knowingly collect personal information from children
            under 13. If we become aware that we have inadvertently collected
            information from a child under 13, we will take steps to delete that
            information promptly. If you believe a child has provided us with
            personal information, please contact us at{" "}
            <a href="mailto:support@tnt-mkr.com" className={styles.link}>
              support@tnt-mkr.com
            </a>
            .
          </p>
        </div>
      </section>

      {/* Changes to This Policy */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Changes to This Policy</h2>
        <div className={styles.content}>
          <p>
            We may update this Privacy Policy from time to time to reflect
            changes in our practices or applicable laws. Any updates will be
            posted on this page with a revised &quot;Last Updated&quot; date. We
            encourage you to review this policy periodically.
          </p>
        </div>
      </section>

      {/* Contact Us */}
      <section>
        <h2 className={styles.sectionTitle}>Contact Us</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            If you have any questions or concerns about this Privacy Policy or
            our data practices, please contact us:
          </p>
          <p className={styles.paragraphSmall}>
            <strong>TNT MKR</strong>
          </p>
          <p className={styles.paragraphSmall}>Belton, Texas</p>
          <p className={styles.paragraphSmall}>
            Email:{" "}
            <a href="mailto:support@tnt-mkr.com" className={styles.link}>
              support@tnt-mkr.com
            </a>
          </p>
          <p>
            Website:{" "}
            <a
              href="https://www.tnt-mkr.com"
              className={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              www.tnt-mkr.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
