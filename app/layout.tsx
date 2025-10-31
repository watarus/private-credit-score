import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Private Credit Score | Zama FHEVM",
  description: "Privacy-preserving credit scoring system built with Zama's FHEVM",
};

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script src="/polyfills.js" strategy="beforeInteractive" />
      </head>
      <body>{children}</body>
    </html>
  );
}
