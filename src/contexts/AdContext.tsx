"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AdOverlay from "@/components/ads/AdOverlay";

interface AdContextType {
  showAd: (adData: any) => void;
  hideAd: () => void;
  currentAd: any | null;
  isAdVisible: boolean;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

// Sample ads array - you can move this to a separate file
const ADS = [
  {
    imageUrl: "/mtn-mobile-money.jpg",
    backgroundColor: "#FFD700", // MTN Yellow
    borderColor: "#FFD700",
    duration: 8000,
    title: "MTN Mobile Money",
    subtitle: "Send Money Instantly, Anywhere, Anytime",
    features: [
      "✓ Safe & Secure Transactions",
      "✓ No Hidden Fees",
      "✓ Available Nationwide"
    ]
  },
  {
    imageUrl: "/medical.png",
    backgroundColor: "#FF69B4", // Pink
    borderColor: "#FF69B4",
    duration: 8000,
    title: "Medical Kenya",
    subtitle: "Your Health, Our Priority",
    features: [
      "✓ 24/7 Medical Assistance",
      "✓ Expert Healthcare Professionals",
      "✓ Nationwide Coverage"
    ]
  },
  {
    imageUrl: "/general.jpg",
    backgroundColor: "#4169E1", // Royal Blue
    borderColor: "#4169E1",
    duration: 8000,
    title: "General Insurance",
    subtitle: "Secure Your Future Today",
    features: [
      "✓ Comprehensive Coverage",
      "✓ Flexible Payment Plans",
      "✓ Quick Claim Processing"
    ]
  },
  {
    imageUrl: "/sasol.jpg",
    backgroundColor: "#228B22", // Forest Green
    borderColor: "#228B22",
    duration: 8000,
    title: "Sasol Energy",
    subtitle: "Powering Africa's Future",
    features: [
      "✓ Sustainable Energy Solutions",
      "✓ Environmental Responsibility",
      "✓ Innovation & Technology"
    ]
  }
];

const MTN_THEME = {
  primaryColor: "#FFD700", // MTN Yellow
  secondaryColor: "#000000", // Black
  borderWidth: "8px",
};

export const AdProvider = ({ children }: { children: ReactNode }) => {
  const [currentAd, setCurrentAd] = useState<any | null>(null);
  const [isAdVisible, setIsAdVisible] = useState(false);
  const [adIndex, setAdIndex] = useState(0);
  
  // Temporarily disable ad functionality
  const isAdSystemEnabled = true;

  const showAd = (adData: any) => {
    if (!isAdSystemEnabled) return;
    setCurrentAd(adData);
    setIsAdVisible(true);
  };

  const hideAd = () => {
    if (!isAdSystemEnabled) return;
    setIsAdVisible(false);
    setTimeout(() => {
      setCurrentAd(null);
      setAdIndex((prevIndex) => (prevIndex + 1) % ADS.length);
    }, 500);
  };

  useEffect(() => {
    if (!isAdSystemEnabled) return;

    const showNextAd = () => {
      showAd(ADS[adIndex]);
      setTimeout(hideAd, 15000); // Duration each ad is shown (15 seconds)
    };

    // Wait 30 seconds before showing first ad
    const initialTimeout = setTimeout(showNextAd, 30000);
    
    // Show next ad every 1 minute (60000 milliseconds)
    const interval = setInterval(showNextAd, 60000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [adIndex]);

  return (
    <AdContext.Provider value={{ showAd, hideAd, currentAd, isAdVisible }}>
      <div className="min-h-screen flex flex-col">
        {isAdSystemEnabled && currentAd && (
          <AdOverlay adData={currentAd} isVisible={isAdVisible} />
        )}
        {children}
      </div>
    </AdContext.Provider>
  );
};

export const useAd = () => {
  const context = useContext(AdContext);
  if (context === undefined) {
    throw new Error("useAd must be used within an AdProvider");
  }
  return context;
}; 