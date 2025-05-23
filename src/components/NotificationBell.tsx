"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface NotificationBellProps {
  role: string;
}

export default function NotificationBell({ role }: NotificationBellProps) {
  const router = useRouter();
  const [pendingRequests, setPendingRequests] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch pending requests count
  useEffect(() => {
    if (role === "SUB_ADMIN" || role === "ADMIN") {
      fetchPendingRequests();
    }
  }, [role]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/publisher-request");
      
      if (response.ok) {
        const requests = await response.json();
        // Filter for pending requests only
        const pending = requests.filter(req => req.status === "PENDING");
        setPendingRequests(pending.length);
      }
    } catch (error) {
      console.error("Failed to fetch pending requests:", error);
    } finally {
      setLoading(false);
    }
  };

  if (role !== "SUB_ADMIN" && role !== "ADMIN") {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {pendingRequests > 0 && (
            <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 p-0 text-xs text-white">
              {pendingRequests}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Notifications</h4>
            <p className="text-sm text-muted-foreground">
              Manage your notifications and requests
            </p>
          </div>
          <div className="grid gap-2">
            {pendingRequests > 0 ? (
              <div className="flex items-center justify-between rounded-md bg-muted p-3">
                <div>
                  <p className="text-sm font-medium">Publisher Requests</p>
                  <p className="text-xs text-muted-foreground">
                    {pendingRequests} pending request{pendingRequests !== 1 && "s"}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => router.push("/subadmins/publisher-requests")}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Review
                </Button>
              </div>
            ) : (
              <div className="rounded-md bg-muted p-3">
                <p className="text-sm text-center text-muted-foreground">
                  No new notifications
                </p>
              </div>
            )}
            
            <div className="flex justify-end pt-2">
              <Link href="/subadmins/publisher-requests" className="text-xs text-blue-600 hover:underline">
                View all publisher requests
              </Link>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 