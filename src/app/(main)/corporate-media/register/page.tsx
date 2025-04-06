"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"

export default function CorporatePartnerRegistration() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Application Submitted",
        description: "We'll review your application and get back to you soon.",
      })
      setIsSubmitting(false)
    }, 2000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3">Partner Registration</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Join our network of corporate partners and expand your reach across Africa.
          </p>
        </div>

        <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="organization" className="text-gray-700 dark:text-gray-200">
                  Organization Name
                </Label>
                <Input
                  id="organization"
                  placeholder="Enter your organization name"
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-gray-700 dark:text-gray-200">
                  Website
                </Label>
                <Input
                  id="website"
                  placeholder="https://your-website.com"
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact" className="text-gray-700 dark:text-gray-200">
                  Contact Person
                </Label>
                <Input
                  id="contact"
                  placeholder="Full name"
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@organization.com"
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 dark:text-gray-200">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  placeholder="+1234567890"
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-gray-700 dark:text-gray-200">
                  Country
                </Label>
                <Input
                  id="country"
                  placeholder="Your country"
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="partnership" className="text-gray-700 dark:text-gray-200">
                Type of Partnership
              </Label>
              <Input
                id="partnership"
                placeholder="e.g., Technology, Healthcare, Energy, etc."
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700 dark:text-gray-200">
                Tell us about your organization
              </Label>
              <Textarea
                id="description"
                placeholder="Brief description of your organization and partnership goals"
                className="min-h-[150px] bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting Application..." : "Submit Application"}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  )
} 