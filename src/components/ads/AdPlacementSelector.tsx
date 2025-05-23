"use client";

import { useState, useEffect } from "react";
import { AdPlacement, AdFormat, AdRegion } from "@prisma/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

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

// Region multipliers
const REGION_MULTIPLIERS = {
  [AdRegion.LOCAL]: 1,
  [AdRegion.MULTI_COUNTRY]: 1.5,
  [AdRegion.ALL_AFRICA]: 2,
};

const REGION_LABELS = {
  [AdRegion.LOCAL]: "Local (Single Country)",
  [AdRegion.MULTI_COUNTRY]: "Multi-Country",
  [AdRegion.ALL_AFRICA]: "All African Countries",
};

interface AdPlacementSelectorProps {
  onPlacementChange: (placement: AdPlacement) => void;
  onFormatChange: (format: AdFormat) => void;
  region: AdRegion;
  className?: string;
}

export default function AdPlacementSelector({
  onPlacementChange,
  onFormatChange,
  region,
  className = "",
}: AdPlacementSelectorProps) {
  const [selectedPlacement, setSelectedPlacement] = useState<AdPlacement>(
    AdPlacement.RIGHT_COLUMN_TOP,
  );
  const [selectedFormat, setSelectedFormat] = useState<AdFormat>(
    AdFormat.BANNER,
  );
  const [price, setPrice] = useState<number>(0);

  useEffect(() => {
    const basePrice = PLACEMENT_PRICES[selectedPlacement];
    const formatMultiplier = FORMAT_MULTIPLIERS[selectedFormat];
    const regionMultiplier = REGION_MULTIPLIERS[region];
    const calculatedPrice = basePrice * formatMultiplier * regionMultiplier;
    setPrice(calculatedPrice);
  }, [selectedPlacement, selectedFormat, region]);

  const handlePlacementChange = (value: AdPlacement) => {
    setSelectedPlacement(value);
    onPlacementChange(value);
  };

  const handleFormatChange = (value: AdFormat) => {
    setSelectedFormat(value);
    onFormatChange(value);
  };

  const placementDescriptions = {
    [AdPlacement.RIGHT_COLUMN_TOP]:
      "Top of the right sidebar - highest visibility",
    [AdPlacement.RIGHT_COLUMN_MIDDLE]:
      "Middle of the right sidebar - good visibility",
    [AdPlacement.RIGHT_COLUMN_BOTTOM]:
      "Bottom of the right sidebar - moderate visibility",
    [AdPlacement.BELOW_FOOTER]:
      "Below the page footer - budget-friendly option",
    [AdPlacement.IN_FEED]:
      "Integrated within the content feed - natural placement",
    [AdPlacement.FULL_PAGE_TAKEOVER]:
      "Full-page takeover - maximum impact (5 seconds)",
  };

  const formatDescriptions = {
    [AdFormat.BANNER]: "Standard banner advertisement",
    [AdFormat.SIDEBAR]: "Optimized for sidebar placement",
    [AdFormat.IN_FEED]: "Native-looking ad within content",
    [AdFormat.FULL_PAGE]: "Full-page advertisement",
    [AdFormat.MOBILE]: "Mobile-optimized format",
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h3 className="mb-4 text-lg font-semibold">Select Ad Placement</h3>
        <RadioGroup
          defaultValue={selectedPlacement}
          onValueChange={(value) => handlePlacementChange(value as AdPlacement)}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {Object.entries(AdPlacement).map(([key, value]) => (
            <Card
              key={key}
              className={`cursor-pointer p-4 transition-all ${
                selectedPlacement === value
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : ""
              }`}
            >
              <RadioGroupItem
                value={value}
                id={`placement-${value}`}
                className="sr-only"
              />
              <Label htmlFor={`placement-${value}`} className="cursor-pointer">
                <div className="font-medium">{value.replace(/_/g, " ")}</div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {placementDescriptions[value]}
                </div>
                <div className="mt-2 text-sm font-semibold text-green-600 dark:text-green-400">
                  Base price: ${PLACEMENT_PRICES[value]}
                </div>
              </Label>
            </Card>
          ))}
        </RadioGroup>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Select Ad Format</h3>
        <RadioGroup
          defaultValue={selectedFormat}
          onValueChange={(value) => handleFormatChange(value as AdFormat)}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {Object.entries(AdFormat).map(([key, value]) => (
            <Card
              key={key}
              className={`cursor-pointer p-4 transition-all ${
                selectedFormat === value
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : ""
              }`}
            >
              <RadioGroupItem
                value={value}
                id={`format-${value}`}
                className="sr-only"
              />
              <Label htmlFor={`format-${value}`} className="cursor-pointer">
                <div className="font-medium">{value.replace(/_/g, " ")}</div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {formatDescriptions[value]}
                </div>
                <div className="mt-2 text-sm font-semibold text-green-600 dark:text-green-400">
                  Multiplier: {FORMAT_MULTIPLIERS[value]}x
                </div>
              </Label>
            </Card>
          ))}
        </RadioGroup>
      </div>

      <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <h3 className="mb-2 text-lg font-semibold">Pricing Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Base Price:</span>
            <span>${PLACEMENT_PRICES[selectedPlacement]}</span>
          </div>
          <div className="flex justify-between">
            <span>Format Multiplier:</span>
            <span>{FORMAT_MULTIPLIERS[selectedFormat]}x</span>
          </div>
          <div className="flex justify-between">
            <span>Region Multiplier:</span>
            <span>{REGION_MULTIPLIERS[region]}x</span>
          </div>
          <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
            <span>Total Price:</span>
            <span>${price.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
