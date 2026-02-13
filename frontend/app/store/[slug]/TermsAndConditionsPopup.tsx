import React, { useRef, useEffect } from 'react';
import styles from './TermsAndConditionsPopup.module.css';
import './terms.css'; // Import global terms styles

interface TermsAndConditionsPopupProps {
  formattedTerms: JSX.Element[];
  onClose: () => void;
}

const TermsAndConditionsPopup: React.FC<TermsAndConditionsPopupProps> = ({ formattedTerms, onClose }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className={styles.popup}>
      <div className={styles.content} ref={contentRef}>
        <button className={styles.closeButton} onClick={onClose}>X</button>
        <div className={styles.termsWrapper}>
          <h2>Terms and Conditions</h2>
          <div className={styles.termsText}>
            {formattedTerms}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsPopup;