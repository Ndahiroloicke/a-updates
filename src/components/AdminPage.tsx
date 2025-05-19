"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
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
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoryStore } from "./categoryStore";

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

// Add this type definition at the top level
interface Notification {
  id: string;
  type: string;
  email: string;
  description: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  timestamp: string;
}

export default function AdminPage({ userInfo }: { userInfo: User }) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [requirements, setRequirements] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tech & AI");
  const { toast } = useToast();

  // Add state for notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "New Publisher Request",
      email: "james.wilson@example.com",
      description:
        "Tech blogger with focus on AI and machine learning. 8+ years of experience in software development.",
      category: "Tech & AI",
      status: "pending",
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    },
    {
      id: "2",
      type: "Enterprise Partnership",
      email: "corporate@techdigest.com",
      description:
        "Technology news website seeking enterprise partnership. 100k+ daily active users, requesting API access.",
      category: "Enterprise",
      status: "pending",
      timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    },
    {
      id: "3",
      type: "Educational Institution",
      email: "publications@edutech.edu",
      description:
        "Educational institution looking to publish research papers and academic content. Requesting bulk content management tools.",
      category: "Academic",
      status: "pending",
      timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    },
  ]);

  // Add function to scroll to notifications
  const scrollToNotifications = () => {
    document
      .getElementById("notifications-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // Add function to handle notification status updates
  const handleNotificationAction = (
    id: string,
    action: "approved" | "rejected",
  ) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, status: action } : notif,
      ),
    );
  };

  const pendingNotifications = notifications.filter(
    (n) => n.status === "pending",
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
    if (!email || !requirements) {
      toast({
        variant: "destructive",
        description: "Please fill in all fields",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create a new notification
      const newNotification: Notification = {
        id: (notifications.length + 1).toString(),
        type: "New Publisher Request",
        email: email,
        description: requirements,
        category: selectedCategory,
        status: "pending",
        timestamp: new Date().toISOString(),
      };

      // Add the new notification to the list
      setNotifications([newNotification, ...notifications]);

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
            <div className="mt-6 space-y-4 md:mt-8 md:space-y-6">
              <h2 className="mb-8 text-center text-2xl font-bold">
                Premium Publishing Features
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Basic Publisher Card */}
                <Card className="border-border bg-card text-black transition-shadow hover:shadow-xl dark:text-white">
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-xl font-semibold">
                      Basic Publisher
                    </h3>
                    <div className="mb-6 text-2xl font-bold">
                      $9.99<span className="text-sm font-normal">/month</span>
                    </div>
                    <ul className="mb-6 space-y-3">
                      <li className="flex items-center">
                        <Shield className="mr-2 h-5 w-5 text-green-500" />
                        <span>Basic content publishing</span>
                      </li>
                      <li className="flex items-center">
                        <Shield className="mr-2 h-5 w-5 text-green-500" />
                        <span>Standard analytics</span>
                      </li>
                      <li className="flex items-center">
                        <Shield className="mr-2 h-5 w-5 text-green-500" />
                        <span>Community engagement tools</span>
                      </li>
                    </ul>
                    <Button
                      className="w-full"
                      onClick={() =>
                        router.push("/publisher-registration?tier=basic")
                      }
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>

                {/* Pro Publisher Card */}
                <Card className="scale-105 transform border-primary bg-primary/5 text-black transition-shadow hover:shadow-xl dark:text-white">
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-xl font-semibold">
                      Pro Publisher
                    </h3>
                    <div className="mb-6 text-2xl font-bold">
                      $24.99<span className="text-sm font-normal">/month</span>
                    </div>
                    <ul className="mb-6 space-y-3">
                      <li className="flex items-center">
                        <Shield className="mr-2 h-5 w-5 text-green-500" />
                        <span>Advanced content publishing</span>
                      </li>
                      <li className="flex items-center">
                        <Shield className="mr-2 h-5 w-5 text-green-500" />
                        <span>Premium analytics dashboard</span>
                      </li>
                      <li className="flex items-center">
                        <Shield className="mr-2 h-5 w-5 text-green-500" />
                        <span>Corporate Media Hub access</span>
                      </li>
                      <li className="flex items-center">
                        <Shield className="mr-2 h-5 w-5 text-green-500" />
                        <span>Priority support</span>
                      </li>
                    </ul>
                    <Button
                      variant="default"
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={handlePayment}
                    >
                      Upgrade to Pro
                    </Button>
                  </CardContent>
                </Card>

                {/* Enterprise Publisher Card */}
                <Card className="border-border bg-card text-black transition-shadow hover:shadow-xl dark:text-white">
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-xl font-semibold">Enterprise</h3>
                    <div className="mb-6 text-2xl font-bold">Custom</div>
                    <ul className="mb-6 space-y-3">
                      <li className="flex items-center">
                        <Shield className="mr-2 h-5 w-5 text-green-500" />
                        <span>Custom publishing solutions</span>
                      </li>
                      <li className="flex items-center">
                        <Shield className="mr-2 h-5 w-5 text-green-500" />
                        <span>Dedicated account manager</span>
                      </li>
                      <li className="flex items-center">
                        <Shield className="mr-2 h-5 w-5 text-green-500" />
                        <span>API access</span>
                      </li>
                      <li className="flex items-center">
                        <Shield className="mr-2 h-5 w-5 text-green-500" />
                        <span>Custom integrations</span>
                      </li>
                    </ul>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        router.push("/publisher-registration?tier=enterprise")
                      }
                    >
                      Contact Sales
                    </Button>
                  </CardContent>
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
                  {notifications
                    .sort(
                      (a, b) =>
                        new Date(b.timestamp).getTime() -
                        new Date(a.timestamp).getTime(),
                    )
                    .map((notification) => (
                      <Card
                        key={notification.id}
                        className={`group overflow-hidden rounded-lg border bg-white shadow-sm transition-all ${
                          notification.status === "pending"
                            ? "border-gray-100 hover:border-green-100 hover:shadow-md"
                            : notification.status === "approved"
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
                                  {notification.type}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {notification.email}
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
                            <p>{notification.description}</p>
                          </div>
                          <div className="flex items-center justify-end space-x-2">
                            {notification.status === "pending" ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    handleNotificationAction(
                                      notification.id,
                                      "approved",
                                    );
                                    toast({
                                      title: "Request Approved",
                                      description: `${notification.type} has been approved successfully.`,
                                      className:
                                        "bg-green-50 text-green-600 border-green-200",
                                    });
                                  }}
                                  className="bg-green-50 text-green-600 hover:bg-green-100"
                                >
                                  <Check className="mr-1 h-4 w-4" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    handleNotificationAction(
                                      notification.id,
                                      "rejected",
                                    );
                                    toast({
                                      title: "Request Rejected",
                                      description: `${notification.type} has been rejected.`,
                                      className:
                                        "bg-red-50 text-red-600 border-red-200",
                                    });
                                  }}
                                  className="bg-red-50 text-red-600 hover:bg-red-100"
                                >
                                  <X className="mr-1 h-4 w-4" />
                                  Reject
                                </Button>
                              </>
                            ) : (
                              <div
                                className={`rounded-full px-4 py-1 text-sm ${
                                  notification.status === "approved"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {notification.status === "approved" ? (
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
                    ))}
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
