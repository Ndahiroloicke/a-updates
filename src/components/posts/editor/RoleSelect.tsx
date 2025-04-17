import React from "react";

type Category = "ADMIN" | "USER";

const categories: Category[] = ["ADMIN", "USER"];

const RoleSelect = ({
  value,
  onChange,
}: {
  value: any;
  onChange: (value: any) => void;
}) => {
  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    onChange(event.target.value as Category);
  };

  return (
    <div className="w-full">
      <label htmlFor="category" className="mb-2 block font-medium text-primary">
        Role
      </label>
      <select
        id="category"
        value={value}
        onChange={handleCategoryChange}
        className="block w-full rounded-md border-primary bg-background px-5 py-3 shadow-sm outline-none sm:text-sm"
      >
        <option value="" disabled>
          Select a role
        </option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category.charAt(0) +
              category.slice(1).toLowerCase().replace(/_/g, " ")}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RoleSelect;
