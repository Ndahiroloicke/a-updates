"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

const partnerNews = [
  {
    title: "SASOL Launches Green Hydrogen Initiative",
    date: "2024-04-01",
    source: "Energy News Africa",
    excerpt: "SASOL announces major investment in green hydrogen production facilities to support sustainable energy transition.",
    image: "/sasol1.jpg",
    link: "#"
  },
  {
    title: "Renewable Energy Partnership Expansion",
    date: "2024-03-28",
    source: "African Energy Review",
    excerpt: "SASOL expands its renewable energy portfolio through strategic partnerships across Africa.",
    image: "/sasol2.jpeg",
    link: "#"
  },
  {
    title: "Community Development Program Success",
    date: "2024-03-22",
    source: "Business Africa",
    excerpt: "SASOL's community development initiatives show significant impact in local communities.",
    image: "/sasol3.jpg",
    link: "#"
  }
]

const mediaGallery = [
  {
    title: "Sustainable Energy Solutions",
    image: "/sasol.jpg",
    description: "State-of-the-art renewable energy facilities powering African communities."
  },
  {
    title: "Environmental Conservation",
    image: "/sasol1.jpg",
    description: "Environmental protection and conservation initiatives across our operations."
  },
  {
    title: "Community Empowerment",
    image: "/sasol2.jpeg",
    description: "Skills development and economic empowerment programs for local communities."
  },
  {
    title: "Innovation Hub",
    image: "/sasol3.jpg",
    description: "Research and development center driving sustainable technology solutions."
  }
]

const partnershipHighlights = [
  {
    title: "Sustainable Energy",
    description: "Leading Africa's transition to sustainable and renewable energy solutions.",
    stats: "30% Emissions Reduction",
    icon: "⚡"
  },
  {
    title: "Community Impact",
    description: "Empowering local communities through development initiatives.",
    stats: "100K+ Lives Impacted",
    icon: "🌱"
  },
  {
    title: "Innovation",
    description: "Driving technological advancement in sustainable energy.",
    stats: "200+ Patents Filed",
    icon: "💡"
  },
  {
    title: "Environmental Care",
    description: "Committed to environmental protection and conservation.",
    stats: "50+ Conservation Projects",
    icon: "🌍"
  }
]

export default function SasolPartnershipDetails() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <div className="mb-6 h-64 relative mx-auto rounded-xl overflow-hidden">
          <Image
            src="/sasol.jpg"
            alt="SASOL Partnership"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-4xl font-bold mb-2">SASOL Partnership Details</h1>
            <p className="text-lg opacity-90">Powering Sustainable Development in Africa</p>
          </div>
        </div>
      </motion.div>

      {/* Partnership Highlights */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Partnership Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {partnershipHighlights.map((highlight, index) => (
            <motion.div
              key={highlight.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="text-4xl mb-4">{highlight.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-emerald-600 dark:text-emerald-400">{highlight.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{highlight.description}</p>
                <div className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                  {highlight.stats}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="news" className="mb-12">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="news">Latest News & Updates</TabsTrigger>
          <TabsTrigger value="media">Media Gallery</TabsTrigger>
        </TabsList>

        <TabsContent value="news">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partnerNews.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <div className="relative h-48">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.date}</span>
                      <span className="text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded">
                        {item.source}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 flex-1">{item.excerpt}</p>
                    <Link href={item.link}>
                      <Button variant="outline" className="w-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                        Read Full Article
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="media">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mediaGallery.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <div className="relative h-64">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-emerald-600 dark:text-emerald-400">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <Card className="p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 inline-block">
          <h2 className="text-2xl font-semibold mb-4">Interested in Partnership?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl">
            Join SASOL in driving sustainable development across Africa. Explore collaboration opportunities in renewable energy and community development.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/corporate-media/register">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Apply for Partnership
              </Button>
            </Link>
            <Link href="https://www.sasol.com/partnerships" target="_blank">
              <Button size="lg" variant="outline" className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                Learn More
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  )
} 