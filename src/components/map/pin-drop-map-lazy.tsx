"use client";

import dynamic from "next/dynamic";

export const PinDropMapLazy = dynamic(
  () => import("./pin-drop-map").then((mod) => mod.PinDropMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-stone-wash text-sm text-ink-soft" />
    ),
  },
);
