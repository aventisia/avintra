import { useEffect, useRef, useState } from "react";

export type LoadedVersionText =
  | { id: string; status: "ready"; text: string }
  | { id: string; status: "unavailable" }
  | { id: string; status: "failed" };

/** Loads one version's text for the compare view; `retry` loads it again after a failure. */
export const useVersionText = (id: string, load: (id: string) => Promise<string | null>) => {
  const [loaded, setLoaded] = useState<LoadedVersionText | null>(null);
  const [attempt, setAttempt] = useState(0);
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    let isCurrent = true;
    loadRef.current(id).then(
      (text) =>
        isCurrent &&
        setLoaded(text === null ? { id, status: "unavailable" } : { id, status: "ready", text }),
      () => isCurrent && setLoaded({ id, status: "failed" }),
    );
    return () => {
      isCurrent = false;
    };
  }, [id, attempt]);

  return {
    loaded: loaded?.id === id ? loaded : null,
    retry: () => {
      setLoaded(null);
      setAttempt((count) => count + 1);
    },
  };
};
