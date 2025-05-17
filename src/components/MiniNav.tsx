"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

export default function MiniNav() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category')
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  // Regular navigation links
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Posts", href: "/home"},
    { label: "Africa Wall", href: "/push-wall" },
    { label: "Forumn & Poll", href: "/forum-poll" },
    { label: "Africa Map", href: "/africa-map" },
    { label: "Stories", href: "/stories" },
  ]

  // Category filters with sub-links
  const categoryLinks = [
    { 
      label: "Politics", 
      href: "/?category=politics",
      subLinks: [
        { label: "Elections", href: "/?category=politics&subcategory=elections" },
        { label: "Policy", href: "/?category=politics&subcategory=policy" },
        { label: "International", href: "/?category=politics&subcategory=international" }
      ]
    },
    { 
      label: "AfroVideo", 
      href: "/?category=video",
      subLinks: [
        { label: "News", href: "/?category=video&subcategory=news" },
        { label: "Entertainment", href: "/?category=video&subcategory=entertainment" }
      ]
    },
    { 
      label: "Business", 
      href: "/?category=business",
      subLinks: [
        { label: "Markets", href: "/?category=business&subcategory=markets" },
        { label: "Economy", href: "/?category=business&subcategory=economy" },
        { label: "Startups", href: "/?category=business&subcategory=startups" }
      ]
    },
    { 
      label: "Sports", 
      href: "/?category=sports",
      subLinks: [
        { label: "Football", href: "/?category=sports&subcategory=football" },
        { label: "Basketball", href: "/?category=sports&subcategory=basketball" },
        { label: "Athletics", href: "/?category=sports&subcategory=athletics" }
      ]
    },
    { 
      label: "Technology", 
      href: "/?category=technology",
      subLinks: [
        { label: "Gadgets", href: "/?category=technology&subcategory=gadgets" },
        { label: "Software", href: "/?category=technology&subcategory=software" },
        { label: "Innovation", href: "/?category=technology&subcategory=innovation" }
      ]
    },
    { 
      label: "Entertainment", 
      href: "/?category=entertainment",
      subLinks: [
        { label: "Music", href: "/?category=entertainment&subcategory=music" },
        { label: "Movies", href: "/?category=entertainment&subcategory=movies" },
        { label: "Celebrities", href: "/?category=entertainment&subcategory=celebrities" }
      ]
    },
    { 
      label: "Corporate Media Hub", 
      href: "/?category=corporate_media",
      subLinks: [
        { label: "Press Releases", href: "/?category=corporate_media&subcategory=press" },
        { label: "Events", href: "/?category=corporate_media&subcategory=events" }
      ]
    },
  ]

  // Check if a path is active
  const isPathActive = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }
    return pathname.includes(href);
  }

  // Check if a category is active
  const isCategoryActive = (href: string) => {
    const categoryParam = href.split('=')[1];
    return searchParams.get('category') === categoryParam;
  }

  return (
    <div className="w-full bg-white dark:bg-gray-900">
      <div className="border-b border-t dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          {/* All links in a single row with full width */}
          <div className="flex flex-wrap justify-center">
            {/* Navigation Links */}
            <div className="w-full flex flex-wrap justify-center py-1">
              {navLinks.map((item) => {
                const isActive = isPathActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 mx-1 rounded-md",
                      isActive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-700 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400",
                    )}
                  >
                    {item.label}

                    {isActive && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 dark:bg-emerald-400 rounded-full"
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Category Links with Dropdowns */}
            <div className="w-full flex flex-wrap justify-center py-1 border-t dark:border-gray-800">
              {categoryLinks.map((category) => {
                const isActive = isCategoryActive(category.href);
                const isHovered = hoveredCategory === category.label;

                return (
                  <div 
                    key={category.href}
                    className="relative"
                    onMouseEnter={() => setHoveredCategory(category.label)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <Link
                      href={category.href}
                      className={cn(
                        "relative px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 mx-1 rounded-md flex items-center gap-1",
                        isActive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-gray-700 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400",
                      )}
                    >
                      {category.label}
                      <ChevronDown className={cn("h-4 w-4 transition-transform", isHovered && "transform rotate-180")} />

                      {isActive && (
                        <div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 dark:bg-emerald-400 rounded-full"
                        />
                      )}
                    </Link>

                    {/* Dropdown menu */}
                    {isHovered && (
                      <div 
                        className="absolute z-50 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-100 dark:border-gray-700"
                        style={{ pointerEvents: 'auto' }}
                      >
                        {category.subLinks.map((subLink) => (
                          <Link
                            key={subLink.href}
                            href={subLink.href}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-emerald-500 dark:hover:text-emerald-400"
                          >
                            {subLink.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}