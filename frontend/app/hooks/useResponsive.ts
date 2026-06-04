"use client";

import { useEffect, useState } from "react";

function getWidth() {
  return typeof window === "undefined" ? 1440 : window.innerWidth;
}

export function useResponsive() {
  const [width, setWidth] = useState(getWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return {
    width,
    isMobile: width < 768,
    isTablet: width < 1100,
    isDesktop: width >= 1100,
  };
}
