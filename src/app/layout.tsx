import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Nunito_Sans } from "next/font/google";
import QueryProvider from "@/components/providers/query-provider";
import { SerwistProvider } from "@/components/providers/serwist-provider";
import { cn } from "@/lib/utils";

import "./globals.css";
import { APP_CONFIG } from "@/app.config";

const nunitoSans = Nunito_Sans({ variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_NAME = "PWA App";
const APP_DEFAULT_TITLE = APP_CONFIG.name;
const APP_TITLE_TEMPLATE = `%s - ${APP_CONFIG.name}`;
const APP_DESCRIPTION = APP_CONFIG.description;

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#ffffff",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#1d1d1f",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={nunitoSans.variable}>
      <body
        className={cn(
          "dark",
          geistSans.variable,
          geistMono.variable,
          "antialiased",
        )}
      >
        <QueryProvider>
          <SerwistProvider swUrl="/serwist/sw.js">{children}</SerwistProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
