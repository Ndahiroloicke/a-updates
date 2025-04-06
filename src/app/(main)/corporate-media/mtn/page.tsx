"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

const news = [
  {
    title: "Mobile Money Innovation",
    date: "2024-04-01",
    excerpt: "MTN's mobile money platform continues to transform financial services across Africa, reaching new milestones in digital inclusion.",
    image: "/mtn-mobile-money.jpg"
  },
  {
    title: "Digital Transformation",
    date: "2024-03-28",
    excerpt: "Leading the digital revolution in Africa through innovative technology solutions and partnerships.",
    image: "/mtn2.jpeg"
  },
  {
    title: "Community Impact",
    date: "2024-03-22",
    excerpt: "MTN's initiatives bring positive change through digital inclusion and community development programs.",
    image: "/mtn3.jpeg"
  }
]

const initiatives = [
  {
    title: "Digital Financial Services",
    description: "Expanding access to digital financial services through MTN Mobile Money.",
    icon: "💳"
  },
  {
    title: "Network Infrastructure",
    description: "Building state-of-the-art network infrastructure across Africa.",
    icon: "📡"
  },
  {
    title: "Digital Inclusion",
    description: "Connecting millions to the digital economy through innovative solutions.",
    icon: "🌍"
  }
]

export default function MTNPartnerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-bold mb-4">MTN Partnership</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Connecting Africa's Digital Future Through Innovation and Technology
        </p>
        <div className="relative h-[400px] rounded-xl overflow-hidden mb-8">
          <Image
            src="/mtn-mobile-money.jpg"
            alt="MTN Partnership"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      </motion.div>

      {/* Initiatives Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-semibold mb-6">Key Initiatives</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {initiatives.map((initiative, index) => (
            <Card key={initiative.title} className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <div className="text-4xl mb-4">{initiative.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-emerald-600 dark:text-emerald-400">{initiative.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{initiative.description}</p>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Latest Updates Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-semibold mb-6">Latest Updates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map((item, index) => (
            <Card key={item.title} className="overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <div className="relative h-48">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-emerald-600 dark:text-emerald-400">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.date}</p>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{item.excerpt}</p>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <Link href="/corporate-media/mtn/partnership">
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
            View Partnership Details
          </Button>
        </Link>
      </motion.div>
    </div>
  )
} 