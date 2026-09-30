import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

// ---------------------------------------------------------------- localStorage (safe)
const read = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v == null ? fallback : (JSON.parse(v) as T);
  } catch {
    return fallback;
  }
};
const write = (key: string, v: unknown) => {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* private mode etc. */ }
};

const listeners = new Map<string, Set<() => void>>();
const emit = (key: string) => listeners.get(key)?.forEach((f) => f());

/** Like useState, but remembered between visits and shared between components. */
export function useStored<T>(key: string, fallback: T) {
  const [v, setV] = useState<T>(() => read(key, fallback));
  useEffect(() => {
    const f = () => setV(read(key, fallback));
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(f);
    return () => { listeners.get(key)!.delete(f); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = useCallback((next: T | ((p: T) => T)) => {
    const val = typeof next === "function" ? (next as (p: T) => T)(read(key, fallback)) : next;
    write(key, val);
    emit(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return [v, set] as const;
}

export function useProgress() {
  const [done, setDone] = useStored<string[]>("seb-progress", []);
  const toggle = (id: string) => setDone((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
  return { done, toggle, isDone: (id: string) => done.includes(id) };
}

// ---------------------------------------------------------------- hash router
const subscribeHash = (f: () => void) => { window.addEventListener("hashchange", f); return () => window.removeEventListener("hashchange", f); };
const getHash = () => window.location.hash.replace(/^#/, "") || "/";

export const useRoute = () => useSyncExternalStore(subscribeHash, getHash, () => "/");
export const go = (path: string) => {
  if (getHash() === path) return;
  window.location.hash = path;
  window.scrollTo({ top: 0 });
};

// ---------------------------------------------------------------- theme
export function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("seb-theme", next ? "dark" : "light"); } catch { /* ignore */ }
  };
  return { dark, toggle };
}
