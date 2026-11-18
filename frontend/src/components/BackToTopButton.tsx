'use client';

import React, { useState, useEffect } from 'react';

export interface BackToTopButtonProps {
  threshold?: number; // scroll threshold in px, default 400
  className?: string;
  ariaLabel?: string;
}

export function BackToTopButton({
  threshold = 400,
  className = '',
  ariaLabel = 'Back to top',
}: BackToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > threshold) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={ariaLabel}
      data-testid="back-to-top-button"
      className={`fixed bottom-6 right-6 z-40 flex items-center justify-center p-3 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 shadow-2xl shadow-indigo-500/20 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 text-indigo-400 group-hover:text-white transition-transform group-hover:-translate-y-0.5 duration-200"
        aria-hidden="true"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
      <span className="sr-only">{ariaLabel}</span>
    </button>
  );
}

export default BackToTopButton;
