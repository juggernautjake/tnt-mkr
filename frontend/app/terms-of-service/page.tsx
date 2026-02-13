import React from "react";
import Link from "next/link";
import styles from "../legal.module.css";

export default function TermsOfServicePage() {
  return (
    <main className={styles.legalContainer}>
      <h1 className={styles.title}>Terms of Service</h1>
      <p className={styles.effectiveDate}>
        Effective Date: January 1, 2025 &middot; Last Updated: January 1, 2025
      </p>

      {/* Acceptance of Terms */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Acceptance of Terms</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            Welcome to TNT MKR. By accessing or using our website at{" "}
            <a
              href="https://www.tnt-mkr.com"
              className={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              www.tnt-mkr.com
            </a>{" "}
            (&quot;the Site&quot;), placing an order, or otherwise engaging with
            our services, you agree to be bound by these Terms of Service
            (&quot;Terms&quot;). If you do not agree to these Terms, please do
            not use our website or purchase our products.
          </p>
          <p>
            We reserve the right to update or modify these Terms at any time
            without prior notice. Your continued use of the Site following any
            changes constitutes acceptance of the revised Terms.
          </p>
        </div>
      </section>

      {/* Products and Ordering */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Products and Ordering</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            TNT MKR specializes in custom 3D-printed phone cases. All products
            are made to order using high-quality PLA and TPU materials. Product
            images on our website are representative of the final product;
            however, slight variations in color or finish may occur due to the
            nature of 3D printing.
          </p>
          <p className={styles.paragraph}>
            By placing an order, you confirm that:
          </p>
          <ul className={styles.list}>
            <li>You are at least 18 years old or have parental consent.</li>
            <li>
              The information you provide during checkout is accurate and
              complete.
            </li>
            <li>
              You authorize us to charge your selected payment method for the
              total order amount.
            </li>
          </ul>
          <p>
            We reserve the right to refuse or cancel any order at our
            discretion, including orders that appear to be placed in error or
            that involve suspected fraudulent activity.
          </p>
        </div>
      </section>

      {/* Pricing and Payments */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Pricing and Payments</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            All prices listed on our website are in United States Dollars (USD)
            and are subject to change without notice. Applicable taxes and
            shipping costs will be calculated and displayed at checkout.
          </p>
          <p className={styles.paragraph}>
            Payments are processed securely through Stripe. We accept major
            credit cards, including Visa, Mastercard, American Express, and
            Discover, as well as PayPal. TNT MKR does not store your full
            payment card details on our servers.
          </p>
          <p>
            In the event of a pricing error, we reserve the right to cancel the
            affected order and issue a full refund.
          </p>
        </div>
      </section>

      {/* Shipping */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Shipping</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            We currently ship exclusively within the continental United States.
            International shipping is not available at this time.
          </p>
          <p className={styles.paragraph}>
            Orders are crafted within up to 5 business days. Shipping rates and
            estimated delivery times vary by location and will be calculated at
            checkout. Tracking information will be provided via email once your
            order has shipped.
          </p>
          <p>
            For full details on our shipping practices, please review our{" "}
            <Link href="/shipping-policy" className={styles.link}>
              Shipping Policy
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Returns and Warranty */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Returns and Warranty</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            We provide a <strong>one-time, 30-day warranty</strong> for
            defective items. If your product arrives with a manufacturing
            defect, please contact us within 30 days of delivery to initiate a
            replacement or refund.
          </p>
          <p className={styles.paragraph}>
            <strong>Return shipping costs</strong> are the responsibility of the
            customer. For approved replacements, TNT MKR will cover the shipping
            cost of the new item.
          </p>
          <p className={styles.paragraph}>
            <strong>Custom products are non-returnable</strong> unless they
            arrive with a manufacturing defect. We are unable to accept returns
            for products that have been customized to your specifications and are
            free from defects.
          </p>
          <p>
            For complete details, please review our{" "}
            <Link href="/returns" className={styles.link}>
              Returns &amp; Refund Policy
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Intellectual Property */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Intellectual Property</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            All content on this website, including but not limited to text,
            graphics, logos, product designs, images, and software, is the
            property of TNT MKR or its licensors and is protected by United
            States and international copyright, trademark, and intellectual
            property laws.
          </p>
          <p>
            You may not reproduce, distribute, modify, create derivative works
            of, publicly display, or otherwise use any content from our website
            without our prior written consent.
          </p>
        </div>
      </section>

      {/* User Conduct */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>User Conduct</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            When using our website, you agree not to:
          </p>
          <ul className={styles.list}>
            <li>
              Use the Site for any unlawful purpose or in violation of any
              applicable laws.
            </li>
            <li>
              Attempt to gain unauthorized access to any portion of the website
              or its systems.
            </li>
            <li>
              Interfere with or disrupt the operation of the website or servers.
            </li>
            <li>
              Upload or transmit any malicious code, viruses, or harmful
              content.
            </li>
            <li>
              Impersonate another person or misrepresent your affiliation with
              any entity.
            </li>
          </ul>
        </div>
      </section>

      {/* Limitation of Liability */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Limitation of Liability</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            To the fullest extent permitted by law, TNT MKR and its owners,
            employees, and affiliates shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages arising out
            of or related to your use of our website or the purchase of our
            products.
          </p>
          <p>
            Our total liability for any claim arising under these Terms shall not
            exceed the amount you paid for the specific product giving rise to
            the claim. This limitation applies regardless of the legal theory on
            which the claim is based.
          </p>
        </div>
      </section>

      {/* Disclaimer of Warranties */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Disclaimer of Warranties</h2>
        <div className={styles.content}>
          <p>
            Our website and products are provided &quot;as is&quot; and &quot;as
            available&quot; without warranties of any kind, either express or
            implied. We disclaim all warranties, including but not limited to
            implied warranties of merchantability, fitness for a particular
            purpose, and non-infringement. We do not warrant that the website
            will be uninterrupted, error-free, or free of viruses or other
            harmful components.
          </p>
        </div>
      </section>

      {/* Governing Law */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Governing Law</h2>
        <div className={styles.content}>
          <p>
            These Terms of Service shall be governed by and construed in
            accordance with the laws of the State of Texas, without regard to
            its conflict of law provisions. Any disputes arising under or in
            connection with these Terms shall be subject to the exclusive
            jurisdiction of the state and federal courts located in Texas.
          </p>
        </div>
      </section>

      {/* Severability */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Severability</h2>
        <div className={styles.content}>
          <p>
            If any provision of these Terms is found to be invalid or
            unenforceable by a court of competent jurisdiction, the remaining
            provisions shall remain in full force and effect.
          </p>
        </div>
      </section>

      {/* Contact Us */}
      <section>
        <h2 className={styles.sectionTitle}>Contact Us</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            If you have any questions about these Terms of Service, please
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
