"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * useScrollAnimation — Intersection Observer-based scroll reveal hook.
 *
 * Watches a container for elements with `data-scroll` attribute
 * and adds the `is-visible` class when they enter the viewport.
 *
 * Usage:
 *   const scrollRef = useScrollReveal();
 *   <div ref={scrollRef}>
 *     <section data-scroll>I fade in on scroll</section>
 *     <div data-scroll="slide-left">I slide from left</div>
 *   </div>
 *
 * Supported data-scroll values:
 *   "" (default)   → fade-up
 *   "fade-up"      → fade + slide up
 *   "fade-down"    → fade + slide down
 *   "fade-left"    → fade + slide from left
 *   "fade-right"   → fade + slide from right
 *   "scale"        → fade + scale up
 *   "fade"         → simple fade
 *
 * Optional attributes:
 *   data-scroll-delay="100"  → delay in ms
 *   data-scroll-once="false" → re-animate when scrolling back (default: true = animate once)
 */
export function useScrollReveal() {
  const containerRef = useRef<HTMLDivElement>(null);

  const setupObserver = useCallback(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // If user prefers reduced motion, just show everything immediately
      const elements =
        containerRef.current.querySelectorAll("[data-scroll]");
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }

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
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    const elements =
      containerRef.current.querySelectorAll("[data-scroll]");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Small delay to allow DOM to paint first
    const timer = setTimeout(setupObserver, 50);
    return () => clearTimeout(timer);
  }, [setupObserver]);

  return containerRef;
}

export default useScrollReveal;
