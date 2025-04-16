"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AdRegion, AdPlacement, AdFormat, AdDurationType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

// Base prices for different placements (in USD)
const PLACEMENT_PRICES = {
  [AdPlacement.RIGHT_COLUMN_TOP]: 100,
  [AdPlacement.RIGHT_COLUMN_MIDDLE]: 80,
  [AdPlacement.RIGHT_COLUMN_BOTTOM]: 60,
  [AdPlacement.BELOW_FOOTER]: 40,
  [AdPlacement.IN_FEED]: 120,
  [AdPlacement.FULL_PAGE_TAKEOVER]: 200,
};

// Format multipliers
const FORMAT_MULTIPLIERS = {
  [AdFormat.BANNER]: 1,
  [AdFormat.SIDEBAR]: 1.2,
  [AdFormat.IN_FEED]: 1.5,
  [AdFormat.FULL_PAGE]: 2,
  [AdFormat.MOBILE]: 0.8,
};

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  description: z.string().min(1, "Description is required"),
  region: z.nativeEnum(AdRegion),
  placement: z.nativeEnum(AdPlacement),
  format: z.nativeEnum(AdFormat),
  duration: z.string().min(1, "Duration is required"),
  durationType: z.nativeEnum(AdDurationType),
  startDate: z.string().min(1, "Start date is required"),
  targetUrl: z.string().url("Invalid target URL"),
});

type FormData = z.infer<typeof formSchema>;

const placementDescriptions = {
  [AdPlacement.RIGHT_COLUMN_TOP]: "Top of the right sidebar - highest visibility",
  [AdPlacement.RIGHT_COLUMN_MIDDLE]: "Middle of the right sidebar - good visibility",
  [AdPlacement.RIGHT_COLUMN_BOTTOM]: "Bottom of the right sidebar - moderate visibility",
  [AdPlacement.BELOW_FOOTER]: "Below the page footer - budget-friendly option",
  [AdPlacement.IN_FEED]: "Integrated within the content feed - natural placement",
  [AdPlacement.FULL_PAGE_TAKEOVER]: "Full-page takeover - maximum impact (5 seconds)",
};

const formatDescriptions = {
  [AdFormat.BANNER]: "Standard banner advertisement",
  [AdFormat.SIDEBAR]: "Optimized for sidebar placement",
  [AdFormat.IN_FEED]: "Native-looking ad within content",
  [AdFormat.FULL_PAGE]: "Full-page advertisement",
  [AdFormat.MOBILE]: "Mobile-optimized format",
};

export default function AdvertisementForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      description: "",
      region: AdRegion.LOCAL,
      placement: AdPlacement.RIGHT_COLUMN_TOP,
      format: AdFormat.BANNER,
      duration: "7",
      durationType: AdDurationType.DAYS,
      startDate: new Date().toISOString().split('T')[0],
      targetUrl: "",
    },
  });

  const calculatePrice = () => {
    const placement = form.watch("placement");
    const format = form.watch("format");
    const region = form.watch("region");
    const basePrice = PLACEMENT_PRICES[placement] || 0;
    const formatMultiplier = FORMAT_MULTIPLIERS[format] || 1;
    const regionMultiplier = region === AdRegion.ALL_AFRICA ? 2 : region === AdRegion.MULTI_COUNTRY ? 1.5 : 1;
    return (basePrice * formatMultiplier * regionMultiplier).toFixed(2);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (!file) {
        toast({
          title: "Error",
          description: "Please select an advertisement media file",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", data.name);
      formData.append("type", data.type);
      formData.append("description", data.description);
      formData.append("region", data.region);
      formData.append("placement", data.placement);
      formData.append("format", data.format);
      formData.append("duration", data.duration);
      formData.append("durationType", data.durationType);
      formData.append("startDate", data.startDate);
      formData.append("targetUrl", data.targetUrl);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit advertisement");
      }

      const result = await response.json();
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        toast({
          title: "Error",
          description: "No payment URL received",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting advertisement:", error);
      toast({
        title: "Error",
        description: "Failed to submit advertisement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="p-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Advertisement Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your advertisement name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Advertisement Type</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter advertisement type" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a description for your advertisement"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Region</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a region" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(AdRegion).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {value.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="placement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Advertisement Placement</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select placement location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(AdPlacement).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          <div>
                            <div className="font-medium">{value.replace(/_/g, " ")}</div>
                            <div className="text-sm text-gray-500">{placementDescriptions[value]}</div>
                            <div className="text-sm font-medium text-green-600">
                              Base price: ${PLACEMENT_PRICES[value]}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Advertisement Format</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(AdFormat).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          <div>
                            <div className="font-medium">{value.replace(/_/g, " ")}</div>
                            <div className="text-sm text-gray-500">{formatDescriptions[value]}</div>
                            <div className="text-sm font-medium text-green-600">
                              Multiplier: {FORMAT_MULTIPLIERS[value]}x
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Advertisement Media</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormField
              control={form.control}
              name="targetUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter the destination URL for your advertisement"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="durationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(AdDurationType).map(([key, value]) => (
                          <SelectItem key={key} value={value}>
                            {value.toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <Card className="p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Pricing Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Base Price:</span>
              <span>${PLACEMENT_PRICES[form.watch("placement")]}</span>
            </div>
            <div className="flex justify-between">
              <span>Format Multiplier:</span>
              <span>{FORMAT_MULTIPLIERS[form.watch("format")]}x</span>
            </div>
            <div className="flex justify-between">
              <span>Region Multiplier:</span>
              <span>
                {form.watch("region") === AdRegion.ALL_AFRICA
                  ? "2x"
                  : form.watch("region") === AdRegion.MULTI_COUNTRY
                  ? "1.5x"
                  : "1x"}
              </span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
              <span>Total Price:</span>
              <span>${calculatePrice()}</span>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Advertisement"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 