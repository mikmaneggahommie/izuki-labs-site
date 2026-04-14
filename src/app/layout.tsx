import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "izuki.labs | Social Media Design Packages",
  description:
    "Social media systems, brand direction, and fixed monthly design retainers by Mikiyas Daniel in Addis Ababa.",
  openGraph: {
    title: "izuki.labs | Social Media Design Packages",
    description:
      "Social media systems, brand direction, and fixed monthly design retainers by Mikiyas Daniel in Addis Ababa.",
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
      <body>{children}</body>
    </html>
  );
}
