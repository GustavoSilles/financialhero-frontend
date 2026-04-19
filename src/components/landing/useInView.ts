"use client";

import { useEffect, useMemo, useState, RefObject } from "react";

export function useInView(
  ref: RefObject<Element | null>,
  options?: IntersectionObserverInit & { once?: boolean; delay?: number }
): boolean {
  const [inView, setInView] = useState(false);
  const once = options?.once ?? false;
  const delay = options?.delay ?? 0;

  const stableOptions = useMemo(
    () => {
      if (!options) return undefined;
      const { once: _once, delay: _delay, ...rest } = options;
      return rest as IntersectionObserverInit;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options?.root, options?.rootMargin, options?.threshold?.toString()]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timerId: ReturnType<typeof setTimeout> | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (once) {
          if (entry.isIntersecting) {
            if (delay > 0) {
              timerId = setTimeout(() => setInView(true), delay);
            } else {
              setInView(true);
            }
            observer.disconnect();
          }
        } else {
          if (entry.isIntersecting && delay > 0) {
            timerId = setTimeout(() => setInView(true), delay);
          } else {
            if (timerId) clearTimeout(timerId);
            setInView(entry.isIntersecting);
          }
        }
      },
      stableOptions
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timerId) clearTimeout(timerId);
    };
  }, [ref, stableOptions, once, delay]);

  return inView;
}
