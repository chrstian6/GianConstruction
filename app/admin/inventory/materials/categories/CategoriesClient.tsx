"use client";

import { CategoryTable } from "@/components/inventory/CategoryTable";
import { CategoryModal } from "@/components/projects/modals/CategoryModal";
import { getCategories } from "@/lib/actions/category.actions";
import { useEffect, useState } from "react";

export function CategoriesClient() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function loadCategories() {
      const data = await getCategories();
      setCategories(data);
    }
    loadCategories();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Material Categories</h1>
        <CategoryModal categories={categories} />
      </div>
      <CategoryTable categories={categories} />
    </div>
  );
}
