import type { ReactNode } from "react";
import "./globals.css";

/**
 * The real document shell lives in src/app/[locale]/layout.tsx, because <html lang>
 * depends on the active locale. This root layout only exists to satisfy the App
 * Router's requirement for a top-level layout.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
