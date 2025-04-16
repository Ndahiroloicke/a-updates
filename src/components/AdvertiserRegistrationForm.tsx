"use client"

import { useState } from "react"
import { CreditCard, Smartphone, DollarSign, ChevronDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { useSession } from "@/app/(main)/SessionProvider"

type FormData = {
  firstName: string
  lastName: string
  workPhone: string
  cellPhone: string
  address: string
  city: string
  stateProvince: string
  country: string
  postalCode: string
  organization: string
  socialMedia: string
  pushNotifications: boolean
  advertisementType: string
  advertisementLocation: string[]
  bestTimeToReach: string
  additionalInfo: string
  paymentType: string
  paymentMethod: string
}

export default function AdvertiserRegistrationForm() {
  const { user } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    workPhone: "",
    cellPhone: "",
    address: "",
    city: "",
    stateProvince: "",
    country: "",
    postalCode: "",
    organization: "",
    socialMedia: "",
    pushNotifications: false,
    advertisementType: "",
    advertisementLocation: [],
    bestTimeToReach: "",
    additionalInfo: "",
    paymentType: "",
    paymentMethod: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    // Required fields validation
    if (!formData.firstName) newErrors.firstName = "First name is required"
    if (!formData.lastName) newErrors.lastName = "Last name is required"
    if (!formData.workPhone) newErrors.workPhone = "Work phone is required"
    if (!formData.address) newErrors.address = "Address is required"
    if (!formData.city) newErrors.city = "City is required"
    if (!formData.stateProvince) newErrors.stateProvince = "State/Province is required"
    if (!formData.country) newErrors.country = "Country is required"
    if (!formData.postalCode) newErrors.postalCode = "Postal code is required"
    if (!formData.organization) newErrors.organization = "Organization name is required"
    if (!formData.advertisementType) newErrors.advertisementType = "Advertisement type is required"
    if (formData.advertisementLocation.length === 0) newErrors.advertisementLocation = "At least one location is required"
    if (!formData.paymentType) newErrors.paymentType = "Payment type is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        variant: "destructive",
        description: "Please fill in all required fields",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Map payment type to match API schema
      const paymentTypeMap = {
        onetime: "oneTime",
        subscription: "subscription",
        free: "free"
      };

      // Create payment session first if not free
      if (formData.paymentType !== "free") {
        const paymentResponse = await fetch("/api/payments/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "advertiser",
            paymentType: paymentTypeMap[formData.paymentType as keyof typeof paymentTypeMap],
          }),
        });

        if (!paymentResponse.ok) {
          const error = await paymentResponse.json();
          throw new Error(error.error || "Payment session creation failed");
        }

        const paymentData = await paymentResponse.json();
        if (paymentData.url) {
          window.location.href = paymentData.url;
          return;
        }
      }

      // If free or payment session creation failed, proceed with registration
      const response = await fetch("/api/advertiser/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          workPhone: formData.workPhone,
          cellPhone: formData.cellPhone || undefined,
          address: formData.address,
          city: formData.city,
          stateProvince: formData.stateProvince,
          country: formData.country,
          postalCode: formData.postalCode,
          organization: formData.organization,
          socialMedia: formData.socialMedia || undefined,
          advertisementType: formData.advertisementType,
          advertisementLocation: formData.advertisementLocation,
          bestTimeToReach: formData.bestTimeToReach || undefined,
          additionalInfo: formData.additionalInfo || undefined,
          paymentType: paymentTypeMap[formData.paymentType as keyof typeof paymentTypeMap],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Registration error details:", error);
        if (response.status === 400 && error.error === "Advertiser profile already exists") {
          toast({
            description: "You are already registered as an advertiser.",
          });
          // Redirect to ad upload form since they're already registered
          setTimeout(() => {
            window.location.href = "/upload-ad";
          }, 1500);
          return;
        }
        throw new Error(error.error || "Registration failed");
      }

      toast({
        description: "Advertiser registration successful! Redirecting to ad upload...",
      });

      // Redirect to ad upload form after successful registration
      setTimeout(() => {
        window.location.href = "/upload-ad";
      }, 1500);

    } catch (error) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "Failed to register. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProgressBar = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {["Personal Information", "Organization Details", "Advertisement Details", "Payment"].map((step, index) => (
            <span
              key={index}
              className={`text-sm font-medium ${
                currentStep >= index + 1 ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Step {index + 1}
            </span>
          ))}
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-600 dark:bg-green-500 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>
    )
  }

  const renderPersonalInfo = () => (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            className={`w-full px-4 py-3 border ${
              errors.firstName ? "border-red-500 dark:border-red-500" : "border-gray-300 dark:border-gray-700"
            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-900 dark:text-white transition-all duration-200`}
            value={formData.firstName}
            onChange={(e) => {
              updateFormData("firstName", e.target.value)
              if (errors.firstName) {
                setErrors({ ...errors, firstName: undefined })
              }
            }}
            placeholder="Enter your first name"
          />
          {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            className={`w-full px-4 py-3 border ${
              errors.lastName ? "border-red-500 dark:border-red-500" : "border-gray-300 dark:border-gray-700"
            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-900 dark:text-white transition-all duration-200`}
            value={formData.lastName}
            onChange={(e) => {
              updateFormData("lastName", e.target.value)
              if (errors.lastName) {
                setErrors({ ...errors, lastName: undefined })
              }
            }}
            placeholder="Enter your last name"
          />
          {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="workPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Work Phone
          </label>
          <input
            id="workPhone"
            type="tel"
            className={`w-full px-4 py-3 border ${
              errors.workPhone ? "border-red-500 dark:border-red-500" : "border-gray-300 dark:border-gray-700"
            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-900 dark:text-white transition-all duration-200`}
            value={formData.workPhone}
            onChange={(e) => {
              updateFormData("workPhone", e.target.value)
              if (errors.workPhone) {
                setErrors({ ...errors, workPhone: undefined })
              }
            }}
            placeholder="Enter your work phone"
          />
          {errors.workPhone && <p className="text-sm text-red-500 mt-1">{errors.workPhone}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="cellPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Cell Phone
          </label>
          <input
            id="cellPhone"
            type="tel"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-900 dark:text-white transition-all duration-200"
            value={formData.cellPhone}
            onChange={(e) => updateFormData("cellPhone", e.target.value)}
            placeholder="Enter your cell phone"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Address
        </label>
        <input
          id="address"
          type="text"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-900 dark:text-white transition-all duration-200"
          value={formData.address}
          onChange={(e) => updateFormData("address", e.target.value)}
          placeholder="Enter your street address"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          City
        </label>
        <input
          id="city"
          type="text"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-900 dark:text-white transition-all duration-200"
          value={formData.city}
          onChange={(e) => updateFormData("city", e.target.value)}
          placeholder="Enter your city"
        />
      </div>
    </div>
  )

  const renderOrganizationDetails = () => (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="stateProvince" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            State/Province
          </label>
          <input
            id="stateProvince"
            type="text"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-900 dark:text-white transition-all duration-200"
            value={formData.stateProvince}
            onChange={(e) => updateFormData("stateProvince", e.target.value)}
            placeholder="Enter your state or province"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Country
          </label>
          <input
            id="country"
            type="text"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-900 dark:text-white transition-all duration-200"
            value={formData.country}
            onChange={(e) => updateFormData("country", e.target.value)}
            placeholder="Enter your country"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Postal Code/ZIP Code
        </label>
        <input
          id="postalCode"
          type="text"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-900 dark:text-white transition-all duration-200"
          value={formData.postalCode}
          onChange={(e) => updateFormData("postalCode", e.target.value)}
          placeholder="Enter your postal or ZIP code"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="organization" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Organization/Company/Business Name
        </label>
        <input
          id="organization"
          type="text"
          className={`w-full px-4 py-3 border ${
            errors.organization ? "border-red-500 dark:border-red-500" : "border-gray-300 dark:border-gray-700"
          } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-900 dark:text-white transition-all duration-200`}
          value={formData.organization}
          onChange={(e) => {
            updateFormData("organization", e.target.value)
            if (errors.organization) {
              setErrors({ ...errors, organization: undefined })
            }
          }}
          placeholder="Enter your organization name"
        />
        {errors.organization && <p className="text-sm text-red-500 mt-1">{errors.organization}</p>}
      </div>
      <div className="space-y-2">
        <label htmlFor="socialMedia" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Social Media URLs
        </label>
        <input
          id="socialMedia"
          type="text"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-900 dark:text-white transition-all duration-200"
          value={formData.socialMedia}
          onChange={(e) => updateFormData("socialMedia", e.target.value)}
          placeholder="Add multiple URLs separated by commas"
        />
      </div>
      <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
        <Checkbox
          id="pushNotifications"
          checked={formData.pushNotifications}
          onCheckedChange={(checked) => updateFormData("pushNotifications", checked)}
          className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
        />
        <label
          htmlFor="pushNotifications"
          className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
        >
          Enable Push Notifications
        </label>
      </div>
    </div>
  )

  const renderAdvertisementDetails = () => (
    <div className="grid gap-6">
      <div className="space-y-2">
        <label htmlFor="advertisementType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Advertisement Type
        </label>
        <div className="relative">
          <select
            id="advertisementType"
            className="w-full appearance-none px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-900 dark:text-white transition-all duration-200 pr-10"
            value={formData.advertisementType}
            onChange={(e) => updateFormData("advertisementType", e.target.value)}
          >
            <option value="">Select type</option>
            <option value="banner">Banner Ads</option>
            <option value="video">Video Ads</option>
            <option value="native">Native Ads</option>
            <option value="sponsored">Sponsored Content</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Advertisement Location</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["Homepage", "Article Pages", "Sidebar", "Mobile App"].map((location) => (
            <div
              key={location}
              className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm hover:border-green-300 dark:hover:border-green-700 transition-all duration-200"
            >
              <Checkbox
                id={location}
                checked={formData.advertisementLocation.includes(location)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateFormData("advertisementLocation", [...formData.advertisementLocation, location])
                  } else {
                    updateFormData(
                      "advertisementLocation",
                      formData.advertisementLocation.filter((l) => l !== location),
                    )
                  }
                }}
                className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
              />
              <label htmlFor={location} className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                {location}
              </label>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="bestTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Best Time to Reach You
        </label>
        <div className="relative">
          <select
            id="bestTime"
            className="w-full appearance-none px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-900 dark:text-white transition-all duration-200 pr-10"
            value={formData.bestTimeToReach}
            onChange={(e) => updateFormData("bestTimeToReach", e.target.value)}
          >
            <option value="">Select time</option>
            <option value="morning">Morning (9AM - 12PM)</option>
            <option value="afternoon">Afternoon (12PM - 5PM)</option>
            <option value="evening">Evening (5PM - 8PM)</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Additional Information
        </label>
        <textarea
          id="additionalInfo"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-900 dark:text-white min-h-[120px] transition-all duration-200"
          value={formData.additionalInfo}
          onChange={(e) => updateFormData("additionalInfo", e.target.value)}
          placeholder="Any additional information about your advertising needs..."
        />
      </div>
    </div>
  )

  const renderPayment = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Payment Options</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className={`relative p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
              formData.paymentType === "onetime"
                ? "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400"
                : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md"
            }`}
            onClick={() => updateFormData("paymentType", "onetime")}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400">
                <DollarSign size={20} />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">One-time Payment</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pay once and get full access</p>
            </div>
            {formData.paymentType === "onetime" && (
              <div className="absolute top-3 right-3 w-4 h-4 bg-green-500 dark:bg-green-400 rounded-full"></div>
            )}
          </div>

          <div
            className={`relative p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
              formData.paymentType === "subscription"
                ? "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400"
                : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md"
            }`}
            onClick={() => updateFormData("paymentType", "subscription")}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400">
                <CreditCard size={20} />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">Monthly Subscription</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pay monthly for continued access</p>
            </div>
            {formData.paymentType === "subscription" && (
              <div className="absolute top-3 right-3 w-4 h-4 bg-green-500 dark:bg-green-400 rounded-full"></div>
            )}
          </div>

          <div
            className={`relative p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
              formData.paymentType === "free"
                ? "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400"
                : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md"
            }`}
            onClick={() => updateFormData("paymentType", "free")}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v20M2 12h20" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">No Payment (Free)</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Limited access to basic features</p>
            </div>
            {formData.paymentType === "free" && (
              <div className="absolute top-3 right-3 w-4 h-4 bg-green-500 dark:bg-green-400 rounded-full"></div>
            )}
          </div>
        </div>
      </div>

      {formData.paymentType && formData.paymentType !== "free" && (
        <div className="space-y-4 mt-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-md">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Payment Method</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                formData.paymentMethod === "mobile"
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400"
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md"
              }`}
              onClick={() => updateFormData("paymentMethod", "mobile")}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400">
                  <Smartphone size={16} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Mobile Money</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">For African clients</p>
                </div>
              </div>
              {formData.paymentMethod === "mobile" && (
                <div className="absolute top-3 right-3 w-4 h-4 bg-green-500 dark:bg-green-400 rounded-full"></div>
              )}
            </div>

            <div
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                formData.paymentMethod === "card"
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400"
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md"
              }`}
              onClick={() => updateFormData("paymentMethod", "card")}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400">
                  <CreditCard size={16} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">PayPal/Card</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Credit/Debit card or PayPal</p>
                </div>
              </div>
              {formData.paymentMethod === "card" && (
                <div className="absolute top-3 right-3 w-4 h-4 bg-green-500 dark:bg-green-400 rounded-full"></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfo()
      case 2:
        return renderOrganizationDetails()
      case 3:
        return renderAdvertisementDetails()
      case 4:
        return renderPayment()
      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-black shadow-xl dark:shadow-2xl rounded-xl overflow-hidden transition-all duration-300">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Advertiser Registration</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Complete the form to register as an advertiser</p>
      </div>
      <div className="p-6">
        {renderProgressBar()}
        {renderCurrentStep()}
        <div className="flex justify-between mt-8">
          <button
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              currentStep === 1
                ? "text-gray-400 bg-gray-100 dark:text-gray-500 dark:bg-gray-800 cursor-not-allowed"
                : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-800 hover:shadow-sm"
            }`}
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </button>
          {currentStep === 4 ? (
            <button
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 transform hover:translate-y-[-1px] hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit"
              )}
            </button>
          ) : (
            <button
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 transform hover:translate-y-[-1px] hover:shadow-md"
              onClick={handleNext}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

