import React from "react";

type Category =
    | "POLITICS"
    | "BUSINESS"
    | "TECHNOLOGY"
    | "SCIENCE"
    | "HEALTH"
    | "SPORTS"
    | "ENTERTAINMENT"
    | "LIFESTYLE"
    | "WORLD"
    | "EDUCATION"
    | "ENVIRONMENT"
    | "TRAVEL"
    | "FOOD"
    | "FASHION"
    | "ART"
    | "CULTURE"
    | "RELIGION"
    | "CRIME"
    | "OPINION"
    | "ANALYSIS"
    | "LOCAL"
    | "NATIONAL"
    | "GLOBAL"
    | "HISTORY"
    | "WEATHER"
    | "FINANCE"
    | "REAL_ESTATE"
    | "STARTUPS"
    | "AUTOMOTIVE"
    | "CAREER"
    | "LAW"
    | "PHOTOGRAPHY"
    | "VIDEOGRAPHY"
    | "ANIMALS"
    | "AGRICULTURE"
    | "GAMING"
    | "CELEBRITY";

const categories: Category[] = [
    "POLITICS",
    "BUSINESS",
    "TECHNOLOGY",
    "SCIENCE",
    "HEALTH",
    "SPORTS",
    "ENTERTAINMENT",
    "LIFESTYLE",
    "WORLD",
    "EDUCATION",
    "ENVIRONMENT",
    "TRAVEL",
    "FOOD",
    "FASHION",
    "ART",
    "CULTURE",
    "RELIGION",
    "CRIME",
    "OPINION",
    "ANALYSIS",
    "LOCAL",
    "NATIONAL",
    "GLOBAL",
    "HISTORY",
    "WEATHER",
    "FINANCE",
    "REAL_ESTATE",
    "STARTUPS",
    "AUTOMOTIVE",
    "CAREER",
    "LAW",
    "PHOTOGRAPHY",
    "VIDEOGRAPHY",
    "ANIMALS",
    "AGRICULTURE",
    "GAMING",
    "CELEBRITY",
];

const CategorySelect = ({ 
  value, 
  onChange 
}: { 
  value: Category | "", 
  onChange: (value: Category) => void 
}) => {

    const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(event.target.value as Category);
    };

    return (
        <div className="w-full">
            <label
                htmlFor="category"
                className="block  font-medium text-primary mb-2"
            >
                Category
            </label>
            <select
                id="category"
                value={value}
                onChange={handleCategoryChange}
                className="block w-full rounded-md border-primary py-3 px-5 shadow-sm outline-none bg-background sm:text-sm"
            >
                <option value="" disabled>
                    Select a category
                </option>
                {categories.map((category) => (
                    <option key={category} value={category}>
                        {category.charAt(0) + category.slice(1).toLowerCase().replace(/_/g, " ")}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CategorySelect;
