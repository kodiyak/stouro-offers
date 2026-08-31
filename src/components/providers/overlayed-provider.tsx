"use client";

import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface OverlayedContextValue {
  isOverlayed: boolean;
  registerOverlayed: (key: string, active: boolean) => void;
}

const OverlayedContext = createContext<OverlayedContextValue | null>(null);

let overlayKeyCounter = 0;

export function OverlayedProvider({ children }: PropsWithChildren) {
  const [overlays, setOverlays] = useState<Record<string, boolean>>({});

  const registerOverlayed = useCallback((key: string, active: boolean) => {
    setOverlays((prev) => {
      if (prev[key] === active) {
        return prev;
      }
      return { ...prev, [key]: active };
    });
  }, []);

  const isOverlayed = useMemo(
    () => Object.values(overlays).some(Boolean),
    [overlays],
  );

  const value = useMemo(
    () => ({ isOverlayed, registerOverlayed }),
    [isOverlayed, registerOverlayed],
  );

  return (
    <OverlayedContext.Provider value={value}>
      {children}
    </OverlayedContext.Provider>
  );
}

export function useOverlayed() {
  const context = useContext(OverlayedContext);
  if (!context) {
    throw new Error(
      "useOverlayed deve ser usado dentro de <OverlayedProvider>",
    );
  }
  return context;
}

/**
 * Registra automaticamente um overlay enquanto `active` for true.
 * Use dentro de drawers/componentes que cobrem a tela — o layout
 * de fundo aplica o efeito de "recuo" sozinho.
 */
export function useOverlayedActive(active: boolean) {
  const { isOverlayed, registerOverlayed } = useOverlayed();
  const keyRef = useRef(`overlayed-${++overlayKeyCounter}`);

  useEffect(() => {
    registerOverlayed(keyRef.current, active);
    return () => registerOverlayed(keyRef.current, false);
  }, [active, registerOverlayed]);

  return isOverlayed;
}
