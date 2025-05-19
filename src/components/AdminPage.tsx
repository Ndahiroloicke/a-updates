"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Settings,
  Users,
  MessageSquare,
  BookOpen,
  History,
  Loader2,
  Send,
  ExternalLink,
  Grid2X2,
  Home,
  Bookmark,
  FileText,
  UserCheck,
  UserX,
  Shield,
  Package,
  Edit,
  Info,
  BarChart,
  DollarSign,
  Globe,
  Flag,
  Layout,
  User,
  UserPlus,
  Columns,
  AlertTriangle,
  Ban,
  Lock,
  Plus,
  Pencil,
  Check,
  Bell,
  X,
  Building2,
  GraduationCap,
  Trash2,
  PenSquare,
  Clock,
  RefreshCw,
  AlertCircle,
  BarChart2,
  Building,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoryStore } from "./categoryStore";
import { PublisherRequest } from "@prisma/client";

// Update the User type to match your database schema
interface User {
  id: string;
  username: string;
  displayName: string;
  email?: string | null;
  avatarUrl?: string | null;
  role: string; // Changed from "USER" | "PUBLISHER" | "ADMIN" to string
  hasPaid?: boolean;
  googleId?: string;
  // Add other fields as needed
}

// Update the Notification interface to match our API response
interface Notification {
  id: string;
  userId: string;
  email: string;
  message: string; // Changed from description
  category: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: Date; // Changed from timestamp
  user?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    email?: string;
  };
}

