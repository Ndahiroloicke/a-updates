"use client"

import React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, Send, ArrowRight, Hash, LinkIcon, MessageSquare, BarChart2, ChevronDown, Loader2 } from "lucide-react"
import Link from "next/link"
import RotatingAdBanner from "@/components/RotatingAdBanner"
import { useToast } from "./ui/use-toast"
import kyInstance from "@/lib/ky"

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

// Sample businesses/orgs with addresses
const businessLinks = [
  {
    name: "Nairobi Tech Hub",
    address: "Ngong Rd, Nairobi, Kenya",
    map: "https://maps.google.com/?q=Ngong+Rd,+Nairobi,+Kenya"
  },
  {
    name: "Cape Town Innovation Center",
    address: "123 Main St, Cape Town, South Africa",
    map: "https://maps.google.com/?q=123+Main+St,+Cape+Town,+South+Africa"
  },
  {
    name: "Lagos Business Park",
    address: "Victoria Island, Lagos, Nigeria",
    map: "https://maps.google.com/?q=Victoria+Island,+Lagos,+Nigeria"
  },
];

export default function Footer() {
    
const toast = useToast();
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openSections, setOpenSections] = useState({
    forums: true,
    polls: true,
    links: true,
    hashtags: true,
    business: true,
  });
  const [latestPolls, setLatestPolls] = useState<any[]>([]);
  const [loadingPolls, setLoadingPolls] = useState(true);
  const [latestForums, setLatestForums] = useState<any[]>([]);
  const [loadingForums, setLoadingForums] = useState(true);

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

  // Responsive: collapse on mobile, expand on desktop
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      setOpenSections({
        forums: !isMobile,
        polls: !isMobile,
        links: !isMobile,
        hashtags: !isMobile,
        business: !isMobile,
      });
    }
  }, []);

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  React.useEffect(() => {
    // Fetch latest polls
    setLoadingPolls(true);
    kyInstance.get("/api/polls?take=5").json<{ polls: any[] }>()
      .then((data) => setLatestPolls(data.polls.slice(0, 5)))
      .catch(() => setLatestPolls([]))
      .finally(() => setLoadingPolls(false));
    // Fetch latest forums
    setLoadingForums(true);
    kyInstance.get("/api/forum-polls?take=5").json<{ polls: any[] }>()
      .then((data) => setLatestForums(data.polls.slice(0, 5)))
      .catch(() => setLatestForums([]))
      .finally(() => setLoadingForums(false));
  }, []);

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
              position="BELOW_FOOTER"
              rotationInterval={5000}
              className="w-full rounded-md overflow-hidden"
            />
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Advertisement</h4>
            <RotatingAdBanner
              position="BELOW_FOOTER"
              rotationInterval={7000}
              className="w-full rounded-md overflow-hidden"
            />
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Latest Forums */}
          <div>
            <button
              className="flex items-center w-full justify-between mb-4 text-lg font-semibold gap-2"
              onClick={() => toggleSection('forums')}
              aria-expanded={openSections.forums}
            >
              <span className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /> Latest Forums</span>
              <ChevronDown className={`h-5 w-5 transition-transform ${openSections.forums ? '' : 'rotate-180'}`} />
            </button>
            {openSections.forums && (
              <ul className="space-y-2">
                {loadingForums ? (
                  <li className="flex justify-center py-2"><Loader2 className="h-5 w-5 animate-spin text-primary" /></li>
                ) : latestForums.length === 0 ? (
                  <li className="text-muted-foreground">No forums found.</li>
                ) : (
                  latestForums.map((forum, index) => (
                    <li key={forum.id}>
                      <Link
                        href={`/forums/${forum.id}`}
                        className="text-muted-foreground hover:text-primary hover:underline flex items-center gap-2"
                      >
                        <ArrowRight className="h-3 w-3" />
                        {forum.title}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          {/* Latest Polls */}
          <div>
            <button
              className="flex items-center w-full justify-between mb-4 text-lg font-semibold gap-2"
              onClick={() => toggleSection('polls')}
              aria-expanded={openSections.polls}
            >
              <span className="flex items-center gap-2"><BarChart2 className="h-4 w-4 text-primary" /> Latest Polls</span>
              <ChevronDown className={`h-5 w-5 transition-transform ${openSections.polls ? '' : 'rotate-180'}`} />
            </button>
            {openSections.polls && (
              <ul className="space-y-2">
                {loadingPolls ? (
                  <li className="flex justify-center py-2"><Loader2 className="h-5 w-5 animate-spin text-primary" /></li>
                ) : latestPolls.length === 0 ? (
                  <li className="text-muted-foreground">No polls found.</li>
                ) : (
                  latestPolls.map((poll, index) => (
                    <li key={poll.id}>
                      <Link
                        href={`/polls/${poll.id}`}
                        className="text-muted-foreground hover:text-primary hover:underline flex items-center gap-2"
                      >
                        <ArrowRight className="h-3 w-3" />
                        {poll.title}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          {/* Links */}
          <div>
            <button
              className="flex items-center w-full justify-between mb-4 text-lg font-semibold gap-2"
              onClick={() => toggleSection('links')}
              aria-expanded={openSections.links}
            >
              <span className="flex items-center gap-2"><LinkIcon className="h-4 w-4 text-primary" /> Links</span>
              <ChevronDown className={`h-5 w-5 transition-transform ${openSections.links ? '' : 'rotate-180'}`} />
            </button>
            {openSections.links && (
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
            )}
          </div>

          {/* Trending Hashtags */}
          <div>
            <button
              className="flex items-center w-full justify-between mb-4 text-lg font-semibold gap-2"
              onClick={() => toggleSection('hashtags')}
              aria-expanded={openSections.hashtags}
            >
              <span className="flex items-center gap-2"><Hash className="h-4 w-4 text-primary" /> Trending Hashtags</span>
              <ChevronDown className={`h-5 w-5 transition-transform ${openSections.hashtags ? '' : 'rotate-180'}`} />
            </button>
            {openSections.hashtags && (
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
            )}
          </div>

          {/* Businesses & Organizations (Map Links) */}
          <div>
            <button
              className="flex items-center w-full justify-between mb-4 text-lg font-semibold gap-2"
              onClick={() => toggleSection('business')}
              aria-expanded={openSections.business}
            >
              <span className="flex items-center gap-2"><LinkIcon className="h-4 w-4 text-primary" /> Businesses & Orgs</span>
              <ChevronDown className={`h-5 w-5 transition-transform ${openSections.business ? '' : 'rotate-180'}`} />
            </button>
            {openSections.business && (
              <ul className="space-y-2">
                {businessLinks.map((biz, idx) => (
                  <li key={idx} className="flex flex-col gap-1">
                    <span className="font-medium">{biz.name}</span>
                    <span className="text-xs text-muted-foreground">{biz.address}</span>
                    <a
                      href={biz.map}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                    >
                      View on Map <ArrowRight className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
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

