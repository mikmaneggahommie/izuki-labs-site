import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "izuki.labs | Social Media Design Packages",
  description:
    "Premium social media graphic design services by Mikiyas Daniel. Fixed monthly retainer packages for brands seeking visual distinction.",
  openGraph: {
    title: "izuki.labs | Social Media Design Packages",
    description:
      "Premium social media graphic design services. Fixed monthly retainer packages starting from 7,500 Birr.",
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
      <body className={`${inter.variable} ${syne.variable}`}>
        {children}
      </body>
    </html>
  );
}
