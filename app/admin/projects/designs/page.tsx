"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { SubmitHandler } from "react-hook-form";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DesignForm } from "@/components/projects/DesignForm";
import { Search, Filter, Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

interface Design {
  _id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  style: string;
  sqm: number;
  rooms: number;
  estimatedCost: number;
  isFeatured?: boolean;
}

export default function ProjectDesignsPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [styleFilter, setStyleFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const response = await fetch("/api/admin/projects/designs");
        if (response.ok) {
          const data = await response.json();
          // Ensure designs is always an array
          setDesigns(Array.isArray(data) ? data : []);
        } else {
          throw new Error("Failed to fetch designs");
        }
      } catch (error) {
        toast.error("Failed to load designs");
        setDesigns([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchDesigns();
  }, []);

  interface FormValues {
    title: string;
    description: string;
    image: string;
    category: string;
    style: string;
    sqm: number;
    rooms: number;
    estimatedCost: number;
    isFeatured?: boolean;
  }

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/projects/designs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create design");
      }

      const { data: newDesign } = await response.json();
      // Handle success
    } catch (error) {
      if (error instanceof Error && error.message.includes("timeout")) {
        toast.error("Request timed out. Please try again.");
      } else if (
        error instanceof Error &&
        error.message.includes("connection")
      ) {
        toast.error("Database unavailable. Please try again later.");
      } else {
        toast.error(
          error instanceof Error ? error.message : "An error occurred"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDesigns = designs.filter((design) => {
    const matchesSearch =
      design.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      design.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter
      ? design.category === categoryFilter
      : true;
    const matchesStyle = styleFilter ? design.style === styleFilter : true;

    return matchesSearch && matchesCategory && matchesStyle;
  });

  const categories = Array.from(
    new Set(designs.map((design) => design.category).filter(Boolean))
  );
  const styles = Array.from(
    new Set(designs.map((design) => design.style).filter(Boolean))
  );

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/projects/designs/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDesigns(designs.filter((design) => design._id !== id));
        toast.success("Design deleted successfully");
      } else {
        throw new Error("Failed to delete design");
      }
    } catch (error) {
      toast.error("Error deleting design");
      console.error("Delete error:", error);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setStyleFilter("");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Project Design Catalog
          </h1>
          <p className="text-muted-foreground">
            Manage design templates for your construction projects
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Design
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Design</DialogTitle>
            </DialogHeader>
            <DesignForm
              onSubmit={handleSubmit}
              onCancel={() => setIsModalOpen(false)}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search designs..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={categoryFilter || "all"}
          onValueChange={(value) =>
            setCategoryFilter(value === "all" ? "" : value)
          }
        >
          <SelectTrigger>
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="All Categories" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={styleFilter || "all"}
          onValueChange={(value) =>
            setStyleFilter(value === "all" ? "" : value)
          }
        >
          <SelectTrigger>
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="All Styles" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Styles</SelectItem>
            {styles.map((style) => (
              <SelectItem key={style} value={style}>
                {style}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Designs Grid */}
      {filteredDesigns.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDesigns.map((design) => (
            <Card
              key={design._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                  <Image
                    src={design.image}
                    alt={design.title}
                    fill
                    className="rounded-t-lg object-cover"
                    priority={false}
                  />
                  {design.isFeatured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                      Featured
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <CardTitle>{design.title}</CardTitle>
                <CardDescription className="mt-2 line-clamp-2">
                  {design.description}
                </CardDescription>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p>{design.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Style</p>
                    <p>{design.style}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Area</p>
                    <p>{design.sqm} sqm</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Est. Cost</p>
                    <p>${design.estimatedCost.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/admin/projects/designs/${design._id}`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/admin/projects/new?designId=${design._id}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDelete(design._id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">
            {designs.length === 0
              ? "No designs available"
              : "No designs match your filters"}
          </h3>
          <p className="text-muted-foreground text-center mb-4">
            {designs.length === 0
              ? "Get started by adding your first design"
              : "Try adjusting your search or filter criteria"}
          </p>
          {designs.length === 0 ? (
            <Button asChild>
              <Link href="/admin/projects/designs/new">
                <Plus className="mr-2 h-4 w-4" />
                Add New Design
              </Link>
            </Button>
          ) : (
            <Button variant="outline" onClick={clearFilters}>
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
