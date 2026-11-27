"use client";

import { useEffect, useState } from "react";

/**
 * True once the page has been scrolled more than `fraction` of a screen.
 *
 * The floating Tools and Feedback pills sit in the bottom-right corner, and on a phone that corner is where a
 * landing page's first-screen buttons are (11/27: on a 375 px phone they covered "Abrir o face swap de fotos"
 * on /pt-BR/face-swap, the Google Ads landing page). Those pills use this with `max-sm:hidden` until it turns
 * true, so the hidden state is plain CSS from the first paint and wider screens never hide them.
 */
export function useScrolledPast(fraction = 0.5): boolean {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const update = () => {
      if (window.scrollY > window.innerHeight * fraction) setPast(true);
    };
    update();
    if (past) return;
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [fraction, past]);
  return past;
}
