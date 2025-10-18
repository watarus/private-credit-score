import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Private Credit Score | Zama FHEVM",
  description: "Privacy-preserving credit scoring system built with Zama's FHEVM",
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
