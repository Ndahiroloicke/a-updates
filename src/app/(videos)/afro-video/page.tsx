"use client";

import AfroVideoFeed from "@/components/afro-videos/AfroVideoFeed";
import { useSession } from "../../(main)/SessionProvider";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Youtube } from "lucide-react";
import Link from "next/link";

export default function AfroVideoPage() {
  const { user } = useSession();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUB_ADMIN";
  
  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <header className="fixed top-0 left-0 w-full z-50 h-14 flex items-center justify-between px-4 sm:px-6 bg-white/80 backdrop-blur-md border-b">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-800 hover:text-gray-600">
            <ArrowLeft size={22} />
          </Link>
          <div className="flex items-center gap-2">
            <Youtube size={28} className="text-red-600" />
            <h1 className="text-xl font-semibold text-gray-800">Shorts</h1>
          </div>
        </div>
        
        {isAdmin && (
          <Button asChild size="sm" variant="ghost" className="text-gray-800 hover:bg-gray-100">
            <Link href="/afro-video/admin/upload">
              <Plus size={20} className="mr-1 sm:mr-0" />
              <span className="hidden sm:inline ml-1">Upload</span>
            </Link>
          </Button>
        )}
      </header>

      <div className="flex-1 w-full flex items-center justify-center pt-14">
        <AfroVideoFeed />
      </div>
    </div>
  );
} 