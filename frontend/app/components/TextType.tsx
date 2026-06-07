"use client";

import { useEffect, useMemo, useState } from "react";

export default function TextType({
  text,
  typingSpeed = 42,
  pauseDuration = 1600,
  deletingSpeed = 24,
  loop = true,
  showCursor = true,
  cursorCharacter = "|",
  className,
  style,
}: {
  text: string | string[];
  typingSpeed?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
  loop?: boolean;
  showCursor?: boolean;
  cursorCharacter?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const items = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);
  const [displayedText, setDisplayedText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = items[textIndex] ?? "";

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < current.length) {
          setDisplayedText(current.slice(0, charIndex + 1));
          setCharIndex((value) => value + 1);
          return;
        }

        if (items.length === 1 && !loop) {
          return;
        }

        setIsDeleting(true);
        return;
      }

      if (displayedText.length > 0) {
        setDisplayedText(current.slice(0, displayedText.length - 1));
        return;
      }

      setIsDeleting(false);
      setCharIndex(0);
      setTextIndex((value) => {
        if (!loop && value === items.length - 1) {
          return value;
        }
        return (value + 1) % items.length;
      });
    }, !isDeleting ? (charIndex < current.length ? typingSpeed : pauseDuration) : displayedText.length > 0 ? deletingSpeed : 160);

    return () => clearTimeout(timeout);
  }, [charIndex, deletingSpeed, displayedText, isDeleting, items, loop, pauseDuration, textIndex, typingSpeed]);

  return (
    <span className={className} style={style}>
      {displayedText}
      {showCursor ? <span style={{ opacity: 0.75, marginLeft: "0.08em" }}>{cursorCharacter}</span> : null}
    </span>
  );
}
