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
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

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

export default function AdminPage({ userInfo }: { userInfo: User }) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [requirements, setRequirements] = useState("");
  const { toast } = useToast();

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

      const response = await fetch("/api/publisher-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userInfo.id,
          email: email,
          message: requirements,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit request");
      }

      toast({
        title: "Success!",
        description: "Your publisher request has been submitted.",
      });

      // Reset form
      setEmail("");
      setRequirements("");
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

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto space-y-6 px-4 py-6 pb-20 md:space-y-9 md:py-8 md:pb-8">
        <div className="mt-6 flex items-center justify-between px-4 sm:px-8 md:mt-10 md:px-12">
          <header className="w-fit border-b-2 border-primary py-3 text-xl font-bold sm:text-2xl md:py-6 md:text-3xl">
            <h1>
              Welcome: <span className="text-primary">{userInfo.username}</span>
            </h1>
          </header>
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
                  <Label htmlFor="requirements">Additional Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Describe any specific requirements or questions"
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
                <h2 className="mb-4 text-lg font-semibold">User Management</h2>
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
            <Card className="border-border bg-card text-black dark:text-white">
              <CardContent className="space-y-3 pt-4">
                <h2 className="mb-4 text-lg font-semibold">
                  Publisher Notifications
                </h2>
                <div className="space-y-4">
                  {/* Notification Cards */}
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">New Publisher Request</h3>
                          <p className="text-sm text-muted-foreground">
                            john.doe@example.com
                          </p>
                        </div>
                        <div className="space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-500/10 text-red-500 hover:bg-red-500/20"
                          >
                            <Ban className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm">
                        <p className="mb-1 font-medium">
                          Additional Requirements:
                        </p>
                        <p className="text-muted-foreground">
                          Looking to publish educational content. Have 5 years
                          of experience in content creation.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">
                            Publisher Upgrade Request
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            sarah.smith@example.com
                          </p>
                        </div>
                        <div className="space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-500/10 text-red-500 hover:bg-red-500/20"
                          >
                            <Ban className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm">
                        <p className="mb-1 font-medium">
                          Additional Requirements:
                        </p>
                        <p className="text-muted-foreground">
                          Requesting upgrade to Pro Publisher. Currently have
                          10k+ monthly readers.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
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
