import type { Metadata } from "next";
import { Syne, Work_Sans, Space_Mono } from "next/font/google";
import "./base.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-work-sans",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Morildinho AI Lab",
  description: "En lekeplass for AI, design, vibe coding og eksperimenter.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no" className={`${syne.variable} ${workSans.variable} ${spaceMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
