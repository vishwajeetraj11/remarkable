"use client";

import { useEffect } from "react";

export function ClarityInit() {
  useEffect(() => {
    const id = process.env.NEXT_PUBLIC_CLARITY_ID;
    if (!id) return;
    import("@microsoft/clarity").then((mod) => mod.default.init(id));
  }, []);

  return null;
}
