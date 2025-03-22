"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CompleteProfileButton() {
  return (
    <Link href="/publisher-registration">
      <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
        Complete Profile
      </Button>
    </Link>
  );
} 