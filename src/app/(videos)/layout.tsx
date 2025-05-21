import type { Metadata } from "next";
import { validateRequest } from "@/auth";
import "../globals.css";
import SessionProvider from "../(main)/SessionProvider";

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
      <body className="antialiased bg-white">
        <SessionProvider value={{ user } as any}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
} 