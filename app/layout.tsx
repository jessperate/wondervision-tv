import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wondervision",
  description: "A responsive image-backed retro television experience.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
