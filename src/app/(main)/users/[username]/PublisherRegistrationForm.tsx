"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import LoadingButton from "@/components/LoadingButton";
import { useToast } from "@/components/ui/use-toast";

const publisherFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  workPhone: z.string().min(1, "Work phone is required"),
  cellPhone: z.string().min(1, "Cell phone is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  stateProvince: z.string().min(1, "State/Province is required"),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().min(1, "Postal/ZIP code is required"),
  companyName: z.string().min(1, "Company/Business name is required"),
  socialMediaUrl: z.string().url("Please enter a valid URL"),
  pressReleaseFrequency: z.string().min(1, "Press release frequency is required"),
  productsOfInterest: z.array(z.string()).min(1, "Select at least one product"),
  bestTimeToReach: z.string().min(1, "Best time to reach is required"),
  additionalInfo: z.string(),
  paymentType: z.enum(["oneTime", "subscription", "free"]),
});

type PublisherFormValues = z.infer<typeof publisherFormSchema>;

export default function PublisherRegistrationForm() {
  const { toast } = useToast();
  const form = useForm<PublisherFormValues>({
    resolver: zodResolver(publisherFormSchema),
    defaultValues: {
      productsOfInterest: [],
    },
  });

  async function onSubmit(data: PublisherFormValues) {
    try {
      // Handle form submission here
      console.log(data);
      toast({
        description: "Publisher registration submitted successfully!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="First name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="workPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Work phone" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cellPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cell Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Cell phone" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Street address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="City" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stateProvince"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State/Province</FormLabel>
                <FormControl>
                  <Input placeholder="State/Province" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal/ZIP Code</FormLabel>
                <FormControl>
                  <Input placeholder="Postal/ZIP code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company/Business Name</FormLabel>
              <FormControl>
                <Input placeholder="Company name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="socialMediaUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Social Media URL</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pressReleaseFrequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Press Release Frequency</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Weekly, Monthly" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bestTimeToReach"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Best Time to Reach</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Morning, Afternoon" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="productsOfInterest"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Products of Interest</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-4">
                  {["Communications", "Analytics", "Data", "Monitoring/Research Data"].map((product) => (
                    <label key={product} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={field.value.includes(product)}
                        onChange={(e) => {
                          const value = field.value || [];
                          if (e.target.checked) {
                            field.onChange([...value, product]);
                          } else {
                            field.onChange(value.filter((v) => v !== product));
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span>{product}</span>
                    </label>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="oneTime" id="oneTime" />
                    <label htmlFor="oneTime">One-time Payment</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="subscription" id="subscription" />
                    <label htmlFor="subscription">Monthly Subscription</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="free" id="free" />
                    <label htmlFor="free">No Payment (Free)</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="additionalInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Information</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional information..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <LoadingButton
          type="submit"
          loading={form.formState.isSubmitting}
          className="w-full"
        >
          Submit Registration
        </LoadingButton>
      </form>
    </Form>
  );
}