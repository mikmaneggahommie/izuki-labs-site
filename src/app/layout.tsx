import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";

const neueHaasDisplay = localFont({
  variable: "--font-neue-haas-display",
  display: "swap",
  src: [
    {
      path: "../../public/fonts/NeueHaasDisplayRoman.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/NeueHaasDisplayMediu.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/NeueHaasDisplayBold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/NeueHaasDisplayBlack.ttf",
      weight: "900",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "izuki.labs | Social Media Design Packages",
  description:
    "Social media systems, brand direction, and fixed monthly design retainers from Addis Ababa.",
  openGraph: {
    title: "izuki.labs | Social Media Design Packages",
    description:
      "Social media systems, brand direction, and fixed monthly design retainers from Addis Ababa.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={neueHaasDisplay.variable}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
