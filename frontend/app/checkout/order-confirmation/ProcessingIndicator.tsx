"use client";

import React from "react";
import styles from "./ProcessingIndicator.module.css";

export default function ProcessingIndicator() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.spinner}></div>
        <h2 className={styles.title}>Processing Your Order</h2>
        <p className={styles.message}>
          Please wait while we confirm your payment and prepare your order confirmation...
        </p>
        <p className={styles.submessage}>
          This may take a few moments. Please do not close or refresh this page.
        </p>
      </div>
    </div>
  );
}