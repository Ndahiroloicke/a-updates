"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

const partnerNews = [
  {
    title: "MTN Expands Mobile Money Services",
    date: "2024-04-01",
    source: "Tech Africa",
    excerpt: "MTN's mobile money platform reaches new milestones in financial inclusion across Africa, connecting millions to digital financial services.",
    image: "/mtn-mobile-money.jpg",
    link: "#"
  },
  {
    title: "Digital Innovation Partnership Launch",
    date: "2024-03-28",
    source: "African Tech Review",
    excerpt: "MTN partners with leading tech companies to accelerate digital transformation and innovation across Africa.",
    image: "/mtn2.jpg",
    link: "#"
  },
  {
    title: "Rural Connectivity Program Success",
    date: "2024-03-22",
    source: "Business Africa",
    excerpt: "MTN's rural connectivity initiative brings high-speed internet to remote communities, bridging the digital divide.",
    image: "/mtn3.jpg",
    link: "#"
  }
]

const mediaGallery = [
  {
    title: "Mobile Money Innovation",
    image: "/mtn-mobile-money.jpg",
    description: "Transforming financial services through mobile money solutions across Africa."
  },
  {
    title: "Digital Transformation",
    image: "/mtn1.jpg",
    description: "Leading Africa's digital revolution through innovative technology solutions."
  },
  {
    title: "Network Excellence",
    image: "/mtn2.jpg",
    description: "State-of-the-art network infrastructure powering connectivity across the continent."
  },
  {
    title: "Community Impact",
    image: "/mtn3.jpg",
    description: "Creating positive change through digital inclusion and community development."
  }
]

const partnershipHighlights = [
  {
    title: "Digital Inclusion",
    description: "Connecting millions to the digital economy.",
    stats: "100M+ Users Connected",
    icon: "📱"
  },
  {
    title: "Financial Access",
    description: "Expanding mobile financial services across Africa.",
    stats: "50M+ Mobile Money Users",
    icon: "💳"
  },
  {
    title: "Innovation",
    description: "Driving digital transformation and technological advancement.",
    stats: "1000+ Innovation Projects",
    icon: "💡"
  },
  {
    title: "Community Impact",
    description: "Empowering communities through connectivity.",
    stats: "30+ Countries Reached",
    icon: "🌍"
  }
]

export default function MTNPartnershipDetails() {
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
            src="/mtn-mobile-money.jpg"
            alt="MTN Partnership"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-4xl font-bold mb-2">MTN Partnership Details</h1>
            <p className="text-lg opacity-90">Connecting Africa's Digital Future</p>
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
            Join MTN in building Africa's digital future. Explore collaboration opportunities in telecommunications, fintech, and digital innovation.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/corporate-media/register">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Apply for Partnership
              </Button>
            </Link>
            <Link href="https://www.mtn.com/partnerships" target="_blank">
              <Button size="lg" variant="outline" className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-gray-800">
                Learn More
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  )
} 