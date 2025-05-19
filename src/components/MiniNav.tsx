"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { useCategoryStore } from "./categoryStore"

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

  // Get categories and sub-links from Zustand store
  const categories = useCategoryStore((state) => state.categories)

  // Check if a path is active
  const isPathActive = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }
    return pathname.includes(href);
  }

  // Check if a category is active
  const isCategoryActive = (label: string) => {
    return currentCategory === label.toLowerCase();
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
              {categories.map((category) => {
                const isActive = isCategoryActive(category.label);
                const isHovered = hoveredCategory === category.label;
                const categoryHref = `/?category=${category.label.toLowerCase()}`;

                return (
                  <div 
                    key={category.label}
                    className="relative"
                    onMouseEnter={() => setHoveredCategory(category.label)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <Link
                      href={categoryHref}
                      className={cn(
                        "relative px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 mx-1 rounded-md flex items-center gap-1",
                        isActive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-gray-700 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400",
                      )}
                    >
                      {category.label}
                      {category.subLinks.length > 0 && (
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isHovered && "transform rotate-180")} />
                      )}

                      {isActive && (
                        <div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 dark:bg-emerald-400 rounded-full"
                        />
                      )}
                    </Link>

                    {/* Dropdown menu */}
                    {isHovered && category.subLinks.length > 0 && (
                      <div 
                        className="absolute z-50 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-100 dark:border-gray-700"
                        style={{ pointerEvents: 'auto' }}
                      >
                        {category.subLinks.map((subLink) => (
                          <Link
                            key={subLink.label}
                            href={`/?category=${category.label.toLowerCase()}&subcategory=${subLink.label.toLowerCase()}`}
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