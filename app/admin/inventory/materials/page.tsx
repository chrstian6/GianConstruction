import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import{ MaterialTable} from "@/components/inventory/MaterialTable";
import { getMaterials } from "@/lib/actions/material.action";

export default async function MaterialsPage() {
  const materials = await getMaterials();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Materials Inventory</h1>
        <div className="flex gap-4">
          <Link href="/admin/inventory/materials/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Material
            </Button>
          </Link>
          <Link href="/admin/inventory/materials/categories">
            <Button variant="outline">Manage Categories</Button>
          </Link>
        </div>
      </div>

      <MaterialTable materials={materials} />
    </div>
  );
}
