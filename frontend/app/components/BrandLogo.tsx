"use client";

import Image from "next/image";

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

  const resolvedTheme = forceTheme ?? "system";

  return (
    <>
      <style>{`
        .brand-logo-light,
        .brand-logo-dark {
          display: none;
        }

        .brand-logo-light.brand-logo-force-light,
        .brand-logo-dark.brand-logo-force-dark {
          display: block;
        }

        html[data-theme="light"] .brand-logo-light.brand-logo-theme-system,
        html:not([data-theme]) .brand-logo-light.brand-logo-theme-system {
          display: block;
        }

        html[data-theme="dark"] .brand-logo-dark.brand-logo-theme-system {
          display: block;
        }
      `}</style>
      <Image
        className={`brand-logo-light ${resolvedTheme === "light" ? "brand-logo-force-light" : resolvedTheme === "system" ? "brand-logo-theme-system" : ""}`}
        src="/asaanjournal-logo-light.svg"
        alt={alt}
        width={width}
        height={height}
        priority={priority}
      />
      <Image
        className={`brand-logo-dark ${resolvedTheme === "dark" ? "brand-logo-force-dark" : resolvedTheme === "system" ? "brand-logo-theme-system" : ""}`}
        src="/asaanjournal-logo-dark.svg"
        alt={alt}
        width={width}
        height={height}
        priority={priority}
      />
    </>
  );
}
