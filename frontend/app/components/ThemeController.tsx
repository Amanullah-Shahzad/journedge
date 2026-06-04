"use client";

import { useEffect, useState } from "react";

import {
  SETTINGS_EVENT,
  applySettingsToDocument,
  getDefaultSettings,
  readStoredSettings,
  type Settings,
} from "../hooks/useSettings";

export function ThemeController() {
  const [settings, setSettings] = useState<Settings>(getDefaultSettings);

  useEffect(() => {
    const applyCurrent = () => {
      const next = readStoredSettings();
      setSettings(next);
      applySettingsToDocument(next);
    };

    applyCurrent();

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      const next = readStoredSettings();
      applySettingsToDocument(next);
      setSettings(next);
    };
    const handleStorage = () => applyCurrent();
    const handleSettings = (event: Event) => {
      const custom = event as CustomEvent<Settings>;
      const next = custom.detail ?? readStoredSettings();
      setSettings(next);
      applySettingsToDocument(next);
    };

    media.addEventListener("change", handleMediaChange);
    window.addEventListener("storage", handleStorage);
    window.addEventListener(SETTINGS_EVENT, handleSettings as EventListener);

    return () => {
      media.removeEventListener("change", handleMediaChange);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(SETTINGS_EVENT, handleSettings as EventListener);
    };
  }, []);

  useEffect(() => {
    applySettingsToDocument(settings);
  }, [settings]);

  return null;
}
