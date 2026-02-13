import React from "react";
import styles from "../legal.module.css";

export default function ShippingPolicyPage() {
  return (
    <main className={styles.legalContainer}>
      <h1 className={styles.title}>Shipping Policy</h1>
      <p className={styles.effectiveDate}>
        Effective Date: January 1, 2025 &middot; Last Updated: January 1, 2025
      </p>

      {/* Overview */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Overview</h2>
        <div className={styles.content}>
          <p>
            At TNT MKR, every phone case is custom 3D-printed to order. Because
            each product is crafted specifically for you, please allow additional
            time for manufacturing before your order ships. Below you will find
            all the details about our shipping process, delivery times, and
            service area.
          </p>
        </div>
      </section>

      {/* Service Area */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Service Area</h2>
        <div className={styles.content}>
          <p>
            We currently ship exclusively within the{" "}
            <strong>continental United States</strong> (48 contiguous states).
            Unfortunately, we are unable to ship to Alaska, Hawaii, U.S.
            territories, or international addresses at this time. We are
            actively exploring options to expand our shipping coverage in the
            future.
          </p>
        </div>
      </section>

      {/* Manufacturing Time */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Manufacturing Time</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            Since each phone case is custom 3D-printed after your order is
            placed, please allow <strong>up to 5 business days</strong> for
            manufacturing before your order ships. Business days are Monday
            through Friday, excluding federal holidays.
          </p>
          <p>
            During peak seasons or promotional events, manufacturing times may
            be slightly longer. We will notify you by email if your order
            requires additional processing time.
          </p>
        </div>
      </section>

      {/* Shipping Carriers and Delivery Times */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Shipping Carriers and Delivery Times
        </h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            Once your order has been manufactured, it will be handed off to one
            of our shipping partners. Available shipping methods and estimated
            delivery times are calculated at checkout based on your location.
          </p>
          <p className={styles.paragraph}>
            Shipping rates are determined by the weight and dimensions of your
            order as well as the destination address. All available options and
            their associated costs will be displayed during checkout before you
            complete your purchase.
          </p>
          <p>
            Please note that estimated delivery times are provided by the
            shipping carrier and begin after your order has shipped, not from the
            date the order was placed. Actual delivery times may vary due to
            carrier delays, weather conditions, or other factors beyond our
            control.
          </p>
        </div>
      </section>

      {/* Preorder Items */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Preorder Items</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            For preorder items, manufacturing begins after the preorder period
            has closed. Preorder products will be dispatched within{" "}
            <strong>10 business days</strong> after the preorder window ends.
          </p>
          <p>
            You will receive an email confirmation when your preorder item has
            shipped, along with tracking information so you can follow your
            package.
          </p>
        </div>
      </section>

      {/* Order Tracking */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Order Tracking</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            Once your order has shipped, you will receive a shipping confirmation
            email that includes your tracking number and a link to track your
            package. If you do not receive a tracking email within 7 business
            days of placing your order, please check your spam or junk folder
            first, then contact us if the issue persists.
          </p>
          <p>
            Please allow 24 to 48 hours after receiving your tracking number for
            the carrier&apos;s tracking system to update with scan information.
          </p>
        </div>
      </section>

      {/* Issues with Delivery */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Issues with Delivery</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            If your package shows as delivered but you have not received it,
            please take the following steps:
          </p>
          <ul className={styles.list}>
            <li>
              Verify the shipping address on your order confirmation email.
            </li>
            <li>Check with household members or neighbors.</li>
            <li>Look in any secure locations where packages may be left.</li>
            <li>
              Contact the shipping carrier directly using your tracking number.
            </li>
          </ul>
          <p>
            If you are still unable to locate your package, please reach out to
            us at{" "}
            <a href="mailto:support@tnt-mkr.com" className={styles.link}>
              support@tnt-mkr.com
            </a>{" "}
            and we will do our best to assist you.
          </p>
        </div>
      </section>

      {/* Contact Us */}
      <section>
        <h2 className={styles.sectionTitle}>Contact Us</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            If you have any questions about our shipping policy or need
            assistance with an order, please contact us:
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
