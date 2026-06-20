"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type BrandLogoProps = {
  variant?: "full" | "icon";
  forceTheme?: "light" | "dark";
  width?: number;
  height?: number;
  iconSize?: number;
  alt?: string;
  priority?: boolean;
};

export default function BrandLogo({
  variant = "full",
  forceTheme,
  width = 184,
  height = 36,
  iconSize = 34,
  alt = "AsaanJournal",
  priority = false,
}: BrandLogoProps) {
  if (variant === "icon") {
    return <Image src="/asaanjournal-icon.svg" alt={alt} width={iconSize} height={iconSize} priority={priority} />;
  }

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(
    forceTheme === "dark" ? "dark" : "light",
  );

  useEffect(() => {
    if (forceTheme) {
      setResolvedTheme(forceTheme);
      return;
    }

    const root = document.documentElement;

    const resolveTheme = () => {
      const dataTheme = root.dataset.theme;
      if (dataTheme === "dark" || dataTheme === "light") {
        setResolvedTheme(dataTheme);
        return;
      }

      setResolvedTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    };

    resolveTheme();

    const observer = new MutationObserver(resolveTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onMediaChange = () => resolveTheme();
    media.addEventListener("change", onMediaChange);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", onMediaChange);
    };
  }, [forceTheme]);

  return (
    <Image
      src={resolvedTheme === "dark" ? "/asaanjournal-logo-dark.svg" : "/asaanjournal-logo-light.svg"}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
    />
  );
}
