import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArchAI — AI System Design Generator",
  description: "Design scalable systems with AI.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
