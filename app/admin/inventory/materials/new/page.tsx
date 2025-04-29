import{ MaterialForm }from "@/components/inventory/MaterialForm";
import { getCategories } from "@/lib/actions/category.actions";

export default async function NewMaterialPage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Add New Material</h1>
      <MaterialForm categories={categories} />
    </div>
  );
}
