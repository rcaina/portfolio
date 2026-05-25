"use client";

import { useEffect, useState } from "react";

export function usePlatform() {
  const [isMac, setIsMac] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
    const platform =
      (navigator as Navigator & { userAgentData?: { platform?: string } })
        .userAgentData?.platform ?? navigator.platform;
    setIsMac(/mac|iphone|ipad|ipod/i.test(platform));
  }, []);

  return { isMac, mounted, modKey: isMac ? "⌘" : "Ctrl" };
}
