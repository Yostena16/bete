import { IBM_Plex_Sans, Noto_Sans_Ethiopic, Outfit } from "next/font/google";

/** Display face: geometric, holds up under tight negative tracking. */
export const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

/** Body face: ships real tabular figures, which the price columns depend on. */
export const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex",
  display: "swap",
});

/**
 * Ge'ez coverage. Sits on the same font stacks as the Latin faces so a mixed
 * string like "Bole Medhanialem · ቦሌ መድሃኒዓለም" renders without a visible seam.
 */
export const ethiopic = Noto_Sans_Ethiopic({
  subsets: ["ethiopic"],
  variable: "--font-ethiopic",
  display: "swap",
});

export const fontVariables = `${outfit.variable} ${plex.variable} ${ethiopic.variable}`;
