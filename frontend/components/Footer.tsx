"use client";

import Link from "next/link";
import Image from "next/image";
import { FC } from "react";
import { useServerYear } from "../hooks/useServerYear"; // Import the custom hook

/**
 * Footer Component
 * ----------------
 * Includes:
 *  - Store, About, FAQ, Contact links
 *  - Legal/policy links: Privacy Policy, Terms of Service, Shipping Policy, Returns
 *  - Social media icons for Facebook, Instagram, X (formerly Twitter)
 *  - Uses local PNG icons in /public/icons/:
 *      Facebook_Icon.png
 *      Instagram_Icon.png
 *      X_Icon.png
 */
const Footer: FC = () => {
  const year = useServerYear(); // Use the custom hook to get the server year

  return (
    <footer
      className="text-center py-6 z-50 flex flex-col items-center justify-center gap-3"
      style={{
        color: "var(--orange)",
        backgroundColor: "rgba(255, 255, 255, 0.0)",
        backdropFilter: "blur(3px)",
      }}
    >
      <div className="hidden dark:block h-1 w-full bg-orange-500" />
      {/* Copyright */}
      <p className="mb-2 dark:text-border-blue">© {year} TNT MKR. All rights reserved.</p>

      {/* Footer Nav Links */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link href="/store" className="hover:underline dark:hover:text-accent-blue">
          Store
        </Link>
        <Link href="/about" className="hover:underline dark:hover:text-accent-blue">
          About
        </Link>
        <Link href="/faq" className="hover:underline dark:hover:text-accent-blue">
          FAQ
        </Link>
        <Link href="/contact" className="hover:underline dark:hover:text-accent-blue">
          Contact
        </Link>
      </div>

      {/* Legal / Policy Links */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm opacity-70">
        <Link href="/privacy-policy" className="hover:underline dark:hover:text-accent-blue">
          Privacy Policy
        </Link>
        <span aria-hidden="true">|</span>
        <Link href="/terms-of-service" className="hover:underline dark:hover:text-accent-blue">
          Terms of Service
        </Link>
        <span aria-hidden="true">|</span>
        <Link href="/shipping-policy" className="hover:underline dark:hover:text-accent-blue">
          Shipping Policy
        </Link>
        <span aria-hidden="true">|</span>
        <Link href="/returns" className="hover:underline dark:hover:text-accent-blue">
          Returns
        </Link>
      </div>

      {/* Social Icons - using your PNG files */}
      <div className="flex items-center justify-center gap-6 mt-3">
        {/* Facebook */}
        <a
          href="https://www.facebook.com/TNT.MKR.Custom.Cases/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80"
        >
          <Image
            src="/icons/Facebook_Icon.png"
            alt="Facebook"
            width={48}
            height={48}
            className="object-contain w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 social-icon"
          />
        </a>

        {/* Instagram */}
        <a
          href="https://www.instagram.com/tnt_mkr/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80"
        >
          <Image
            src="/icons/Instagram_Icon.png"
            alt="Instagram"
            width={48}
            height={48}
            className="object-contain w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 social-icon"
          />
        </a>

        {/* X (formerly Twitter) */}
        <a
          href="https://x.com/TNT_MKR"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80"
        >
          <Image
            src="/icons/X_Icon.png"
            alt="X (formerly Twitter)"
            width={48}
            height={48}
            className="object-contain w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 social-icon"
          />
        </a>
      </div>
    </footer>
  );
};

export default Footer;