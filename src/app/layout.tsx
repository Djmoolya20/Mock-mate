import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Poise — AI interview studio",
  description:
    "Practice the room, not just the answers. Adaptive mock interviews with content coaching and presence feedback.",
};

export const viewport: Viewport = {
  themeColor: "#17181c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${instrumentSerif.variable} antialiased`}
    >
      <body className="min-h-screen bg-paper font-sans text-ink">{children}</body>
    </html>
  );
}
