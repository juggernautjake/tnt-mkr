"use client";

import React from "react";
import Link from "next/link";
import styles from "./faq.module.css";

export default function FAQPage(): JSX.Element {
  return (
    <main className={styles.faqContainer}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Where do you ship?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "We currently ship exclusively within the continental United States. Shipping rates and delivery times vary by location and will be calculated at checkout.",
                },
              },
              {
                "@type": "Question",
                name: "How long does it take to process and ship orders?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Orders are crafted within 5 business days. Once prepared, shipping duration depends on the chosen method. Preorder items will be dispatched within 10 days following the close of the preorder period.",
                },
              },
              {
                "@type": "Question",
                name: "What phone models do you currently support?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "At present, our cases are designed solely for the Light Phone III. We are excited to announce plans for expanding our offerings to accommodate a wider variety of phone models in the near future.",
                },
              },
              {
                "@type": "Question",
                name: "Can customers provide their own designs?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Currently, we do not support customer-uploaded designs. However, we are diligently developing enhanced customization options, including the ability to submit your own artwork.",
                },
              },
              {
                "@type": "Question",
                name: "What materials are your phone cases made of?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Our cases are meticulously constructed from high-quality PLA and TPU materials, delivering exceptional durability and a refined finish.",
                },
              },
              {
                "@type": "Question",
                name: "How durable are the phone cases?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Our cases are expertly designed to offer superior protection for your device, blending durability with an elegant, streamlined aesthetic. We emphasize both performance and style in every product.",
                },
              },
              {
                "@type": "Question",
                name: "How does your Christian faith influence your business?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Rooted in Christian values, we operate as a faith-driven company with a focus on integrity, compassion, and service to others. A portion of our profits proudly supports ministries and charitable initiatives.",
                },
              },
              {
                "@type": "Question",
                name: "What payment methods do you accept?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "We offer multiple payment options, including Visa, Mastercard, American Express, Discover, and PayPal. We are also exploring the addition of Venmo through our collaboration with Stripe.",
                },
              },
            ],
          }),
        }}
      />
      <h1 className={styles.title}>FAQ</h1>

      {/* General FAQ Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>General Questions</h2>
        <div className={styles.content}>
          <p className={styles.paragraphSmall}>
            <strong>Q:</strong> Where do you ship?
          </p>
          <p className={styles.paragraph}>
            <strong>A:</strong> We currently ship exclusively within the continental United States. Shipping rates and delivery times vary by location and will be calculated at checkout.
          </p>

          <p className={styles.paragraphSmall}>
            <strong>Q:</strong> How long does it take to process and ship orders?
          </p>
          <p>
            <strong>A:</strong> Orders are crafted within 5 business days. Once prepared, shipping duration depends on the chosen method. Preorder items will be dispatched within 10 days following the close of the preorder period.
          </p>
        </div>
      </section>

      {/* Return Policy Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Return Policy</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            We provide a <strong>one-time, 30-day warranty</strong> for defective items. To initiate a replacement or refund, please reach out via email within 30 days of delivery. We’ll reply with detailed instructions.
          </p>
          <p className={styles.paragraph}>
            <strong>Shipping Costs:</strong> Return shipping expenses are the customer’s responsibility. For replacements, we cover the shipping cost of the new item.
          </p>
          <p>
            To begin a return or replacement process, please contact our support team with your order confirmation number (found in your order confirmation email or on your product package).
          </p>
        </div>
      </section>

      {/* Additional Questions Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Additional Questions</h2>
        <div className={styles.content}>
          <p className={styles.paragraphSmall}>
            <strong>Q:</strong> What phone models do you currently support?
          </p>
          <p className={styles.paragraph}>
            <strong>A:</strong> At present, our cases are designed solely for the Light Phone III. We are excited to announce plans for expanding our offerings to accommodate a wider variety of phone models in the near future.
          </p>

          <p className={styles.paragraphSmall}>
            <strong>Q:</strong> Can customers provide their own designs?
          </p>
          <p className={styles.paragraph}>
            <strong>A:</strong> Currently, we do not support customer-uploaded designs. However, we are diligently developing enhanced customization options, including the ability to submit your own artwork.
          </p>

          <p className={styles.paragraphSmall}>
            <strong>Q:</strong> What materials are your phone cases made of?
          </p>
          <p className={styles.paragraph}>
            <strong>A:</strong> Our cases are meticulously constructed from high-quality PLA and TPU materials, delivering exceptional durability and a refined finish.
          </p>

          <p className={styles.paragraphSmall}>
            <strong>Q:</strong> How durable are the phone cases?
          </p>
          <p className={styles.paragraph}>
            <strong>A:</strong> Our cases are expertly designed to offer superior protection for your device, blending durability with an elegant, streamlined aesthetic. We emphasize both performance and style in every product.
          </p>

          <p className={styles.paragraphSmall}>
            <strong>Q:</strong> How does your Christian faith influence your business?
          </p>
          <p className={styles.paragraph}>
            <strong>A:</strong> Rooted in Christian values, we operate as a faith-driven company with a focus on integrity, compassion, and service to others. A portion of our profits proudly supports ministries and charitable initiatives.
          </p>

          <p className={styles.paragraphSmall}>
            <strong>Q:</strong> What payment methods do you accept?
          </p>
          <p>
            <strong>A:</strong> We offer multiple payment options, including Visa, Mastercard, American Express, Discover, and PayPal. We are also exploring the addition of Venmo through our collaboration with Stripe.
          </p>
        </div>
      </section>

      {/* More Help Section */}
      <section>
        <h2 className={styles.sectionTitle}>More Help</h2>
        <div className={styles.content}>
          <p className={styles.paragraphSmall}>Need further assistance?</p>
          <p>
            <Link href="/contact" className={styles.link}>
              Contact us
            </Link>{" "}
            and we’ll respond as promptly as possible.
          </p>
        </div>
      </section>
    </main>
  );
}