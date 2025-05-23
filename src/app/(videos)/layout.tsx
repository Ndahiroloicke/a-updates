import type { Metadata } from "next";
import { validateRequest } from "@/auth";
import SessionProvider from "../(main)/SessionProvider";
import { Toaster } from "@/components/ui/toaster";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { fileRouter } from "../api/uploadthing/core";
import { ThemeProvider } from "next-themes";
import ReactQueryProvider from "../ReactQueryProvider";
import { AdProvider } from "@/contexts/AdContext";
import { TranslationProvider } from "@/contexts/TranslationContext";
import localFont from "next/font/local";

const workSans = localFont({
  src: [
    {
      path: "../fonts/WorkSans-Black.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../fonts/WorkSans-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../fonts/WorkSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/WorkSans-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/WorkSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/WorkSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/WorkSans-Thin.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../fonts/WorkSans-ExtraLight.ttf",
      weight: "100",
      style: "normal",
    },
  ],
  variable: "--font-work-sans",
});

export const metadata: Metadata = {
  title: "Afro Shorts",
  description: "Short video experience",
};

export default async function VideosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();

  return (
    <html lang="en">
      <body className={workSans.variable}>
        <NextSSRPlugin routerConfig={extractRouterConfig(fileRouter)} />
        <SessionProvider value={{ user } as any}>
          <ReactQueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <AdProvider>
                <TranslationProvider>
                  {children}
                  <Toaster />
                </TranslationProvider>
              </AdProvider>
            </ThemeProvider>
          </ReactQueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
} 