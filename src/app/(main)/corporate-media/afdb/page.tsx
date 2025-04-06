"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

const news = [
  {
    title: "AfDB Approves $25 Million for Climate Resilience in East Africa",
    date: "2024-04-03",
    excerpt: "The African Development Bank has approved a new funding initiative to support climate resilience projects across East Africa...",
    image: "/placeholder.svg"
  },
  {
    title: "New Partnership to Boost Agricultural Innovation",
    date: "2024-04-02",
    excerpt: "A groundbreaking partnership between AfDB and agricultural technology firms aims to revolutionize farming practices...",
    image: "/placeholder.svg"
  },
  {
    title: "Infrastructure Development Program Launches in West Africa",
    date: "2024-04-01",
    excerpt: "The bank announces a major infrastructure development program targeting transportation and energy sectors...",
    image: "/placeholder.svg"
  }
]

export default function AfDBPartnerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mb-6 h-40 relative mx-auto max-w-md">
            <Image
              src="/placeholder.svg"
              alt="African Development Bank"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-4">African Development Bank</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            The African Development Bank Group is Africa's premier development finance institution, committed to achieving the sustainable economic development and social progress of its regional member countries.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-3">Mission</h3>
          <p className="text-muted-foreground">
            To spur sustainable economic development and social progress in Africa, contributing to poverty reduction.
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-3">Vision</h3>
          <p className="text-muted-foreground">
            A prosperous Africa based on inclusive growth and sustainable development.
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-3">Impact</h3>
          <p className="text-muted-foreground">
            Supporting transformative projects across 54 African countries through sustainable financing and technical assistance.
          </p>
        </Card>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Latest Updates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-sm text-muted-foreground mb-2">{item.date}</p>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground mb-4 flex-1">{item.excerpt}</p>
                  <Button variant="outline" className="w-full">
                    Read More
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link href="https://www.afdb.org" target="_blank">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
            Visit Official Website
          </Button>
        </Link>
      </div>
    </div>
  )
} 