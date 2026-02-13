import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import TopNavigation from "@/components/TopNavigation";
import { AuthProvider } from "@/components/auth/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Risk Management Dashboard | Professional Trading Tools",
  description: "Advanced crypto risk analysis tool with liquidation calculations, position sizing, and risk/reward ratios for professional traders",
  keywords: ["crypto", "trading", "risk management", "defi", "fintech", "liquidation", "position sizing"],
  authors: [{ name: "Crypto Risk Dashboard" }],
  creator: "Crypto Risk Dashboard",
  publisher: "Crypto Risk Dashboard",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://crypto-risk-dashboard.vercel.app"),
  openGraph: {
    title: "Risk Management Dashboard",
    description: "Professional crypto trading risk analysis with advanced calculations",
    type: "website",
    locale: "en_US",
    url: "https://crypto-risk-dashboard.vercel.app",
    siteName: "Risk Management Dashboard"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ErrorBoundary>
            <TopNavigation />
            {children}
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
