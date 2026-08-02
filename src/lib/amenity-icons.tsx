import {
  Accessibility,
  Car,
  CookingPot,
  Droplet,
  Droplets,
  Fence,
  Gauge,
  House,
  MoveVertical,
  PanelTop,
  ShieldCheck,
  ShowerHead,
  Trees,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Amenity icons are resolved through a static map rather than a dynamic lookup
 * so the bundler can tree-shake lucide down to the fifteen glyphs actually used.
 */
const ICONS: Record<string, LucideIcon> = {
  car: Car,
  zap: Zap,
  droplets: Droplets,
  "move-vertical": MoveVertical,
  fence: Fence,
  "shield-check": ShieldCheck,
  house: House,
  "panel-top": PanelTop,
  trees: Trees,
  wifi: Wifi,
  gauge: Gauge,
  droplet: Droplet,
  "cooking-pot": CookingPot,
  "shower-head": ShowerHead,
  accessibility: Accessibility,
};

export function AmenityIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const Icon = ICONS[icon] ?? House;
  return <Icon className={className} aria-hidden="true" />;
}

/** Key amenities are keyed by slug because the card knows slugs, not icon names. */
const KEY_ICONS: Record<string, LucideIcon> = {
  generator: Zap,
  "water-tank": Droplets,
};

export function KeyAmenityIcon({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const Icon = KEY_ICONS[slug] ?? Zap;
  return <Icon className={className} aria-hidden="true" />;
}
