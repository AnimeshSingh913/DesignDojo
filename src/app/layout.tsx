import type { Metadata, Viewport } from "next";
import { Caveat } from 'next/font/google';
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { Analytics } from "@vercel/analytics/react";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import { VisitorTracker } from "@/components/analytics/VisitorTracker";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { JsonLd } from "@/components/seo/JsonLd";
import { UnloadPolicyFix } from "@/components/providers/UnloadPolicyFix";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-handwriting',
  display: 'swap',
  preload: false,
});

export const viewport: Viewport = {
  themeColor: '#354259',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "DesignDojo — AI System Design Copilot | HLD & LLD Practice",
    template: "%s | DesignDojo",
  },
  description: "DesignDojo is an AI copilot for High-Level Design (HLD) practice, Low-Level Design (LLD) practice, machine coding, and software architecture interviews. Generate, review, and simulate scalable system architectures in seconds.",
  keywords: [
    "designdojo",
    "designdojo system design",
    "lld practice",
    "hld practice",
    "system design practice",
    "system design practitioner",
    "high level design practice",
    "low level design practice",
    "system design interview prep",
    "system design copilot",
    "software architecture practice",
    "ai architecture generator",
    "uml class diagram generator",
    "machine coding round",
    "mock system design interview",
  ],
  authors: [{ name: siteConfig.author.name }],
  creator: siteConfig.author.name,
  publisher: "DesignDojo",
  alternates: {
    canonical: siteConfig.url,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: 'any' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    shortcut: '/favicon/favicon.ico',
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/favicon/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DesignDojo',
  },
  openGraph: {
    title: "DesignDojo — AI System Design Copilot | HLD & LLD Practice",
    description: "Master System Design with DesignDojo. Practice HLD, LLD, UML diagrams, traffic simulations, and mock interviews with AI.",
    url: siteConfig.url,
    siteName: "DesignDojo",
    images: [
      {
        url: "/favicon/web-app-manifest-512x512.png",
        width: 512,
        height: 512,
        alt: "DesignDojo Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DesignDojo — AI System Design Copilot | HLD & LLD Practice",
    description: "Master System Design with DesignDojo. Practice HLD, LLD, and mock interviews with AI.",
    images: ["/favicon/web-app-manifest-512x512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="DesignDojo" />
        <meta name="apple-mobile-web-app-title" content="DesignDojo" />
        <meta name="author" content={siteConfig.author.name} />
        <JsonLd />
      </head>
      <body className={`${caveat.variable}`}>
        <UnloadPolicyFix />
        <NextAuthProvider>
          <AuthProvider>
            <VisitorTracker />
            <PwaRegister />
            {children}
            <AuthModal />
          </AuthProvider>
        </NextAuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
