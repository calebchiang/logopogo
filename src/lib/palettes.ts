export type Palette = {
  id: string
  label: string
  colors: string[]
}

export const palettes: Palette[] = [
  {
    id: "green",
    label: "Green",
    colors: ["#22C55E", "#16A34A", "#15803D", "#14532D"],
  },
  {
    id: "blue",
    label: "Blue",
    colors: ["#3B82F6", "#2563EB", "#1D4ED8", "#1E40AF"],
  },
  {
    id: "cyan",
    label: "Cyan",
    colors: ["#06B6D4", "#0891B2", "#0E7490", "#155E75"],
  },
  {
    id: "indigo",
    label: "Indigo",
    colors: ["#6366F1", "#4F46E5", "#4338CA", "#3730A3"],
  },
  {
    id: "purple",
    label: "Purple",
    colors: ["#A855F7", "#9333EA", "#7E22CE", "#6B21A8"],
  },
  {
    id: "red",
    label: "Red",
    colors: ["#EF4444", "#DC2626", "#B91C1C", "#991B1B"],
  },
  {
    id: "orange",
    label: "Orange",
    colors: ["#FB923C", "#F97316", "#EA580C", "#C2410C"],
  },
  {
    id: "yellow",
    label: "Yellow",
    colors: ["#FACC15", "#EAB308", "#CA8A04", "#A16207"],
  },
  {
    id: "pink",
    label: "Pink",
    colors: ["#EC4899", "#DB2777", "#BE185D", "#9D174D"],
  },
  {
    id: "teal",
    label: "Teal",
    colors: ["#14B8A6", "#0D9488", "#0F766E", "#115E59"],
  },
  {
    id: "brown",
    label: "Brown",
    colors: ["#92400E", "#78350F", "#633112", "#4B2E0D"],
  },
  {
    id: "gray",
    label: "Gray",
    colors: ["#6B7280", "#4B5563", "#374151", "#1F2937"],
  },
]
