import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface SettingsContextValue {
  openAIKey: string | null;
  useAICategorization: boolean;
  setOpenAIKey: (key: string | null) => void;
  setUseAICategorization: (enabled: boolean) => void;
}

const SETTINGS_KEY = 'shekelSpeak.settings.v1';

interface StoredSettings {
  openAIKey: string | null;
  useAICategorization: boolean;
}

function loadSettings(): StoredSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { openAIKey: null, useAICategorization: false };
    const parsed = JSON.parse(raw) as StoredSettings;
    return { openAIKey: parsed.openAIKey ?? null, useAICategorization: !!parsed.useAICategorization };
  } catch {
    return { openAIKey: null, useAICategorization: false };
  }
}

function saveSettings(data: StoredSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = useMemo(() => loadSettings(), []);
  const [openAIKey, setOpenAIKeyState] = useState<string | null>(initial.openAIKey);
  const [useAICategorization, setUseAICategorizationState] = useState<boolean>(initial.useAICategorization);

  useEffect(() => {
    saveSettings({ openAIKey, useAICategorization });
  }, [openAIKey, useAICategorization]);

  const setOpenAIKey = (key: string | null) => setOpenAIKeyState(key);
  const setUseAICategorization = (enabled: boolean) => setUseAICategorizationState(enabled);

  const value: SettingsContextValue = { openAIKey, useAICategorization, setOpenAIKey, setUseAICategorization };
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}


