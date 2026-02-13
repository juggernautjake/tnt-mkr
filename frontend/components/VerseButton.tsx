"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import styles from "./Navbar.module.css";
import { abbreviateReference } from "../lib/bookMappings";

interface VerseButtonProps {
  isSmallScreen: boolean;
  resolvedTheme: string | undefined;
}

/**
 * Bible verse button with popup. Fetches a daily verse and displays it
 * in a popup on click (mobile) or hover (desktop).
 */
export default function VerseButton({ isSmallScreen, resolvedTheme }: VerseButtonProps) {
  const [verse, setVerse] = useState({ reference: "Loading...", text: "" });
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);

  const abbreviatedRef = abbreviateReference(verse.reference);

  // Fetch daily verse
  useEffect(() => {
    async function fetchVerse() {
      try {
        const response = await axios.get("https://beta.ourmanna.com/api/v1/get?format=json");
        const data = response.data;
        setVerse({ reference: data.verse.details.reference, text: data.verse.details.text });
      } catch (error) {
        console.error("Failed to fetch verse:", error);
        setVerse({
          reference: "John 3:16",
          text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
        });
      }
    }
    fetchVerse();
  }, []);

  // Position popup on small screens
  useEffect(() => {
    if (isPopupOpen && buttonRef.current && popupRef.current && isSmallScreen) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      popupRef.current.style.left = `${buttonRect.left}px`;
      popupRef.current.style.top = `${buttonRect.bottom + 5}px`;
      popupRef.current.style.transform = "none";
    }
  }, [isPopupOpen, isSmallScreen]);

  // Close on click outside
  useEffect(() => {
    if (isPopupOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          popupRef.current &&
          !popupRef.current.contains(event.target as Node) &&
          buttonRef.current &&
          !buttonRef.current.contains(event.target as Node)
        ) {
          setIsPopupOpen(false);
        }
      };
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isPopupOpen]);

  const handleMouseEnter = () => {
    if (!isPopupOpen && buttonRef.current && popupRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const popupWidth = 400;
      let left = buttonRect.left + buttonRect.width / 2 - popupWidth / 2;
      left = Math.max(10, Math.min(left, window.innerWidth - popupWidth - 10));
      const top = buttonRect.bottom + 8;
      popupRef.current.style.left = `${left}px`;
      popupRef.current.style.top = `${top}px`;
      popupRef.current.style.transform = "none";
    }
  };

  const bibleGatewayUrl = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(verse.reference)}&version=CSB`;

  if (isSmallScreen) {
    return (
      <>
        <a
          ref={buttonRef}
          href={bibleGatewayUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault();
            setIsPopupOpen(!isPopupOpen);
          }}
          className={`flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 text-sm font-bold text-orange-500 dark:text-accent-blue ${styles.verseButton} ${isPopupOpen ? styles.verseButtonActive : ""}`}
        >
          <Image
            src="/icons/Fish_Icon.png"
            alt="Fish Symbol"
            width={24}
            height={24}
            className={`h-4 sm:h-5 md:h-6 w-auto ${resolvedTheme === "dark" ? styles.blueFilter : ""}`}
          />
          <span className="hidden sm:inline md:hidden text-sm font-bold">{abbreviatedRef}</span>
          <span className="hidden md:inline text-base font-bold">{verse.reference}</span>
        </a>
        {isPopupOpen && (
          <div
            ref={popupRef}
            className="fixed z-50 p-4 bg-background-light dark:bg-popup-bg border-2 border-orange-500 dark:border-accent-blue rounded-lg shadow text-gray-900 dark:text-white w-[90vw] max-w-[300px]"
          >
            <span className="absolute top-2 left-2 text-sm font-bold text-orange-500 dark:text-accent-blue">
              {abbreviatedRef}
            </span>
            <button
              onClick={() => setIsPopupOpen(false)}
              className="absolute top-2 right-2 text-orange-500 hover:text-orange-700 dark:text-gray-300 dark:hover:text-gray-100"
            >
              ×
            </button>
            <p className="text-sm leading-relaxed mt-4">{verse.text}</p>
            <a
              href={bibleGatewayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 dark:text-accent-blue underline mt-2 block text-right text-sm"
            >
              Read More
            </a>
          </div>
        )}
      </>
    );
  }

  // Desktop: hover to show popup
  return (
    <div className="relative group cursor-pointer" onMouseEnter={handleMouseEnter}>
      <a
        ref={buttonRef}
        href={bibleGatewayUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          if (window.innerWidth < 640) {
            e.preventDefault();
            setIsPopupOpen(!isPopupOpen);
          }
        }}
        className={`flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full bg-transparent dark:bg-popup-bg text-orange-500 dark:text-accent-blue ${styles.verseButton} ${isPopupOpen ? styles.verseButtonActive : ""}`}
      >
        <Image
          src="/icons/Fish_Icon.png"
          alt="Fish Symbol"
          width={24}
          height={24}
          className={`h-4 sm:h-5 md:h-6 w-auto ${resolvedTheme === "dark" ? styles.blueFilter : ""}`}
        />
        <span className="hidden sm:inline md:hidden text-sm font-bold">{abbreviatedRef}</span>
        <span className="hidden md:inline text-base font-bold">{verse.reference}</span>
      </a>
      <div
        ref={popupRef}
        className={`
          fixed z-50 p-4 bg-background-light dark:bg-popup-bg border-2 border-orange-500 dark:border-accent-blue rounded-lg shadow text-gray-900 dark:text-white transition-opacity duration-300
          w-[90vw] max-w-[400px] md:w-auto md:max-w-md
          ${isPopupOpen ? "block" : "hidden md:group-hover:block"}
        `}
        style={isPopupOpen ? { top: "50%", left: "50%", transform: "translate(-50%, -50%)" } : {}}
      >
        {isPopupOpen && (
          <button
            onClick={() => setIsPopupOpen(false)}
            className="absolute top-2 right-2 text-orange-500 hover:text-orange-700 dark:text-gray-300 dark:hover:text-gray-100"
          >
            ×
          </button>
        )}
        <p className="text-sm leading-relaxed">{verse.text}</p>
      </div>
    </div>
  );
}
