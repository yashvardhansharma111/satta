import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DPBOSS | SATTA MATKA | KALYAN MATKA | MATKA RESULT | SATTA | MATKA",
  description: "Dpboss boston is the No. 1 Matka Sites. Find Satta Matka Result, Kalyan Matka, Milan Day, Rajdhani Night, Time Bazar, Main Bazar results fast and accurate.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
