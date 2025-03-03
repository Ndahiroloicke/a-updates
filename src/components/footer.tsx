"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, Send, ArrowRight, Hash, LinkIcon, MessageSquare, BarChart2 } from "lucide-react"
import Link from "next/link"
import RotatingAdBanner from "@/components/RotatingAdBanner"
import { useToast } from "./ui/use-toast"

// Sample ads data - replace with your actual ads
const footerAds = [
  {
    id: "ad1",
    imageSrc: "/myad.webp",
    link: "https://example.com/ad1",
    alt: "Advertisement 1",
  },
  {
    id: "ad2",
    imageSrc: "/ad2.jpg",
    link: "https://example.com/ad2",
    alt: "Advertisement 2",
  },
]

// Sample trending hashtags
const trendingHashtags = ["AfricaRising", "TechInnovation", "ClimateAction", "AfricanCuisine", "StartupAfrica"]

// Sample forum topics
const latestForums = [
  "Economic Development",
  "Technology Trends",
  "Cultural Exchange",
  "Education Initiatives",
  "Healthcare Innovations",
]

// Sample polls
const latestPolls = [
  "Future of Renewable Energy",
  "Digital Transformation",
  "Tourism Destinations",
  "Agricultural Innovations",
  "Urban Development",
]

// Sample links
const usefulLinks = [
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
  { name: "FAQ", href: "/faq" },
]

export default function Footer() {
    
const toast = useToast();
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.toast({
        description: "Please enter your email address"
      })
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.toast({
        variant: "destructive",
        description: "Please enter a valid email address"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error("Failed to subscribe")
      }

      toast.toast({
        description: "Thank you for subscribing to Africa Updates!"
      })
      setEmail("")
    } catch (error) {
      toast.toast({
        variant: "destructive",
        description: "Something went wrong. Please try again later."
      })
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer className="bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border-t border-slate-200 dark:border-slate-800 mt-12">
      {/* Newsletter Subscription */}
      <div className="container mx-auto py-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold">Subscribe to Newsletter</h3>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="w-full md:w-80"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Subscribing..."
                ) : (
                  <>
                    Subscribe <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Advertisements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Advertisement</h4>
            <RotatingAdBanner
              ads={footerAds}
              rotationInterval={5000}
              width={300}
              height={120}
              className="w-full rounded-md overflow-hidden"
            />
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Advertisement</h4>
            <RotatingAdBanner
              ads={footerAds.slice().reverse()}
              rotationInterval={7000}
              width={300}
              height={120}
              className="w-full rounded-md overflow-hidden"
            />
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Latest Forums */}
          <div>
            <h4 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <MessageSquare className="h-4 w-4 text-primary" />
              Latest Forums
            </h4>
            <ul className="space-y-2">
              {latestForums.map((forum, index) => (
                <li key={index}>
                  <Link
                    href={`/forums/${forum.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-muted-foreground hover:text-primary hover:underline flex items-center gap-2"
                  >
                    <ArrowRight className="h-3 w-3" />
                    {forum}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Latest Polls */}
          <div>
            <h4 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <BarChart2 className="h-4 w-4 text-primary" />
              Latest Polls
            </h4>
            <ul className="space-y-2">
              {latestPolls.map((poll, index) => (
                <li key={index}>
                  <Link
                    href={`/polls/${poll.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-muted-foreground hover:text-primary hover:underline flex items-center gap-2"
                  >
                    <ArrowRight className="h-3 w-3" />
                    {poll}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <LinkIcon className="h-4 w-4 text-primary" />
              Links
            </h4>
            <ul className="space-y-2">
              {usefulLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary hover:underline flex items-center gap-2"
                  >
                    <ArrowRight className="h-3 w-3" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trending Hashtags */}
          <div>
            <h4 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Hash className="h-4 w-4 text-primary" />
              Trending Hashtags
            </h4>
            <div className="flex flex-wrap gap-2">
              {trendingHashtags.map((tag, index) => (
                <Link
                  key={index}
                  href={`/tags/${tag.toLowerCase().replace(/\s+/g, "")}`}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm hover:bg-primary hover:text-white transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-200 dark:border-slate-800 mt-8 pt-6 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Africa Updates. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

