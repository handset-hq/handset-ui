"use client";

import { useEffect, useRef } from "react";

/**
 * Calls `fn` immediately and then every `intervalMs`, pausing while the tab
 * is hidden and firing a catch-up tick when it becomes visible again.
 * Passing `intervalMs: 0` disables polling (initial call still happens).
 */
export function usePoll(fn: () => void, intervalMs: number, deps: unknown[]) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const tick = () => fnRef.current();

    const start = () => {
      tick();
      if (intervalMs > 0) timer = setInterval(tick, intervalMs);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") stop();
      else if (!timer) start();
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, ...deps]);
}
