import {
  Inter,
  Roboto,
  Montserrat,
  Poppins,
  DM_Sans,
  Space_Grotesk,
  Bebas_Neue,
  Raleway,
  Oswald,
  Anton,
  Lato,
  Playfair_Display,
} from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"], display: "swap" });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], display: "swap" });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "600", "700"], display: "swap" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"], display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"], display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700"], display: "swap" });
const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: ["400"], display: "swap" });
const raleway = Raleway({ subsets: ["latin"], weight: ["400", "600", "700"], display: "swap" });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "500", "700"], display: "swap" });
const anton = Anton({ subsets: ["latin"], weight: ["400"], display: "swap" });
const lato = Lato({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], weight: ["400", "600", "700"], display: "swap" });

export type FontOption = {
  id: string;
  label: string;
  cssName: string;
  className?: string;
};

export const FONT_OPTIONS: FontOption[] = [
  { id: "inter", label: "Inter", cssName: "Inter", className: inter.className },
  { id: "system-ui", label: "System UI", cssName: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' },
  { id: "roboto", label: "Roboto", cssName: "Roboto", className: roboto.className },
  { id: "montserrat", label: "Montserrat", cssName: "Montserrat", className: montserrat.className },
  { id: "poppins", label: "Poppins", cssName: "Poppins", className: poppins.className },
  { id: "dm-sans", label: "DM Sans", cssName: '"DM Sans"', className: dmSans.className },
  { id: "space-grotesk", label: "Space Grotesk", cssName: '"Space Grotesk"', className: spaceGrotesk.className },
  { id: "bebas-neue", label: "Bebas Neue", cssName: '"Bebas Neue"', className: bebasNeue.className },
  { id: "raleway", label: "Raleway", cssName: "Raleway", className: raleway.className },
  { id: "oswald", label: "Oswald", cssName: "Oswald", className: oswald.className },
  { id: "anton", label: "Anton", cssName: "Anton", className: anton.className },
  { id: "lato", label: "Lato", cssName: "Lato", className: lato.className },
  { id: "playfair-display", label: "Playfair Display", cssName: '"Playfair Display"', className: playfairDisplay.className },
];

export const FONT_BY_ID = Object.fromEntries(FONT_OPTIONS.map((f) => [f.id, f]));

export type SimpleFontOption = { name: string; cssFamily: string };
export const FONTS: SimpleFontOption[] = FONT_OPTIONS.map((f) => ({
  name: f.label,
  cssFamily: f.cssName,
}));

export const ALL_FONT_CLASSES = [
  inter.className,
  roboto.className,
  montserrat.className,
  poppins.className,
  dmSans.className,
  spaceGrotesk.className,
  bebasNeue.className,
  raleway.className,
  oswald.className,
  anton.className,
  lato.className,
  playfairDisplay.className,
]
  .filter(Boolean)
  .join(" ");
