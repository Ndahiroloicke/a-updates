"use client"
import AdminPage from "./AdminPage"
import type { User } from "lucia"
import NewsSidebar from "./NewsSidebar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Edit, Users, Bell, ClipboardCheck, FileCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { User as LucideUser } from "lucide-react"
import { ReactNode, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

const ads = [
  {
    id: "1",
    imageSrc: "/myad.webp",
    link: "https://example.com/ad1",
    alt: "Advertisement 1",
  },
  {
    id: "2",
    imageSrc: "/luka.jpg",
    link: "https://example.com/ad2",
    alt: "Special Offer Advertisement",
  },
  {
    id: "3",
    imageSrc: "/ad2.jpg",
    link: "https://example.com/ad3",
    alt: "Limited Time Deal Advertisement",
  },
]

interface UserDashboardProps {
  userInfo: User & { hasPaid: boolean }
}

// Dashboard Card Component
interface DashboardCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}

function DashboardCard({ title, icon, children }: DashboardCardProps) {
  return (
    <Card className="border border-border hover:border-primary/20 hover:shadow-sm transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-md font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function UserDashboard({ userInfo }: UserDashboardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [pendingRequests, setPendingRequests] = useState<number>(0)
  const [isLoadingRequests, setIsLoadingRequests] = useState<boolean>(false)
  
  // Check for pending publisher requests if user is a sub-admin
  useEffect(() => {
    if (userInfo.role === "SUB_ADMIN") {
      fetchPendingRequests()
    }
  }, [userInfo.role])

  // Fetch pending publisher requests count
  const fetchPendingRequests = async () => {
    try {
      setIsLoadingRequests(true)
      const response = await fetch("/api/publisher-request")
      
      if (response.ok) {
        const requests = await response.json()
        // Filter for pending requests only
        const pending = requests.filter(req => req.status === "PENDING")
        setPendingRequests(pending.length)
      }
    } catch (error) {
      console.error("Failed to fetch publisher requests:", error)
    } finally {
      setIsLoadingRequests(false)
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {userInfo.displayName || 'User'}!</h1>
        <p className="text-gray-600">Manage your profile and content</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Account info card */}
        <DashboardCard
          title="Account Information"
          icon={<LucideUser className="h-6 w-6" />}
        >
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Username:</span>{" "}
              {userInfo.username || "Not set"}
            </p>
            <p>
              <span className="font-semibold">Email:</span>{" "}
              {userInfo.email || "Not set"}
            </p>
            <p>
              <span className="font-semibold">Account type:</span>{" "}
              <Badge variant="outline" className="ml-2">
                {userInfo.role || "User"}
              </Badge>
            </p>
            <p>
              <span className="font-semibold">Joined:</span>{" "}
              {formatDate(userInfo.createdAt)}
            </p>
          </div>
          <div className="mt-4">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/users/${userInfo.username}`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
          
          {/* Add Publisher Request Button - only show if user is not already a publisher */}
          {userInfo.role !== "PUBLISHER" && userInfo.role !== "ADMIN" && userInfo.role !== "SUB_ADMIN" && (
            <div className="mt-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                onClick={() => router.push("/admin")}
              >
                <Users className="mr-2 h-4 w-4" />
                Become a Publisher
              </Button>
            </div>
          )}
        </DashboardCard>

        {/* Activity card */}
        <DashboardCard
          title="Your Activity"
          icon={<Users className="h-6 w-6" />}
        >
          <div className="space-y-2">
            <p>View your recent activity and engagement</p>
          </div>
          <div className="mt-4">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/users/${userInfo.username}/activity`)}
            >
              View Activity
            </Button>
          </div>
        </DashboardCard>

        {/* Settings card */}
        <DashboardCard
          title="Account Settings"
          icon={<Edit className="h-6 w-6" />}
        >
          <div className="space-y-2">
            <p>Manage your account settings and preferences</p>
          </div>
          <div className="mt-4">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/settings`)}
            >
              Manage Settings
            </Button>
          </div>
        </DashboardCard>

        {/* Sub-Admin specific cards */}
        {userInfo.role === "SUB_ADMIN" && (
          <>
            {/* Publisher Requests Card */}
            <DashboardCard
              title="Publisher Requests"
              icon={<ClipboardCheck className="h-6 w-6 text-green-600" />}
            >
              <div className="space-y-2">
                <p>Manage publisher requests from users</p>
                {pendingRequests > 0 && (
                  <div className="flex items-center mt-2">
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">
                      {pendingRequests} pending {pendingRequests === 1 ? 'request' : 'requests'}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full bg-green-50 text-green-600 hover:bg-green-100"
                  onClick={() => router.push(`/subadmins/publisher-requests`)}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  View Requests
                </Button>
              </div>
            </DashboardCard>

            {/* Content Approval Card */}
            <DashboardCard
              title="Content Approval"
              icon={<FileCheck className="h-6 w-6 text-blue-600" />}
            >
              <div className="space-y-2">
                <p>Review and approve content submitted by publishers</p>
              </div>
              <div className="mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                  onClick={() => router.push(`/subadmins/content-approval`)}
                >
                  <FileCheck className="mr-2 h-4 w-4" />
                  Review Content
                </Button>
              </div>
            </DashboardCard>
          </>
        )}
      </div>
    </div>
  )
}

