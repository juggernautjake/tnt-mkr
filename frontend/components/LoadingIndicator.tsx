import { useState, useEffect } from "react";
import styles from "./LoadingIndicator.module.css";

const LoadingIndicator: React.FC = () => {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev + 1) % 4);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingButton}>
        <span>Loading{".".repeat(dots)}</span>
      </div>
    </div>
  );
};

export default LoadingIndicator;