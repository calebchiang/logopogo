import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FONT_OPTIONS } from "@/lib/fonts";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LogoPogo — AI Logo Generator",
    template: "%s — LogoPogo",
  },
  description:
    "Generate clean, icon-only logos for apps and websites. Pick a palette, describe a symbol, and get crisp, transparent PNGs.",
  keywords: [
    "logo generator",
    "AI logos",
    "app icon",
    "favicon",
    "branding",
    "LogoPogo",
  ],
  authors: [{ name: "LogoPogo" }],
  applicationName: "LogoPogo",
  openGraph: {
    title: "LogoPogo — AI Logo Generator",
    description:
      "Generate clean, icon-only logos for apps and websites with strict color and transparency rules.",
    url: "/",
    siteName: "LogoPogo",
    images: [
      {
        url: "/open_graph.png",
        width: 512,
        height: 512,
        alt: "LogoPogo",
      },
    ],
    type: "website",
  },
  themeColor: "#18181b",
  icons: {
    icon: [{ url: "/logopogo_logo_transparent.png", sizes: "256x256", type: "image/png" }],
    apple: [{ url: "/logopogo_logo_transparent.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/logopogo_logo_transparent.png"],
  },
  alternates: { canonical: "/" },
};

function FontPreloader() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        width: 0,
        height: 0,
        overflow: "hidden",
        opacity: 0,
        pointerEvents: "none",
      }}
    >
      {FONT_OPTIONS.filter(f => !!f.className).map(f => (
        <span key={f.id} className={f.className}>Aa</span>
      ))}
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        {children}
        <Footer />
        <Analytics /> 
        <FontPreloader />
      </body>
    </html>
  );
}
