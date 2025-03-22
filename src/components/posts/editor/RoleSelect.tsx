import React from "react";

type Category =
    | "ADMIN"
    | "USER"
  ;

const categories: Category[] = [
    "ADMIN",
    "USER"
];

const RoleSelect = ({ value, onChange }: { value: any, onChange: (value: any) => void }) => {

    const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(event.target.value as Category);
    };

    return (
        <div className="w-full">
            <label
                htmlFor="category"
                className="block  font-medium text-primary mb-2"
            >
                Role
            </label>
            <select
                id="category"
                value={value}
                onChange={handleCategoryChange}
                className="block w-full rounded-md border-primary py-3 px-5 shadow-sm outline-none bg-background sm:text-sm"
            >
                <option value="" disabled>
                    Select a role
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

export default RoleSelect;
