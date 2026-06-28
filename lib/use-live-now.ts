"use client";

import { useEffect, useState } from "react";

export function useLiveNow(intervalMs = 60000) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [intervalMs]);

  return nowMs;
}
