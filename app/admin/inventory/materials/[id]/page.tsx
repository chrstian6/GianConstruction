import { notFound } from "next/navigation";
import{ MaterialForm } from "@/components/inventory/MaterialForm";
import { getMaterialById } from "@/lib/actions/material.action";
import { getCategories } from "@/lib/actions/category.actions";

export default async function MaterialPage({ params }: { params: { id: string } }) {
  const material = await getMaterialById(params.id);
  const categories = await getCategories();

  if (!material) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Material</h1>
      <MaterialForm 
        initialData={material} 
        categories={categories} 
        isEdit 
      />
    </div>
  );
}