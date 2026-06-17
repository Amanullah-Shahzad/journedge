"use client";

import { useEffect, useState } from "react";

import { resolveApiUrl } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/session";

interface AuthenticatedImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function AuthenticatedImage({ src, alt, className, style }: AuthenticatedImageProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let nextObjectUrl: string | null = null;

    async function load() {
      try {
        setFailed(false);
        const headers = new Headers();
        const accessToken = getAccessToken();
        if (accessToken) {
          headers.set("Authorization", `Bearer ${accessToken}`);
        }

        const response = await fetch(resolveApiUrl(src), {
          headers,
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to load image: ${response.status}`);
        }

        const blob = await response.blob();
        nextObjectUrl = URL.createObjectURL(blob);

        if (isMounted) {
          setObjectUrl(nextObjectUrl);
        }
      } catch {
        if (isMounted) {
          setFailed(true);
          setObjectUrl(null);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
      if (nextObjectUrl) {
        URL.revokeObjectURL(nextObjectUrl);
      }
    };
  }, [src]);

  if (!objectUrl || failed) {
    return null;
  }

  return <img src={objectUrl} alt={alt} className={className} style={style} />;
}
