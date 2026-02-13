import React from "react";
import styles from "../legal.module.css";

export default function ReturnsPage() {
  return (
    <main className={styles.legalContainer}>
      <h1 className={styles.title}>Returns &amp; Refund Policy</h1>
      <p className={styles.effectiveDate}>
        Effective Date: January 1, 2025 &middot; Last Updated: January 1, 2025
      </p>

      {/* Overview */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Overview</h2>
        <div className={styles.content}>
          <p>
            At TNT MKR, we take pride in the quality of our custom 3D-printed
            phone cases. We want you to be completely satisfied with your
            purchase. This policy outlines the terms under which returns,
            replacements, and refunds are handled.
          </p>
        </div>
      </section>

      {/* 30-Day Warranty */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>30-Day Warranty</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            We provide a <strong>one-time, 30-day warranty</strong> on all
            products for manufacturing defects. If your phone case arrives with a
            defect in materials or workmanship, you are eligible for a
            replacement or refund within 30 days of the delivery date.
          </p>
          <p>
            This warranty covers defects such as structural cracks, delamination,
            misaligned prints, or significant deviations from the product listing.
            Normal wear and tear, accidental damage, or misuse are not covered
            under this warranty.
          </p>
        </div>
      </section>

      {/* How to Initiate a Return */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>How to Initiate a Return</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            To request a return, replacement, or refund, please follow these
            steps:
          </p>
          <ul className={styles.list}>
            <li>
              <strong>Step 1:</strong> Email us at{" "}
              <a href="mailto:support@tnt-mkr.com" className={styles.link}>
                support@tnt-mkr.com
              </a>{" "}
              within 30 days of receiving your order.
            </li>
            <li>
              <strong>Step 2:</strong> Include your order confirmation number
              (found in your order confirmation email or on your product
              packaging).
            </li>
            <li>
              <strong>Step 3:</strong> Provide a brief description of the defect
              along with clear photos showing the issue.
            </li>
            <li>
              <strong>Step 4:</strong> Our team will review your request and
              respond with instructions within 2 business days.
            </li>
          </ul>
          <p>
            Please do not ship any items back to us without first receiving
            return authorization. Unauthorized returns may not be processed.
          </p>
        </div>
      </section>

      {/* Shipping Costs for Returns */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Shipping Costs for Returns</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            <strong>Return shipping</strong> is the responsibility of the
            customer. We recommend using a trackable shipping method when sending
            your item back, as we cannot be responsible for packages lost in
            transit.
          </p>
          <p>
            For approved replacements, <strong>TNT MKR will cover the
            shipping cost</strong> of sending the new replacement item to you at
            no additional charge.
          </p>
        </div>
      </section>

      {/* Custom Products */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Custom Products</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            Because our phone cases are custom 3D-printed to order,{" "}
            <strong>custom products are non-returnable</strong> unless they
            arrive with a manufacturing defect as described in our 30-Day
            Warranty section above.
          </p>
          <p>
            We are unable to accept returns based on change of mind, incorrect
            phone model selection by the customer, or subjective differences in
            color or texture that fall within the normal range of 3D printing
            variation.
          </p>
        </div>
      </section>

      {/* Refund Processing */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Refund Processing</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            Once we receive and inspect your returned item, we will notify you of
            the status of your refund. If approved, your refund will be processed
            as follows:
          </p>
          <ul className={styles.list}>
            <li>
              Refunds are issued to the original payment method used at
              checkout.
            </li>
            <li>
              Please allow <strong>5 to 10 business days</strong> for the refund
              to appear on your statement after approval.
            </li>
            <li>
              Shipping costs from your original order are non-refundable unless
              the return is due to our error.
            </li>
          </ul>
          <p>
            If you have not received your refund within the expected timeframe,
            please first check with your bank or credit card company, as
            processing times may vary. If you still need assistance, contact us
            at{" "}
            <a href="mailto:support@tnt-mkr.com" className={styles.link}>
              support@tnt-mkr.com
            </a>
            .
          </p>
        </div>
      </section>

      {/* Damaged or Incorrect Items */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Damaged or Incorrect Items</h2>
        <div className={styles.content}>
          <p>
            If you receive a damaged or incorrect item, please contact us
            immediately at{" "}
            <a href="mailto:support@tnt-mkr.com" className={styles.link}>
              support@tnt-mkr.com
            </a>{" "}
            with your order number and photos of the issue. We will work with you
            to resolve the matter as quickly as possible, whether through a
            replacement or refund at no additional cost to you.
          </p>
        </div>
      </section>

      {/* Contact Us */}
      <section>
        <h2 className={styles.sectionTitle}>Contact Us</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            If you have any questions about our returns and refund policy, please
            contact us:
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
