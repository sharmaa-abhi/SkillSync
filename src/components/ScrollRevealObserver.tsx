"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * ScrollRevealObserver — Universal Scroll Reveal & Progress Tracker
 *
 * Automatically monitors all elements with `[data-scroll]` across all pages.
 * Seamlessly handles:
 * - Route transitions (App Router)
 * - Dynamic data hydration / API responses via MutationObserver
 * - Viewport-aware immediate reveal for above-the-fold content
 * - Native prefers-reduced-motion support
 * - Top-edge reading/scroll progress bar
 */
export default function ScrollRevealObserver() {
  const pathname = usePathname();
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track window scroll progress for the top progress bar
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight =
            document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 0) {
            const currentProgress = (window.scrollY / totalHeight) * 100;
            setScrollProgress(Math.min(Math.max(currentProgress, 0), 100));
          } else {
            setScrollProgress(0);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  // Manage IntersectionObserver & MutationObserver for [data-scroll]
  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      document.querySelectorAll("[data-scroll]").forEach((el) => {
        el.classList.add("is-visible");
      });
      return;
    }

    const observedElements = new WeakSet<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");

            const once = entry.target.getAttribute("data-scroll-once");
            if (once !== "false") {
              observer.unobserve(entry.target);
            }
          } else {
            const once = entry.target.getAttribute("data-scroll-once");
            if (once === "false") {
              entry.target.classList.remove("is-visible");
            }
          }
        });
      },
      {
        threshold: 0.06,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    const observeNewElements = () => {
      const elements = document.querySelectorAll("[data-scroll]");
      elements.forEach((el) => {
        if (!observedElements.has(el)) {
          observedElements.add(el);
          observer.observe(el);

          // If element is already within viewport on initial render, reveal immediately
          const rect = el.getBoundingClientRect();
          if (
            rect.top < window.innerHeight &&
            rect.bottom > 0 &&
            rect.left < window.innerWidth &&
            rect.right > 0
          ) {
            el.classList.add("is-visible");
          }
        }
      });
    };

    // Initial scan with brief paint delay
    const initialTimer = setTimeout(observeNewElements, 60);

    // Watch for dynamically added DOM nodes (after API fetch, etc.)
    const mutationObserver = new MutationObserver(() => {
      observeNewElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(initialTimer);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [pathname]);

  return (
    <div
      className="skillsync-scroll-progress"
      style={{ width: `${scrollProgress}%` }}
      aria-hidden="true"
    />
  );
}
