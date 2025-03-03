"use client"

import { format } from "date-fns"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Github } from "lucide-react"
import AdminPage from "./AdminPage"
import { User } from "lucia"
import NewsSidebar from "./NewsSidebar"

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

export default function DashboardLayout({userInfo}: {userInfo: User}) { 

  return (
    <div className="min-h-screen bg-background">
      <div className="">
        <div className="flex flex-row justify-between gap-8 p-6">
          
          {/* Centered Admin Page */}
          <div className="w-2/3">
            <AdminPage userInfo={userInfo} />
          </div>

          {/* Right Sidebar */}
          <NewsSidebar ads={ads}/>
        </div>
      </div>
    </div>
  )
}

