import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { Button } from "@/components/ui/button";
  import Link from "next/link";
  import { Eye, Pencil, Trash2 } from "lucide-react";
  import { deleteMaterial } from "@/lib/actions/material.action";
  import { toast } from "sonner";
  import Image from "next/image";
  
  interface Material {
    _id: string;
    name: string;
    category: {
      name: string;
    };
    price: number;
    stock: number;
    unit: string;
    sku?: string;
    images?: Array<{ url: string }>;
    isActive: boolean;
  }
  
  interface MaterialTableProps {
    materials: Material[];
  }
  
  export function MaterialTable({ materials }: MaterialTableProps) {
    const handleDelete = async (id: string) => {
      try {
        const result = await deleteMaterial(id);
        if (result?.success) {
          toast.success("Material deleted successfully");
          window.location.reload();
        } else {
          toast.error(result?.message || "Failed to delete material");
        }
      } catch (error) {
        toast.error("Something went wrong");
      }
    };
  
    return (
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((material) => (
              <TableRow key={material._id}>
                <TableCell>
                  {material.images?.[0]?.url ? (
                    <div className="relative aspect-square w-10 h-10">
                      <Image
                        src={material.images[0].url}
                        alt={material.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{material.name}</TableCell>
                <TableCell>{material.category.name}</TableCell>
                <TableCell>${material.price.toFixed(2)}</TableCell>
                <TableCell>{material.stock}</TableCell>
                <TableCell>{material.unit}</TableCell>
                <TableCell>{material.sku || "-"}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      material.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {material.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link href={`/admin/inventory/materials/${material._id}`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(material._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }