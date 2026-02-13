"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./Navbar.module.css";
import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "next-themes";
import { useAuthContext } from "../context/AuthContext";
import { ShoppingCartIcon } from "@heroicons/react/24/solid";
import VerseButton from "./VerseButton";

export default function Navbar(): JSX.Element {
  const rawPathname = usePathname();
  const pathname: string = rawPathname || "/";
  const [cartCount, setCartCount] = useState<number>(0);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { isAuthenticated, token, guestSessionId } = useAuthContext();
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [menuCartHeight, setMenuCartHeight] = useState(0);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const navbarRef = useRef<HTMLElement>(null);
  const menuCartRef = useRef<HTMLDivElement>(null);

  const isAdminPage = pathname.startsWith('/admin');

  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  // Check admin login status
  useEffect(() => {
    const checkAdminStatus = () => {
      if (typeof window !== 'undefined' && isAdminPage) {
        const adminToken = localStorage.getItem('adminJwt');
        setIsAdminLoggedIn(!!adminToken);
      } else {
        setIsAdminLoggedIn(false);
      }
    };

    checkAdminStatus();
    // Listen for storage changes
    window.addEventListener('storage', checkAdminStatus);
    return () => window.removeEventListener('storage', checkAdminStatus);
  }, [isAdminPage, pathname]);

  useEffect(() => {
    async function updateCartCount() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        setCartCount(0);
        return;
      }

      try {
        let url = `${apiUrl}/api/carts?filters[status][$eq]=active&populate=cart_items`;
        if (!isAuthenticated && guestSessionId) {
          url += `&filters[guest_session][$eq]=${guestSessionId}`;
        }
        const headers = {
          ...(isAuthenticated && token ? { Authorization: `Bearer ${token}` } : {}),
          ...(guestSessionId ? { "x-guest-session": guestSessionId } : {}),
        };
        const response = await axios.get(url, { headers, withCredentials: true });
        const cart = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
        const items = cart?.cart_items || [];
        const totalQuantity = items.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 0), 0);
        setCartCount(totalQuantity);
      } catch (err) {
        console.error("[Navbar] Error fetching cart count:", err);
        setCartCount(0);
      }
    }

    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);
    return () => window.removeEventListener("cartUpdated", updateCartCount);
  }, [isAuthenticated, token, guestSessionId]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
      if (navbarRef.current) {
        setNavbarHeight(navbarRef.current.offsetHeight);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (navbarRef.current) {
        setIsScrolled(window.scrollY > navbarHeight);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navbarHeight]);

  useEffect(() => {
    const updateMenuCartHeight = () => {
      if (isSmallScreen && menuCartRef.current) {
        setMenuCartHeight(menuCartRef.current.offsetHeight);
      }
    };
    updateMenuCartHeight();
    window.addEventListener("resize", updateMenuCartHeight);
    return () => window.removeEventListener("resize", updateMenuCartHeight);
  }, [isSmallScreen]);

  const currentTheme = resolvedTheme ?? "light";

  // Render the logo/title with admin badge if applicable
  const renderLogo = (textSizeClass: string = "text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl") => {
    if (isAdminPage && isAdminLoggedIn) {
      return (
        <span className="flex items-center gap-2">
          <span className={`${textSizeClass} font-extrabold tracking-wide text-orange-500 whitespace-nowrap`}>
            TNT MKR
          </span>
          <span className={styles.adminBadgeNav}>ADMIN</span>
        </span>
      );
    }
    return (
      <span className={`${textSizeClass} font-extrabold tracking-wide text-orange-500 whitespace-nowrap`}>
        TNT MKR
      </span>
    );
  };

  return (
    <>
      {isSmallScreen ? (
        <>
          <header ref={navbarRef} id="navbar" className="w-full bg-transparent dark:bg-dark-navy z-10">
            <div className="flex items-center justify-between p-4">
              <div className="flex-1 text-left flex items-center gap-4">
                <VerseButton isSmallScreen={isSmallScreen} resolvedTheme={resolvedTheme} />
              </div>
              <div className="text-center">
                <Link href="/">
                  {renderLogo("text-base font-extrabold")}
                </Link>
              </div>
              <div className="flex-1 flex items-center justify-end">
                <button
                  onClick={toggleTheme}
                  aria-label={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
                  title={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
                  className={styles.themeToggle}
                >
                  {resolvedTheme === "light" ? (
                    <FaMoon className={`w-5 h-5 ${styles.themeIcon}`} />
                  ) : (
                    <FaSun className={`w-5 h-5 ${styles.themeIcon}`} />
                  )}
                </button>
              </div>
            </div>
          </header>
          {isScrolled && <div style={{ height: `${menuCartHeight}px` }}></div>}
          <div
            ref={menuCartRef}
            className={`flex w-full ${isScrolled ? "fixed top-0 left-0 z-50" : "relative"}`}
          >
            <div className="w-5/6 relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-full bg-orange-500 text-white font-bold text-center py-2"
              >
                {isMenuOpen ? "CLOSE" : "MENU"}
              </button>
            </div>
            <Link href="/cart" className="w-1/6 flex justify-center items-center" style={{ backgroundColor: "var(--light-blue)" }}>
              <div className="relative">
                <ShoppingCartIcon className="h-6 w-6 text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>
            {isMenuOpen && (
              <div
                className={`absolute left-0 right-0 shadow-lg z-30 ${currentTheme === "light" ? "bg-white" : "bg-popup-bg"}`}
                style={{ top: "100%" }}
              >
                <nav className="flex flex-col items-center p-4">
                  <MenuNavLink href="/" label="Home" onClick={() => setIsMenuOpen(false)} theme={currentTheme} />
                  <MenuNavLink href="/store" label="Store" onClick={() => setIsMenuOpen(false)} theme={currentTheme} />
                  <MenuNavLink href="/contact" label="Contact" onClick={() => setIsMenuOpen(false)} theme={currentTheme} />
                </nav>
              </div>
            )}
          </div>
        </>
      ) : (
        <header id="navbar" className="w-full bg-transparent dark:bg-dark-navy">
          <div className="flex items-center justify-between p-4">
            <div className="flex-1 text-left flex items-center gap-4">
              <VerseButton isSmallScreen={isSmallScreen} resolvedTheme={resolvedTheme} />
            </div>
            <div className="text-center">
              <Link href="/">
                {renderLogo()}
              </Link>
            </div>
            <div className="flex-1 text-right flex items-center justify-end gap-4">
              <button
                onClick={toggleTheme}
                aria-label={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
                title={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
                className={styles.themeToggle}
              >
                {resolvedTheme === "light" ? (
                  <FaMoon className={`w-6 h-6 ${styles.themeIcon}`} />
                ) : (
                  <FaSun className={`w-6 h-6 ${styles.themeIcon}`} />
                )}
              </button>
            </div>
          </div>
          <nav className="flex items-center justify-center gap-6 pt-2 pb-4 font-bold text-lg relative">
            <NavLink href="/" label="Home" activePath={pathname} />
            <NavLink href="/store" label="Store" activePath={pathname} />
            <NavLink href="/contact" label="Contact" activePath={pathname} />
            <CartNavLink href="/cart" label="Cart" activePath={pathname} cartCount={cartCount} />
          </nav>
          <div className="h-1 w-full bg-orange-500 dark:bg-accent-blue" />
        </header>
      )}
    </>
  );
}

function NavLink({ href, label, activePath }: { href: string; label: string; activePath: string }) {
  const isActive = activePath === href;
  return (
    <Link href={href} className="relative">
      <span
        className={`px-3 py-2 rounded-full bg-transparent dark:bg-popup-bg ${styles.verseButton} ${isActive ? styles.active : ""} text-orange-500 dark:text-accent-blue`}
      >
        {label}
      </span>
    </Link>
  );
}

function CartNavLink({ href, label, activePath, cartCount }: { href: string; label: string; activePath: string; cartCount: number }) {
  const isActive = activePath === href;
  return (
    <Link href={href} className="relative overflow-visible">
      <span
        className={`px-3 py-2 rounded-full bg-transparent dark:bg-popup-bg ${styles.verseButton} ${isActive ? styles.active : ""} text-orange-500 dark:text-accent-blue`}
      >
        {label}
      </span>
      {cartCount > 0 && (
        <span className="absolute -top-2 -right-2 text-xs font-bold text-white rounded-full h-5 w-5 flex items-center justify-center bg-orange-500 z-20 shadow-lg border-2 border-white dark:border-dark-navy">
          {cartCount}
        </span>
      )}
    </Link>
  );
}

function MenuNavLink({ href, label, onClick, theme }: { href: string; label: string; onClick: () => void; theme: string }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block w-full p-2 text-base text-center transition-colors ${
        theme === "light" ? "text-orange-500 hover:bg-orange-500 hover:text-white" : "text-white hover:bg-popup-bg"
      }`}
    >
      {label}
    </Link>
  );
}