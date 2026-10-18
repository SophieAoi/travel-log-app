import {
  UtensilsCrossed,
  Landmark,
  BedDouble,
  Umbrella,
  Martini,
  ShoppingBag,
  Trees,
  Palette,
  Coffee,
  Bike,
  type LucideIcon,
} from "lucide-react";

export type TagCategory =
  | "RESTAURANT"
  | "ATTRACTION"
  | "HOTEL"
  | "BEACH"
  | "NIGHTLIFE"
  | "SHOPPING"
  | "NATURE"
  | "MUSEUM"
  | "CAFE"
  | "ACTIVITY";

export interface TagMeta {
  value: TagCategory;
  label: string;
  icon: LucideIcon;
}

export const TAGS: TagMeta[] = [
  { value: "RESTAURANT", label: "Restaurant", icon: UtensilsCrossed },
  { value: "ATTRACTION", label: "Attraction", icon: Landmark },
  { value: "HOTEL", label: "Hotel", icon: BedDouble },
  { value: "BEACH", label: "Beach", icon: Umbrella },
  { value: "NIGHTLIFE", label: "Nightlife", icon: Martini },
  { value: "SHOPPING", label: "Shopping", icon: ShoppingBag },
  { value: "NATURE", label: "Nature", icon: Trees },
  { value: "MUSEUM", label: "Museum", icon: Palette },
  { value: "CAFE", label: "Cafe", icon: Coffee },
  { value: "ACTIVITY", label: "Activity", icon: Bike },
];

const TAG_MAP = new Map(TAGS.map((t) => [t.value, t]));

export function tagMeta(value: string): TagMeta | undefined {
  return TAG_MAP.get(value as TagCategory);
}

export function tagLabel(value: string): string {
  return TAG_MAP.get(value as TagCategory)?.label ?? value;
}
