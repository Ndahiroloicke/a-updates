"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Mail,
  Settings,
  Users,
  MessageSquare,
  BookOpen,
  History,
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
  Pencil
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

// Update the User type to match your database schema
interface User {
  id: string
  username: string
  displayName: string
  email?: string | null
  avatarUrl?: string | null
  role: string  // Changed from "USER" | "PUBLISHER" | "ADMIN" to string
  hasPaid?: boolean
  googleId?: string
  // Add other fields as needed
}

export default function AdminPage({ userInfo }: { userInfo: User }) {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false);
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
        throw new Error('Payment initiation failed');
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

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto space-y-6 md:space-y-9 px-4 py-6 md:py-8 pb-20 md:pb-8">
        <div className="flex justify-between items-center px-4 sm:px-8 md:px-12 mt-6 md:mt-10">
          <header className="border-b-2 border-primary w-fit text-xl sm:text-2xl md:text-3xl font-bold py-3 md:py-6">
            <h1>
              Welcome: <span className="text-primary">{userInfo.username}</span>
            </h1>
          </header>
        </div>

        {/* Admin Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <Card className="bg-card dark:text-white text-black border-border hover:shadow-lg transition-shadow">
            <CardContent className="space-y-3 sm:space-y-4 pt-4 sm:pt-6">
              <Button
                asChild
                variant="outline"
                className="w-full justify-start text-sm md:text-base py-2 px-3 md:py-3 md:px-4 hover:bg-accent hover:text-accent-foreground"
              >
                <Link href={`/users/${userInfo?.username}`}>
                  <Users className="w-4 h-4 mr-2" />
                  My Profile
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start text-sm md:text-base py-2 px-3 md:py-3 md:px-4 hover:bg-accent hover:text-accent-foreground"
              >
                <Link href={`/users/${userInfo?.username}/followers`}>
                  <Users className="w-4 h-4 mr-2" />
                  Followers
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start text-sm md:text-base py-2 px-3 md:py-3 md:px-4 hover:bg-accent hover:text-accent-foreground"
              >
                <Link href={`/users/${userInfo?.username}/following`}>
                  <Users className="w-4 h-4 mr-2" />
                  Following
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start text-sm md:text-base py-2 px-3 md:py-3 md:px-4 hover:bg-accent hover:text-accent-foreground"
              >
                <Link href="/push-wall">
                  <Grid2X2 className="w-4 h-4 mr-2" />
                  Push wall
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start text-sm md:text-base py-2 px-3 md:py-3 md:px-4 hover:bg-accent hover:text-accent-foreground"
              >
                <Link href="/forum-poll">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Go to Forum
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Right Column */}
          <Card className="bg-card dark:text-white text-black border-border hover:shadow-lg transition-shadow">
            <CardContent className="space-y-3 sm:space-y-4 pt-4 sm:pt-6">
              <Button
                asChild
                variant="outline"
                className="w-full justify-start text-sm md:text-base py-2 px-3 md:py-3 md:px-4 hover:bg-accent hover:text-accent-foreground"
              >
                <Link href="/messages">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message[Inbox]
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start text-sm md:text-base py-2 px-3 md:py-3 md:px-4 hover:bg-accent hover:text-accent-foreground"
              >
                <Link href="/my-posts">
                  <History className="w-4 h-4 mr-2" />
                  Post history
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start text-sm md:text-base py-2 px-3 md:py-3 md:px-4 hover:bg-accent hover:text-accent-foreground"
              >
                <Link href="/posts/create">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Post a new story
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start text-sm md:text-base py-2 px-3 md:py-3 md:px-4 hover:bg-accent hover:text-accent-foreground"
              >
                <Link href="/safari">
                  <BookOpen className="w-4 h-4 mr-2" />
                  My Safari
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start text-sm md:text-base py-2 px-3 md:py-3 md:px-4 hover:bg-accent hover:text-accent-foreground"
              >
                <Link href="/email-all">
                  <Send className="w-4 h-4 mr-2" />
                  Send Email to all
                </Link>
              </Button>
            </CardContent>
          </Card>
       
        </div>
        {userInfo.role !== "ADMIN" && (
          <>
            <div className="space-y-4 md:space-y-6 mt-6 md:mt-8">
              <h2 className="text-2xl font-bold text-center mb-8">Premium Publishing Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Basic Publisher Card */}
                <Card className="bg-card dark:text-white text-black border-border hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Basic Publisher</h3>
                    <div className="text-2xl font-bold mb-6">$9.99<span className="text-sm font-normal">/month</span></div>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center">
                        <Shield className="w-5 h-5 text-green-500 mr-2" />
                        <span>Basic content publishing</span>
                      </li>
                      <li className="flex items-center">
                        <Shield className="w-5 h-5 text-green-500 mr-2" />
                        <span>Standard analytics</span>
                      </li>
                      <li className="flex items-center">
                        <Shield className="w-5 h-5 text-green-500 mr-2" />
                        <span>Community engagement tools</span>
                      </li>
                    </ul>
                    <Button
                      className="w-full"
                      onClick={() => router.push("/publisher-registration?tier=basic")}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
  
                {/* Pro Publisher Card */}
                <Card className="bg-primary/5 dark:text-white text-black border-primary hover:shadow-xl transition-shadow transform scale-105">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Pro Publisher</h3>
                    <div className="text-2xl font-bold mb-6">$24.99<span className="text-sm font-normal">/month</span></div>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center">
                        <Shield className="w-5 h-5 text-green-500 mr-2" />
                        <span>Advanced content publishing</span>
                      </li>
                      <li className="flex items-center">
                        <Shield className="w-5 h-5 text-green-500 mr-2" />
                        <span>Premium analytics dashboard</span>
                      </li>
                      <li className="flex items-center">
                        <Shield className="w-5 h-5 text-green-500 mr-2" />
                        <span>Corporate Media Hub access</span>
                      </li>
                      <li className="flex items-center">
                        <Shield className="w-5 h-5 text-green-500 mr-2" />
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
                <Card className="bg-card dark:text-white text-black border-border hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Enterprise</h3>
                    <div className="text-2xl font-bold mb-6">Custom</div>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center">
                        <Shield className="w-5 h-5 text-green-500 mr-2" />
                        <span>Custom publishing solutions</span>
                      </li>
                      <li className="flex items-center">
                        <Shield className="w-5 h-5 text-green-500 mr-2" />
                        <span>Dedicated account manager</span>
                      </li>
                      <li className="flex items-center">
                        <Shield className="w-5 h-5 text-green-500 mr-2" />
                        <span>API access</span>
                      </li>
                      <li className="flex items-center">
                        <Shield className="w-5 h-5 text-green-500 mr-2" />
                        <span>Custom integrations</span>
                      </li>
                    </ul>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push("/publisher-registration?tier=enterprise")}
                    >
                      Contact Sales
                    </Button>
                  </CardContent>
                </Card>
              </div>
  
              {/* Contact Form */}
              <div className="max-w-2xl mx-auto mt-8 space-y-4">
                <div>
                  <Label htmlFor="email">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="w-full"
                  />
                </div>
  
                <div>
                  <Label htmlFor="requirements">Additional Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Describe any specific requirements or questions"
                    className="w-full h-32"
                  />
                </div>
  
                <Button
                  className="w-full md:w-auto"
                  size="lg"
                  onClick={() => router.push("/publisher-registration")}
                >
                  Submit Request
                </Button>
              </div>
            </div>
  
            <div className="space-y-4 md:space-y-6 mt-6 md:mt-8">
              <h2 className="text-2xl font-bold text-center mb-8">Become an Advertiser</h2>
              <div className="max-w-2xl mx-auto">
                <Card className="bg-primary/5 dark:text-white text-black border-primary hover:shadow-xl transition-shadow">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-semibold mb-6 text-center">Advertise With Us</h3>
                    <div className="text-center mb-8">
                      <p className="text-lg text-muted-foreground">Reach your target audience effectively</p>
                    </div>
                    <ul className="space-y-4 mb-8">
                      <li className="flex items-center">
                        <Shield className="w-6 h-6 text-primary mr-3" />
                        <span className="text-lg">Targeted ad placement across our platform</span>
                      </li>
                      <li className="flex items-center">
                        <BarChart className="w-6 h-6 text-primary mr-3" />
                        <span className="text-lg">Comprehensive analytics and reporting</span>
                      </li>
                      <li className="flex items-center">
                        <Globe className="w-6 h-6 text-primary mr-3" />
                        <span className="text-lg">Wide audience reach and engagement</span>
                      </li>
                    </ul>
                    <Button
                      className="w-full text-lg py-6"
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
            <Card className="bg-card dark:text-white text-black border-border">
              <CardContent className="space-y-3 pt-4">
                <h2 className="text-lg font-semibold mb-4">Website Navigation</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/home"><Home className="w-4 h-4 mr-2" />Home</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/country"><Globe className="w-4 h-4 mr-2" />Country</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/post"><FileText className="w-4 h-4 mr-2" />Post</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/category"><Layout className="w-4 h-4 mr-2" />Category</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* User Management */}
            <Card className="bg-card dark:text-white text-black border-border">
              <CardContent className="space-y-3 pt-4">
                <h2 className="text-lg font-semibold mb-4">User Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/users"><Users className="w-4 h-4 mr-2" />Users</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/followers"><UserPlus className="w-4 h-4 mr-2" />Followers</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/following"><UserCheck className="w-4 h-4 mr-2" />Following</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/columns"><Columns className="w-4 h-4 mr-2" />Columns</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Content Management */}
            <Card className="bg-card dark:text-white text-black border-border">
              <CardContent className="space-y-3 pt-4">
                <h2 className="text-lg font-semibold mb-4">Content Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/post-news"><FileText className="w-4 h-4 mr-2" />Post News</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/forum-poll"><MessageSquare className="w-4 h-4 mr-2" />Forum & Poll</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/abuse-warned"><AlertTriangle className="w-4 h-4 mr-2" />Abuse/Warned</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* User Actions */}
            <Card className="bg-card dark:text-white text-black border-border">
              <CardContent className="space-y-3 pt-4">
                <h2 className="text-lg font-semibold mb-4">User Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/suspended"><Ban className="w-4 h-4 mr-2" />Suspended</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/banned"><UserX className="w-4 h-4 mr-2" />Banned</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/blocked-ip"><Lock className="w-4 h-4 mr-2" />Blocked/Block IP</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Package Management */}
            <Card className="bg-card dark:text-white text-black border-border">
              <CardContent className="space-y-3 pt-4">
                <h2 className="text-lg font-semibold mb-4">Package Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/create-package"><Plus className="w-4 h-4 mr-2" />Create Package</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/edit-package"><Pencil className="w-4 h-4 mr-2" />Edit Package</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/package-item-type"><Package className="w-4 h-4 mr-2" />Package Item Type</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Financial Management */}
            <Card className="bg-card dark:text-white text-black border-border">
              <CardContent className="space-y-3 pt-4">
                <h2 className="text-lg font-semibold mb-4">Financial Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/tax"><DollarSign className="w-4 h-4 mr-2" />Tax</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/send-email-all"><Mail className="w-4 h-4 mr-2" />Send Email to All</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/create-invoice">
                      <FileText className="w-4 h-4 mr-2" />Create Invoice & Bill
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/edit-advertisement"><Edit className="w-4 h-4 mr-2" />Edit Advertisement</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/publisher-content"><Edit className="w-4 h-4 mr-2" />Edit Publisher Content</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/statistics"><BarChart className="w-4 h-4 mr-2" />Advertiser & Publisher Statistics</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Publisher and Advertiser Section */}
       
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-10">
        <div className="grid grid-cols-5 gap-1 p-2">
          <Button variant="ghost" size="icon" asChild className="flex flex-col items-center justify-center p-1">
            <Link href="/stories">
              <Home className="h-5 w-5" />
              <span className="text-[10px] mt-1">Home</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="flex flex-col items-center justify-center p-1">
            <Link href="/messages">
              <MessageSquare className="h-5 w-5" />
              <span className="text-[10px] mt-1">Messages</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="flex flex-col items-center justify-center p-1">
            <Link href="/posts/create">
              <Send className="h-5 w-5" />
              <span className="text-[10px] mt-1">Post</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="flex flex-col items-center justify-center p-1">
            <Link href="/safari">
              <Bookmark className="h-5 w-5" />
              <span className="text-[10px] mt-1">Safari</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="flex flex-col items-center justify-center p-1">
            <Link href={`/users/${userInfo?.username}`}>
              <Users className="h-5 w-5" />
              <span className="text-[10px] mt-1">Profile</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

