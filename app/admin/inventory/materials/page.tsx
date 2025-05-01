// app/admin/inventory/materials/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Search, Info } from "lucide-react";
import { MaterialTable } from "@/components/inventory/MaterialTable";
import {
  getMaterials,
  getCategoriesCount,
} from "@/lib/actions/material.action";
import { MaterialModal } from "@/components/inventory/MaterialModal";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function MaterialsPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
  };
}) {
  const query = searchParams?.query || "";
  const materials = await getMaterials(query);
  const categoriesCount = await getCategoriesCount();

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Materials Inventory</h1>
        <div className="flex gap-4">
          <MaterialModal isEdit={false} disabled={categoriesCount === 0} />
          <Link href="/admin/inventory/materials/categories">
            <Button variant="outline">Manage Categories</Button>
          </Link>
        </div>
      </div>

      {categoriesCount === 0 && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>No Categories Found</AlertTitle>
          <AlertDescription>
            Please create at least one category before adding materials.
          </AlertDescription>
        </Alert>
      )}

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search materials..."
          className="pl-8"
          defaultValue={query}
        />
      </div>

      <MaterialTable materials={materials} />
    </div>
  );
}
