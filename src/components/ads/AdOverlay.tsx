"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface AdData {
  imageUrl: string;
  backgroundColor: string;
  borderColor: string;
  title: string;
  subtitle: string;
  features?: string[];
  duration?: number;
}

interface AdOverlayProps {
  adData: AdData;
  isVisible: boolean;
}

export default function AdOverlay({ adData, isVisible }: AdOverlayProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const features = adData.features || [];

  // Preload the image
  useEffect(() => {
    if (adData.imageUrl) {
      const img = new Image();
      img.src = adData.imageUrl;
      img.onload = () => setImageLoaded(true);
      img.onerror = () => console.error("Failed to load ad image");
    }
  }, [adData.imageUrl]);

  const shouldShowAd = isVisible && imageLoaded;

  // Add scroll effect
  useEffect(() => {
    if (shouldShowAd) {
      // Remove sticky header
      const header = document.querySelector('header');
      if (header) {
        header.classList.remove('sticky', 'top-0');
      }
    }

    return () => {
      // Restore sticky header when ad is removed
      const header = document.querySelector('header');
      if (header) {
        header.classList.add('sticky', 'top-0');
      }
    };
  }, [shouldShowAd]);

  return (
    <AnimatePresence>
      {shouldShowAd && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full sticky top-0 z-50"
          style={{ backgroundColor: adData.backgroundColor }}
        >
          {/* Left Border */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-2"
            style={{ backgroundColor: adData.borderColor }}
          />

          {/* Right Border */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-2"
            style={{ backgroundColor: adData.borderColor }}
          />

          {/* Top Border */}
          <div 
            className="w-full h-2" 
            style={{ backgroundColor: adData.borderColor }}
          />

          {/* Ad Content */}
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="relative w-full flex items-center justify-between">
              {/* Left side - Image */}
              <div className="w-1/3 flex items-center justify-center">
                <img
                  src={adData.imageUrl}
                  alt={`${adData.title} Advertisement`}
                  className="max-h-[200px] w-auto object-contain"
                />
              </div>

              {/* Right side - Text Content */}
              <div className="w-2/3 pl-8 text-black">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <h2 className="text-4xl font-bold">
                    {adData.title}
                  </h2>
                  <p className="text-2xl">
                    {adData.subtitle}
                  </p>
                  {features.length > 0 && (
                    <ul className="text-xl space-y-2">
                      {features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Bottom Border */}
          <div 
            className="w-full h-2" 
            style={{ backgroundColor: adData.borderColor }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
} 