export default function AdminPage({ userInfo }: { userInfo: User }) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [requirements, setRequirements] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tech & AI");
  const { toast } = useToast();

  // Add state for publisher request notifications from DB
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  
  // Add state for user's publisher request status
  const [publisherRequestStatus, setPublisherRequestStatus] = useState<string | null>(null);
  const [checkingRequestStatus, setCheckingRequestStatus] = useState(false);

  // Function to check publisher request status - only use this when needed
  const checkPublisherRequestStatus = async () => {
    try {
      setCheckingRequestStatus(true);
      
      // If user is already a publisher, no need to check for requests
      if (userInfo.role === "PUBLISHER") {
        console.log("User is already a publisher");
        setPublisherRequestStatus("ALREADY_PUBLISHER");
        return;
      }
      
      console.log("Checking publisher request status...");
      
      const response = await fetch("/api/publisher-request");
      console.log("Status check response:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error checking publisher status:", errorData);
        throw new Error(errorData.error || errorData.details || "Failed to check publisher status");
      }
      
      const requests = await response.json();
      console.log("Publisher requests data:", requests);
      
      if (Array.isArray(requests) && requests.length > 0) {
        // Get the most recent request
        const latestRequest = requests[0];
        console.log("Latest request:", latestRequest);
        setPublisherRequestStatus(latestRequest.status);
      } else {
        console.log("No existing publisher requests found");
        setPublisherRequestStatus(null);
      }
    } catch (error) {
      console.error("Error checking publisher status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to check publisher status"
      });
      setPublisherRequestStatus(null);
    } finally {
      setCheckingRequestStatus(false);
    }
  };

  // Fetch publisher requests on component mount (for admin only)
  useEffect(() => {
    if (userInfo.role === "ADMIN") {
      fetchPublisherRequests();
    } else if (userInfo.role === "USER") {
      // For regular users, only check if they have a rejected request when needed
      // Instead of checking on component mount, we'll let them check manually
      setPublisherRequestStatus(null);
    }
  }, [userInfo.role]);

  // Function to fetch publisher requests
  const fetchPublisherRequests = async () => {
    try {
      setLoadingNotifications(true);
      console.log("Fetching publisher requests...");
      
      const response = await fetch("/api/publisher-request");
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response data:", errorData);
        throw new Error(errorData.error || errorData.details || "Failed to fetch publisher requests");
      }

      const data = await response.json();
      console.log("Received publisher requests:", data);
      
      if (!Array.isArray(data)) {
        console.error("Expected array of publisher requests, got:", typeof data);
        throw new Error("Invalid response format");
      }

      setNotifications(data);
    } catch (error) {
      console.error("Error fetching publisher requests:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load publisher requests"
      });
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Function to scroll to notifications
  const scrollToNotifications = () => {
    document
      .getElementById("notifications-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // Function to handle publisher request approval/rejection
  const handleNotificationAction = async (
    requestId: string,
    action: "APPROVED" | "REJECTED",
    notificationMessage: string = action === "APPROVED" 
      ? "Your publisher request has been approved! You can now create and publish content."
      : "Your publisher request has been rejected."
  ) => {
    try {
      setIsLoading(true);
      console.log(`Processing ${action} for request ${requestId}`);

      const response = await fetch(`/api/publisher-request/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: action,
          message: notificationMessage
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response data:", errorData);
        throw new Error(errorData.error || errorData.details || `Failed to ${action.toLowerCase()} request`);
      }

      const updatedRequest = await response.json();
      console.log("Request updated:", updatedRequest);

      // Update the local state
    setNotifications(
      notifications.map((notif) =>
          notif.id === requestId ? { ...notif, status: action } : notif
        )
      );

      toast({
        title: `Request ${action === "APPROVED" ? "Approved" : "Rejected"}`,
        description: `Publisher request has been ${action === "APPROVED" ? "approved" : "rejected"} successfully.`,
        className: action === "APPROVED" 
          ? "bg-green-50 text-green-600 border-green-200"
          : "bg-red-50 text-red-600 border-red-200",
      });
      
      // Refresh the list after a short delay
      setTimeout(fetchPublisherRequests, 1000);
    } catch (error) {
      console.error(`Error ${action.toLowerCase()} request:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${action.toLowerCase()} publisher request. Please try again.`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pendingNotifications = notifications.filter(
    (n) => n.status === "PENDING"
  ).length;

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userInfo.id }), // Pass the user's ID
      });

      if (!response.ok) {
        throw new Error("Payment initiation failed");
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
        return;
      }

      toast({
        variant: "destructive",
        description: "Failed to initiate payment. Please try again.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "An error occurred. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!requirements) {
      toast({
        variant: "destructive",
        description: "Please fill in the requirements field",
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/publisher-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: selectedCategory,
          requirements,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if there's a user-friendly message
        if (data.message) {
          toast({
            title: "Note",
            description: data.message,
            className: "bg-blue-50 text-blue-700 border-blue-200",
          });
        } else {
          throw new Error(data.error || "Failed to submit request");
        }
        return;
      }

      toast({
        title: "Success!",
        description:
          "Your publisher request has been submitted. Admin will review it shortly.",
        className: "bg-green-50 text-green-600 border-green-200",
      });

      // Reset form
      setEmail("");
      setRequirements("");
      setSelectedCategory("Tech & AI");
      
      // Update the status immediately to PENDING to show the pending message
      // No need to make another API call
      if (data && data.id) {
        setPublisherRequestStatus("PENDING");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to submit request",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Category management state (from Zustand store)
  const {
    categories,
    addCategory,
    editCategory,
    deleteCategory,
    addSubLink,
    editSubLink,
    deleteSubLink,
  } = useCategoryStore();
  const [newCategory, setNewCategory] = useState("");
  const [editingCategoryIdx, setEditingCategoryIdx] = useState<number | null>(null);
  const [editCategoryValue, setEditCategoryValue] = useState("");
  const [newSubLink, setNewSubLink] = useState("");
  const [editingSubLinkIdx, setEditingSubLinkIdx] = useState<{cat: number, sub: number} | null>(null);
  const [editSubLinkValue, setEditSubLinkValue] = useState("");

  // Add category
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    addCategory(newCategory.trim());
    setNewCategory("");
  };
  // Edit category
  const handleEditCategory = (idx: number) => {
    setEditingCategoryIdx(idx);
    setEditCategoryValue(categories[idx].label);
  };
  const handleSaveEditCategory = (idx: number) => {
    if (!editCategoryValue.trim()) return;
    editCategory(idx, editCategoryValue.trim());
    setEditingCategoryIdx(null);
    setEditCategoryValue("");
  };
  // Delete category
  const handleDeleteCategory = (idx: number) => {
    deleteCategory(idx);
  };
  // Add sub-link
  const handleAddSubLink = (catIdx: number) => {
    if (!newSubLink.trim()) return;
    addSubLink(catIdx, newSubLink.trim());
    setNewSubLink("");
  };
  // Edit sub-link
  const handleEditSubLink = (catIdx: number, subIdx: number) => {
    setEditingSubLinkIdx({cat: catIdx, sub: subIdx});
    setEditSubLinkValue(categories[catIdx].subLinks[subIdx].label);
  };
  const handleSaveEditSubLink = (catIdx: number, subIdx: number) => {
    if (!editSubLinkValue.trim()) return;
    editSubLink(catIdx, subIdx, editSubLinkValue.trim());
    setEditingSubLinkIdx(null);
    setEditSubLinkValue("");
  };
  // Delete sub-link
  const handleDeleteSubLink = (catIdx: number, subIdx: number) => {
    deleteSubLink(catIdx, subIdx);
  };

  // Add handlePublisherRequestRefresh to pass down to the form
  const handlePublisherRequestRefresh = () => {
    if (typeof window !== 'undefined') {
      // Redirect to admin page to refresh
      window.location.href = '/admin';
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto space-y-6 px-4 py-6 pb-20 md:space-y-9 md:py-8 md:pb-8">
        <div className="mt-6 flex items-center justify-between px-4 sm:px-8 md:mt-10 md:px-12">
          <header className="w-fit border-b-2 border-primary py-3 text-xl font-bold sm:text-2xl md:py-6 md:text-3xl">
            <h1>
              Welcome: <span className="text-primary">{userInfo.username}</span>
            </h1>
          </header>
          {userInfo.role === "ADMIN" && pendingNotifications > 0 && (
            <button
              onClick={scrollToNotifications}
              className="relative flex items-center rounded-full bg-white p-2 shadow-lg transition-all hover:shadow-xl"
            >
              <Bell className="h-6 w-6 text-green-600" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {pendingNotifications}
              </span>
            </button>
          )}
        </div>

        {/* Admin Links Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Left Column */}
          <Card className="border-border bg-card text-black transition-shadow hover:shadow-lg dark:text-white">
            <CardContent className="space-y-3 pt-4 sm:space-y-4 sm:pt-6">
              <Button
                asChild
                variant="outline"
                className="w-full justify-start px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground md:px-4 md:py-3 md:text-base"
              >
                <Link href={`/users/${userInfo?.username}`}>
                  <Users className="mr-2 h-4 w-4" />
                  My Profile
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground md:px-4 md:py-3 md:text-base"
              >
                <Link href={`/users/${userInfo?.username}/followers`}>
                  <Users className="mr-2 h-4 w-4" />
                  Followers
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground md:px-4 md:py-3 md:text-base"
              >
                <Link href={`/users/${userInfo?.username}/following`}>
                  <Users className="mr-2 h-4 w-4" />
                  Following
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground md:px-4 md:py-3 md:text-base"
              >
                <Link href="/push-wall">
                  <Grid2X2 className="mr-2 h-4 w-4" />
                  Push wall
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground md:px-4 md:py-3 md:text-base"
              >
                <Link href="/forum-poll">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Go to Forum
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Right Column */}
          <Card className="border-border bg-card text-black transition-shadow hover:shadow-lg dark:text-white">
            <CardContent className="space-y-3 pt-4 sm:space-y-4 sm:pt-6">
              <Button
                asChild
                variant="outline"
                className="w-full justify-start px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground md:px-4 md:py-3 md:text-base"
              >
                <Link href="/messages">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message[Inbox]
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground md:px-4 md:py-3 md:text-base"
              >
                <Link href="/my-posts">
                  <History className="mr-2 h-4 w-4" />
                  Post history
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground md:px-4 md:py-3 md:text-base"
              >
                <Link href="/posts/create">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Post a new story
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground md:px-4 md:py-3 md:text-base"
              >
                <Link href="/safari">
                  <BookOpen className="mr-2 h-4 w-4" />
                  My Safari
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground md:px-4 md:py-3 md:text-base"
              >
                <Link href="/email-all">
                  <Send className="mr-2 h-4 w-4" />
                  Send Email to all
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        {userInfo.role !== "ADMIN" && (
          <>
            {/* Only show publisher content for non-admin users */}
            {userInfo.role === "PUBLISHER" ? (
              // For publishers, show a success message with links to create content
              <div className="mt-6 space-y-4 md:mt-8 md:space-y-6">
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-6 text-center">
                    <Check className="h-12 w-12 mx-auto text-green-600 mb-4" />
                    <h2 className="text-2xl font-bold text-green-700 mb-2">You are a Publisher!</h2>
                    <p className="text-green-600 mb-2">
                      Your account has publisher status. You can now create and publish content.
                    </p>
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        className="border-green-200 text-green-600 hover:bg-green-100"
                        onClick={() => window.location.href = "/posts/create"}
                      >
                        <PenSquare className="mr-2 h-4 w-4" />
                        Create New Content
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : userInfo.role === "USER" && (
              // For regular users, show the appropriate content
              <>
                {checkingRequestStatus ? (
                  <div className="mt-6 space-y-4 md:mt-8 md:space-y-6 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : publisherRequestStatus === "PENDING" ? (
                  <div className="mt-6 space-y-4 md:mt-8 md:space-y-6">
                    <Card className="border-amber-200 bg-amber-50">
                      <CardContent className="p-6 text-center">
                        <Loader2 className="h-12 w-12 mx-auto text-amber-600 mb-4 animate-spin" />
                        <h2 className="text-2xl font-bold text-amber-700 mb-2">Publisher Request Pending</h2>
                        <p className="text-amber-600 mb-2">
                          Your request to become a publisher is currently being reviewed by our administrators.
                          We'll notify you once a decision has been made.
                        </p>
                        <div className="flex items-center justify-center mt-4 text-sm text-amber-700">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Usually takes 1-2 business days</span>
                        </div>
                        
                        <Button
                          onClick={checkPublisherRequestStatus}
                          variant="outline"
                          className="mt-4 border-amber-200 text-amber-600 hover:bg-amber-100"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Check Status
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                ) : publisherRequestStatus === "APPROVED" ? (
                  <div className="mt-6 space-y-4 md:mt-8 md:space-y-6">
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-6 text-center">
                        <Check className="h-12 w-12 mx-auto text-green-600 mb-4" />
                        <h2 className="text-2xl font-bold text-green-700 mb-2">Your Request Has Been Approved!</h2>
                        <p className="text-green-600 mb-2">
                          Congratulations! Your publisher request has been approved. Please refresh the page to update your role.
                        </p>
                        <div className="mt-4">
                          <Button
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => window.location.reload()}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh Page
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : publisherRequestStatus === "REJECTED" ? (
                  <div className="mt-6 space-y-4 md:mt-8 md:space-y-6">
                    <Card className="border-red-200 bg-red-50">
                      <CardContent className="p-6 text-center">
                        <AlertCircle className="h-12 w-12 mx-auto text-red-600 mb-4" />
                        <h2 className="text-2xl font-bold text-red-700 mb-2">Previous Request Wasn't Approved</h2>
                        <p className="text-red-600 mb-4">
                          Your previous publisher request was not approved. You may submit a new request
                          with additional information to be reconsidered.
                        </p>
                        <Button 
                          onClick={() => setPublisherRequestStatus(null)}
                          className="bg-white text-red-600 border border-red-200 hover:bg-red-50"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Submit a New Request
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  // Default: Show the publisher request form for regular users
                  <PublisherRequestForm
                    userInfo={userInfo}
                    email={email}
                    setEmail={setEmail}
                    requirements={requirements}
                    setRequirements={setRequirements}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    isLoading={isLoading}
                    handleSubmit={handleSubmit}
                    onRequestRefresh={checkPublisherRequestStatus}
                  />
                )}
              </>
            )}

            <div className="mt-6 space-y-4 md:mt-8 md:space-y-6">
              <h2 className="mb-8 text-center text-2xl font-bold">
                Become an Advertiser
              </h2>
              <div className="mx-auto max-w-2xl">
                <Card className="border-primary bg-primary/5 text-black transition-shadow hover:shadow-xl dark:text-white">
                  <CardContent className="p-8">
                    <h3 className="mb-6 text-center text-2xl font-semibold">
                      Advertise With Us
                    </h3>
                    <div className="mb-8 text-center">
                      <p className="text-lg text-muted-foreground">
                        Reach your target audience effectively
                      </p>
                    </div>
                    <ul className="mb-8 space-y-4">
                      <li className="flex items-center">
                        <Shield className="mr-3 h-6 w-6 text-primary" />
                        <span className="text-lg">
                          Targeted ad placement across our platform
                        </span>
                      </li>
                      <li className="flex items-center">
                        <BarChart className="mr-3 h-6 w-6 text-primary" />
                        <span className="text-lg">
                          Comprehensive analytics and reporting
                        </span>
                      </li>
                      <li className="flex items-center">
                        <Globe className="mr-3 h-6 w-6 text-primary" />
                        <span className="text-lg">
                          Wide audience reach and engagement
                        </span>
                      </li>
                    </ul>
                    <Button
                      className="w-full py-6 text-lg"
                      variant="default"
                      onClick={() => router.push("/advertiser-registration")}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {/* Admin Only Section */}
        {userInfo.role === "ADMIN" && (
          <div className="space-y-6">
            {/* Navigation Links */}
            <Card className="border-border bg-card text-black dark:text-white">
              <CardContent className="space-y-3 pt-4">
                <h2 className="mb-4 text-lg font-semibold">
                  Website Navigation
                </h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/home">
                      <Home className="mr-2 h-4 w-4" />
                      Home
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/country">
                      <Globe className="mr-2 h-4 w-4" />
                      Country
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/post">
                      <FileText className="mr-2 h-4 w-4" />
                      Post
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/category">
                      <Layout className="mr-2 h-4 w-4" />
                      Category
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* User Management */}
            <Card className="border-border bg-card text-black dark:text-white">
              <CardContent className="space-y-3 pt-4">
                <h2 className="mb-4 text-lg font-semibold text-green-600">
                  User Management
                </h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/users">
                      <Users className="mr-2 h-4 w-4" />
                      Users
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/subadmins">
                      <Shield className="mr-2 h-4 w-4 text-green-600" />
                      Sub-Admins
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/followers">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Followers
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/following">
                      <UserCheck className="mr-2 h-4 w-4" />
                      Following
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/columns">
                      <Columns className="mr-2 h-4 w-4" />
                      Columns
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Content Management */}
            <Card className="border-border bg-card text-black dark:text-white">
              <CardContent className="space-y-3 pt-4">
                <h2 className="mb-4 text-lg font-semibold">
                  Content Management
                </h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/post-news">
                      <FileText className="mr-2 h-4 w-4" />
                      Post News
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/forum-poll">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Forum & Poll
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/abuse-warned">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Abuse/Warned
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* User Actions */}
            <Card className="border-border bg-card text-black dark:text-white">
              <CardContent className="space-y-3 pt-4">
                <h2 className="mb-4 text-lg font-semibold">User Actions</h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/suspended">
                      <Ban className="mr-2 h-4 w-4" />
                      Suspended
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/banned">
                      <UserX className="mr-2 h-4 w-4" />
                      Banned
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/blocked-ip">
                      <Lock className="mr-2 h-4 w-4" />
                      Blocked/Block IP
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notifications Section */}
            <Card id="notifications-section" className="mt-8 bg-white">
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <h2 className="flex items-center text-xl font-semibold text-green-600">
                    <Bell className="mr-2 h-5 w-5" />
                    Publisher Notifications
                  </h2>
                  {pendingNotifications > 0 && (
                    <div className="rounded-full bg-green-50 px-3 py-1 text-sm text-green-600">
                      {pendingNotifications} New Requests
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {loadingNotifications ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No publisher requests found.
                    </div>
                  ) : (
                    notifications
                    .sort(
                      (a, b) =>
                          new Date(b.requestedAt).getTime() -
                          new Date(a.requestedAt).getTime(),
                    )
                    .map((notification) => (
                      <Card
                        key={notification.id}
                        className={`group overflow-hidden rounded-lg border bg-white shadow-sm transition-all ${
                            notification.status === "PENDING"
                            ? "border-gray-100 hover:border-green-100 hover:shadow-md"
                              : notification.status === "APPROVED"
                              ? "border-green-100 bg-green-50"
                              : "border-red-100 bg-red-50"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="mb-4 flex items-center justify-between border-b border-gray-50 pb-2">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`rounded-full p-2 ${
                                  notification.category === "Tech & AI"
                                    ? "bg-blue-50"
                                    : notification.category === "Enterprise"
                                      ? "bg-amber-50"
                                      : "bg-indigo-50"
                                }`}
                              >
                                {notification.category === "Tech & AI" ? (
                                  <UserPlus className="h-5 w-5 text-blue-500" />
                                ) : notification.category === "Enterprise" ? (
                                  <Building2 className="h-5 w-5 text-amber-500" />
                                ) : (
                                  <GraduationCap className="h-5 w-5 text-indigo-500" />
                                )}
                              </div>
                              <div>
                                <h3
                                  className={`font-medium ${
                                    notification.category === "Tech & AI"
                                      ? "text-blue-600"
                                      : notification.category === "Enterprise"
                                        ? "text-amber-600"
                                        : "text-indigo-600"
                                  }`}
                                >
                                    Publisher Request
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {notification.user?.displayName || notification.email}
                                </p>
                              </div>
                            </div>
                            <div
                              className={`rounded-full px-3 py-1 text-sm ${
                                notification.category === "Tech & AI"
                                  ? "bg-blue-50 text-blue-600"
                                  : notification.category === "Enterprise"
                                    ? "bg-amber-50 text-amber-600"
                                    : "bg-indigo-50 text-indigo-600"
                              }`}
                            >
                              {notification.category}
                            </div>
                          </div>
                          <div className="mb-4 text-sm text-gray-600">
                              <p>{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Requested: {new Date(notification.requestedAt).toLocaleString()}
                              </p>
                          </div>
                          <div className="flex items-center justify-end space-x-2">
                              {notification.status === "PENDING" ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    handleNotificationAction(
                                      notification.id,
                                        "APPROVED"
                                      );
                                  }}
                                  className="bg-green-50 text-green-600 hover:bg-green-100"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                    ) : (
                                  <Check className="mr-1 h-4 w-4" />
                                    )}
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    handleNotificationAction(
                                      notification.id,
                                        "REJECTED"
                                      );
                                  }}
                                  className="bg-red-50 text-red-600 hover:bg-red-100"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                    ) : (
                                  <X className="mr-1 h-4 w-4" />
                                    )}
                                  Reject
                                </Button>
                              </>
                            ) : (
                              <div
                                className={`rounded-full px-4 py-1 text-sm ${
                                    notification.status === "APPROVED"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                  {notification.status === "APPROVED" ? (
                                  <span className="flex items-center">
                                    <Check className="mr-1 h-4 w-4" />
                                    Approved
                                  </span>
                                ) : (
                                  <span className="flex items-center">
                                    <X className="mr-1 h-4 w-4" />
                                    Rejected
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Financial Management */}
            <Card className="border-border bg-card text-black dark:text-white">
              <CardContent className="space-y-3 pt-4">
                <h2 className="mb-4 text-lg font-semibold">
                  Financial Management
                </h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/tax">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Tax
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/send-email-all">
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email to All
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/create-invoice">
                      <FileText className="mr-2 h-4 w-4" />
                      Create Invoice & Bill
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/edit-advertisement">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Advertisement
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/publisher-content">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Publisher Content
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/statistics">
                      <BarChart className="mr-2 h-4 w-4" />
                      Advertiser & Publisher Statistics
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Package Management */}
            <Card className="border-border bg-card text-black dark:text-white">
              <CardContent className="space-y-3 pt-4">
                <h2 className="mb-4 text-lg font-semibold">
                  Package Management
                </h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/create-package">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Package
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/edit-package">
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Package
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/package-item-type">
                      <Package className="mr-2 h-4 w-4" />
                      Package Item Type
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Category Management */}
            <Card className="border-border bg-card text-black dark:text-white">
              <CardContent className="space-y-3 pt-4">
                <h2 className="mb-4 text-lg font-semibold text-blue-600 flex items-center gap-2">
                  <Grid2X2 className="h-5 w-5" /> Category Management
                </h2>
                {/* Add Category */}
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="New category name"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-1/2"
                  />
                  <Button onClick={handleAddCategory} variant="default">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                {/* List Categories */}
                <div className="space-y-4">
                  {categories.map((cat, catIdx) => (
                    <div key={catIdx} className="border rounded p-3 bg-muted">
                      <div className="flex items-center gap-2 mb-2">
                        {editingCategoryIdx === catIdx ? (
                          <>
                            <Input
                              value={editCategoryValue}
                              onChange={e => setEditCategoryValue(e.target.value)}
                              className="w-1/2"
                            />
                            <Button size="sm" onClick={() => handleSaveEditCategory(catIdx)} variant="default">
                              Save
                            </Button>
                            <Button size="sm" onClick={() => setEditingCategoryIdx(null)} variant="outline">
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className="font-semibold text-base">{cat.label}</span>
                            <Button size="icon" variant="ghost" onClick={() => handleEditCategory(catIdx)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDeleteCategory(catIdx)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </div>
                      {/* Sub-links */}
                      <div className="ml-4">
                        <div className="flex gap-2 mb-2">
                          <Input
                            placeholder="New sub-link name"
                            value={editingSubLinkIdx && editingSubLinkIdx.cat === catIdx ? editSubLinkValue : newSubLink}
                            onChange={e => {
                              if (editingSubLinkIdx && editingSubLinkIdx.cat === catIdx) setEditSubLinkValue(e.target.value);
                              else setNewSubLink(e.target.value);
                            }}
                            className="w-1/3"
                          />
                          {editingSubLinkIdx && editingSubLinkIdx.cat === catIdx ? (
                            <>
                              <Button size="sm" onClick={() => handleSaveEditSubLink(catIdx, editingSubLinkIdx.sub)} variant="default">
                                Save
                              </Button>
                              <Button size="sm" onClick={() => setEditingSubLinkIdx(null)} variant="outline">
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" onClick={() => handleAddSubLink(catIdx)} variant="default">
                              <Plus className="h-4 w-4 mr-1" /> Add
                            </Button>
                          )}
                        </div>
                        <ul className="space-y-1">
                          {cat.subLinks.map((sub, subIdx) => (
                            <li key={subIdx} className="flex items-center gap-2">
                              {editingSubLinkIdx && editingSubLinkIdx.cat === catIdx && editingSubLinkIdx.sub === subIdx ? null : (
                                <span>{sub.label}</span>
                              )}
                              <Button size="icon" variant="ghost" onClick={() => handleEditSubLink(catIdx, subIdx)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => handleDeleteSubLink(catIdx, subIdx)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Publisher and Advertiser Section */}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-background md:hidden">
        <div className="grid grid-cols-5 gap-1 p-2">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="flex flex-col items-center justify-center p-1"
          >
            <Link href="/stories">
              <Home className="h-5 w-5" />
              <span className="mt-1 text-[10px]">Home</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="flex flex-col items-center justify-center p-1"
          >
            <Link href="/messages">
              <MessageSquare className="h-5 w-5" />
              <span className="mt-1 text-[10px]">Messages</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="flex flex-col items-center justify-center p-1"
          >
            <Link href="/posts/create">
              <Send className="h-5 w-5" />
              <span className="mt-1 text-[10px]">Post</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="flex flex-col items-center justify-center p-1"
          >
            <Link href="/safari">
              <Bookmark className="h-5 w-5" />
              <span className="mt-1 text-[10px]">Safari</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="flex flex-col items-center justify-center p-1"
          >
            <Link href={`/users/${userInfo?.username}`}>
              <Users className="h-5 w-5" />
              <span className="mt-1 text-[10px]">Profile</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// New component for Publisher Request Form with status display
interface PublisherRequestFormProps {
  userInfo: User;
  email: string;
  setEmail: (value: string) => void;
  requirements: string;
  setRequirements: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  isLoading: boolean;
  handleSubmit: () => void;
  onRequestRefresh: () => void;
}

function PublisherRequestForm({ 
  userInfo, 
  email, 
  setEmail, 
  requirements, 
  setRequirements,
  selectedCategory,
  setSelectedCategory,
  isLoading,
  handleSubmit,
  onRequestRefresh
}: PublisherRequestFormProps) {
  // Show the form for new requests (simplify since parent component handles status)
  return (
    <div className="mt-6 space-y-4 md:mt-8 md:space-y-6">
      <h2 className="mb-8 text-center text-2xl font-bold">
        Premium Publishing Features
      </h2>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-10">
        {/* Basic Publisher */}
        <Card className="bg-card border-border text-card-foreground">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-500" />
              Basic Publisher
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Create and publish articles
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Include media attachments
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Basic analytics
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Select Basic
            </Button>
            <p className="text-sm text-muted-foreground mt-2">Perfect for individuals</p>
          </CardFooter>
        </Card>
        
        {/* Professional Publisher */}
        <Card className="bg-card border-border text-card-foreground">
          <CardHeader>
            <div className="rounded-full bg-green-100 text-green-700 text-xs px-2 py-1 font-medium w-fit mb-2">
              Recommended
            </div>
            <CardTitle className="flex items-center">
              <BarChart2 className="mr-2 h-5 w-5 text-green-500" />
              Professional Publisher
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                All Basic features, plus:
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Advanced analytics
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Scheduled publishing
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Priority support
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="default" className="w-full">
              Select Professional
            </Button>
            <p className="text-sm text-muted-foreground mt-2">Great for professionals</p>
          </CardFooter>
        </Card>
        
        {/* Enterprise Publisher */}
        <Card className="bg-card border-border text-card-foreground">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5 text-violet-500" />
              Enterprise Publisher
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                All Professional features, plus:
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Custom branding
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Team collaboration
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                API access
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Select Enterprise
            </Button>
            <p className="text-sm text-muted-foreground mt-2">For organizations</p>
          </CardFooter>
        </Card>
      </div>

      {/* Contact Form */}
      <div className="mx-auto mt-8 max-w-2xl space-y-4">
        <div>
          <Label htmlFor="email">Contact Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            className="w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tech & AI">Tech & AI</SelectItem>
              <SelectItem value="Enterprise">Enterprise</SelectItem>
              <SelectItem value="Academic">Academic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="requirements">Additional Requirements</Label>
          <Textarea
            id="requirements"
            placeholder="Describe your background, expertise, and specific requirements"
            className="h-32 w-full"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
          />
        </div>

        <Button
          className="w-full md:w-auto"
          size="lg"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </div>
          ) : (
            "Submit Request"
          )}
        </Button>
      </div>
    </div>
  );
}
