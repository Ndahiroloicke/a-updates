"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

const partners = [
  {
    name: "General Electric",
    description: "Powering Africa's Future - Leading the way in energy infrastructure and technological innovation across the continent.",
    logo: "/general.jpg",
    link: "/corporate-media/general-electric",
    titleColor: "text-emerald-600 dark:text-emerald-400"
  },
  {
    name: "Medical Kenya",
    description: "Leading Healthcare Innovation - Transforming healthcare delivery and medical services across Africa.",
    logo: "/medical.png",
    link: "/corporate-media/medical-kenya",
    titleColor: "text-emerald-600 dark:text-emerald-400"
  },
  {
    name: "MTN",
    description: "Connecting Africa, Empowering Growth - Pioneering mobile technology and digital transformation across the continent.",
    logo: "/mtn-mobile-money.jpg",
    link: "/corporate-media/mtn",
    titleColor: "text-emerald-600 dark:text-emerald-400"
  },
  {
    name: "SASOL",
    description: "Innovating for a Sustainable Future - Leading energy and chemical solutions provider in Africa.",
    logo: "/sasol.jpg",
    link: "/corporate-media/sasol",
    titleColor: "text-emerald-600 dark:text-emerald-400"
  }
]

export default function CorporateMediaHub() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Corporate Media Hub</h1>
        <p className="text-lg text-muted-foreground">
          Connect with our trusted partners and explore exclusive content.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {partners.map((partner) => (
          <Card key={partner.name} className="overflow-hidden bg-white dark:bg-gray-900">
            <div className="relative h-48">
              <Image
                src={partner.logo}
                alt={partner.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h2 className={`text-2xl font-bold mb-2 ${partner.titleColor}`}>
                {partner.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {partner.description}
              </p>
              <Link href={partner.link}>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  View Partnership Details
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Card className="inline-block p-8 bg-white dark:bg-gray-900">
          <h2 className="text-2xl font-bold mb-4">Become a Corporate Partner</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl">
            Join our network of distinguished corporate partners and reach millions of engaged readers across Africa. Get exclusive access to our platform's features, analytics, and collaborative opportunities.
          </p>
          <Link href="/corporate-media/register">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Partner With Us
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  )
} 