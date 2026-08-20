import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wondervision · Interactive 3D Television",
  description: "Tune into a fully interactive three-dimensional Wondervision television.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
