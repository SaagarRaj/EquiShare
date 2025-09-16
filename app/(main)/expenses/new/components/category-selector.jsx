"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import { SelectTrigger, SelectValue } from "@radix-ui/react-select";

const CategorySelector = ({ categories, onChange }) => {
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);

    // Only call onChange if it exist and the value has changed
    if (onChange && categoryId !== selectedCategory) {
      onChange(categoryId);
    }
  };

  useEffect(() => {
    //If no categories or empty categories are selected
    if (!categories || categories.length === 0) {
      return <div>No categories available</div>;
    }

    //Set default value if not already set
    if (!selectedCategory && categories.length > 0) {
      //Find a default category or use the first one
      const defaultCategory =
        categories.find((cat) => cat.isDefault) || categories[0];

      //Set the default value without triggering the rerender loop
      setTimeout(() => {
        setSelectedCategory(defaultCategory.id);
        if (onChange) {
          onChange(defaultCategory.id);
        }
      }, 0);
    }
  }, []);

  return (
    <Select value={selectedCategory} onValueChange={handleCategoryChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            <div className="flex items-center gap-2">
              <span>{category.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CategorySelector;
