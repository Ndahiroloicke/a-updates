import { Toaster } from "@/components/ui/toaster";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import localFont from "next/font/local";
import { extractRouterConfig } from "uploadthing/server";
import { fileRouter } from "./api/uploadthing/core";
import "./globals.css";
import ReactQueryProvider from "./ReactQueryProvider";
import { AdProvider } from "@/contexts/AdContext";
import { TranslationProvider } from "@/contexts/TranslationContext";

const workSans = localFont({
  src: [
    {
      path: "./fonts/WorkSans-Black.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "./fonts/WorkSans-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/WorkSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/WorkSans-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/WorkSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/WorkSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/WorkSans-Thin.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/WorkSans-ExtraLight.ttf",
      weight: "100",
      style: "normal",
    },
  ],
  variable: "--font-work-sans",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Africa Updates",
    default: "Africa Updates",
  },
  description: "Your trusted source for African news, polls, and discussions",
  keywords: "Africa, news, polls, discussions, African updates, current events",
  openGraph: {
    type: "website",
    siteName: "Africa Updates",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#22c55e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={workSans.variable}>
        <NextSSRPlugin routerConfig={extractRouterConfig(fileRouter)} />
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AdProvider>
              <TranslationProvider>{children}</TranslationProvider>
            </AdProvider>
          </ThemeProvider>
        </ReactQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
