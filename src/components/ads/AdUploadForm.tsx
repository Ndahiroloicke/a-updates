"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type AdFormData = {
  name: string
  type: string
  region: "LOCAL" | "MULTI_COUNTRY" | "ALL_AFRICA"
  placement: "RIGHT_COLUMN_TOP" | "RIGHT_COLUMN_MIDDLE" | "RIGHT_COLUMN_BOTTOM" | "BELOW_FOOTER" | "IN_FEED" | "FULL_PAGE_TAKEOVER"
  format: "BANNER" | "SIDEBAR" | "IN_FEED" | "FULL_PAGE" | "MOBILE"
  duration: number
  durationType: "MINUTES" | "HOURS" | "DAYS" | "WEEKS" | "MONTHS"
  startDate: Date
  targetUrl?: string
  media?: File
}

const REGIONS = [
  { value: "LOCAL", label: "Local (Single Country)", basePrice: 10 },
  { value: "MULTI_COUNTRY", label: "Multi-Country", basePrice: 25 },
  { value: "ALL_AFRICA", label: "All Africa", basePrice: 50 },
]

const PLACEMENTS = [
  { value: "RIGHT_COLUMN_TOP", label: "Right Column (Top)", basePrice: 100 },
  { value: "RIGHT_COLUMN_MIDDLE", label: "Right Column (Middle)", basePrice: 80 },
  { value: "RIGHT_COLUMN_BOTTOM", label: "Right Column (Bottom)", basePrice: 60 },
  { value: "BELOW_FOOTER", label: "Below Footer", basePrice: 40 },
  { value: "IN_FEED", label: "In Feed", basePrice: 120 },
  { value: "FULL_PAGE_TAKEOVER", label: "Full Page Takeover", basePrice: 200 },
]

const FORMATS = [
  { value: "BANNER", label: "Banner Ad", multiplier: 1 },
  { value: "SIDEBAR", label: "Sidebar Ad", multiplier: 1.2 },
  { value: "IN_FEED", label: "In-feed Ad", multiplier: 1.5 },
  { value: "FULL_PAGE", label: "Full Page Ad", multiplier: 2 },
  { value: "MOBILE", label: "Mobile Ad", multiplier: 0.8 },
]

const DURATION_TYPES = [
  { value: "MINUTES", label: "Minutes", multiplier: 0.1 },
  { value: "HOURS", label: "Hours", multiplier: 0.5 },
  { value: "DAYS", label: "Days", multiplier: 1 },
  { value: "WEEKS", label: "Weeks", multiplier: 6 },
  { value: "MONTHS", label: "Months", multiplier: 20 },
]

export default function AdUploadForm() {
  const [formData, setFormData] = useState<AdFormData>({
    name: "",
    type: "image",
    region: "LOCAL",
    placement: "RIGHT_COLUMN_TOP",
    format: "BANNER",
    duration: 1,
    durationType: "DAYS",
    startDate: new Date(),
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [price, setPrice] = useState(10)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setFormData(prev => ({ ...prev, media: file }))

      const fileType = file.type.startsWith("video/") ? "video" : "image"
      setFormData(prev => ({ ...prev, type: fileType }))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
      "video/*": [".mp4", ".webm", ".ogg"],
    },
    maxSize: 100 * 1024 * 1024,
    multiple: false,
  })

  const calculatePrice = useCallback(() => {
    const basePrice = PLACEMENTS.find(p => p.value === formData.placement)?.basePrice || 100
    const formatMultiplier = FORMATS.find(f => f.value === formData.format)?.multiplier || 1
    const regionMultiplier = REGIONS.find(r => r.value === formData.region)?.basePrice || 10
    const durationMultiplier = DURATION_TYPES.find(d => d.value === formData.durationType)?.multiplier || 1
    const calculatedPrice = basePrice * formatMultiplier * (regionMultiplier / 10) * durationMultiplier * formData.duration
    setPrice(calculatedPrice)
  }, [formData.placement, formData.format, formData.region, formData.durationType, formData.duration])

  useEffect(() => {
    calculatePrice()
  }, [formData.placement, formData.format, formData.region, formData.durationType, formData.duration, calculatePrice])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        description: "Please enter an advertisement name.",
      })
      return
    }

    if (!formData.media) {
      toast({
        variant: "destructive",
        description: "Please upload an image or video for your advertisement.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const submitFormData = new FormData()
      
      submitFormData.append("file", formData.media)
      submitFormData.append("name", formData.name)
      submitFormData.append("type", formData.type)
      submitFormData.append("region", formData.region)
      submitFormData.append("placement", formData.placement)
      submitFormData.append("format", formData.format)
      submitFormData.append("duration", String(formData.duration))
      submitFormData.append("durationType", formData.durationType)
      submitFormData.append("startDate", formData.startDate.toISOString())
      if (formData.targetUrl) {
        submitFormData.append("targetUrl", formData.targetUrl)
      }
      submitFormData.append("price", String(price))
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: submitFormData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create advertisement")
      }

      const { paymentUrl } = await response.json()

      if (paymentUrl) {
        window.location.href = paymentUrl
      } else {
        toast({
          description: "Advertisement submitted successfully!",
        })
      }
    } catch (error) {
      console.error("Error creating advertisement:", error)
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "Failed to create advertisement. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <Label htmlFor="name">Advertisement Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter a name for your advertisement"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Media Upload</Label>
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"
          )}
        >
          <input {...getInputProps()} />
          {previewUrl ? (
            <div className="space-y-2">
              {formData.type === "image" ? (
                <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto" />
              ) : (
                <video src={previewUrl} className="max-h-48 mx-auto" controls />
              )}
              <p className="text-sm text-muted-foreground">Click or drag to replace</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p>Drag & drop an image or video here, or click to select</p>
              <p className="text-sm text-muted-foreground">Supports: JPG, PNG, GIF, MP4 (max 100MB)</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="placement">Placement</Label>
          <Select
            value={formData.placement}
            onValueChange={(value: AdFormData["placement"]) => 
              setFormData(prev => ({ ...prev, placement: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select placement" />
            </SelectTrigger>
            <SelectContent>
              {PLACEMENTS.map((placement) => (
                <SelectItem key={placement.value} value={placement.value}>
                  {placement.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="format">Format</Label>
          <Select
            value={formData.format}
            onValueChange={(value: AdFormData["format"]) => 
              setFormData(prev => ({ ...prev, format: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {FORMATS.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <Select
            value={formData.region}
            onValueChange={(value: AdFormData["region"]) => 
              setFormData(prev => ({ ...prev, region: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  {region.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetUrl">Target URL (Optional)</Label>
          <Input
            id="targetUrl"
            type="url"
            value={formData.targetUrl || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, targetUrl: e.target.value }))}
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="durationType">Duration Type</Label>
          <Select
            value={formData.durationType}
            onValueChange={(value: AdFormData["durationType"]) => 
              setFormData(prev => ({ ...prev, durationType: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select duration type" />
            </SelectTrigger>
            <SelectContent>
              {DURATION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.startDate}
                onSelect={(date) => date && setFormData(prev => ({ ...prev, startDate: date }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4">
        <div className="text-lg font-semibold">Total Price: ${price.toFixed(2)}</div>
        <p className="text-sm text-muted-foreground mt-1">
          Based on placement, format, region, and duration
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Submit Advertisement"
        )}
      </Button>
    </form>
  )
} 