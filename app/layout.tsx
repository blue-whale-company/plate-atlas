import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "PlateAtlas — Country-correct plates for your Tesla",
  description:
    "Create a detailed, Tesla-ready licence plate background with the correct regional code, crest, and registration.",
  openGraph: {
    title: "PlateAtlas",
    description: "Your place. Your plate.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "PlateAtlas — Your place. Your plate.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PlateAtlas",
    description: "Your place. Your plate.",
    images: ["/og.png"],
  },
};

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
