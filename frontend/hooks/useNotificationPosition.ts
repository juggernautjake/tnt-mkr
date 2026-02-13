import { useState, useEffect } from 'react';
import { useNavbarHeight } from './useNavbarHeight';

export function useNotificationPosition() {
  const [position, setPosition] = useState({ top: '0px', bottom: 'auto' });
  const navbarHeight = useNavbarHeight();

  useEffect(() => {
    const handleScroll = () => {
      const isSmallScreen = window.innerWidth < 768;
      if (isSmallScreen) {
        const scrolledPastNavbar = window.scrollY > navbarHeight;
        setPosition({
          top: scrolledPastNavbar ? '50px' : `${navbarHeight + 10}px`, // 50px accounts for fixed hamburger
          bottom: 'auto'
        });
      } else {
        setPosition({ top: `${navbarHeight + 10}px`, bottom: 'auto' });
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [navbarHeight]);

  return position;
}