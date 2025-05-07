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
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DesignForm } from "@/components/projects/modals/DesignForm";
import { Search, Filter, Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

interface Design {
  _id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  style: string;
  sqm: number;
  rooms: number;
  estimatedCost: number;
  isFeatured?: boolean;
  materials?: { name: string; quantity: number; unitPrice: number }[];
}

export default function ProjectDesignsPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [styleFilter, setStyleFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [designToDelete, setDesignToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const response = await fetch("/api/admin/projects/designs");
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched designs:", data.data);
          setDesigns(Array.isArray(data.data) ? data.data : []);
        } else {
          throw new Error("Failed to fetch designs");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load designs", {
          position: "bottom-right",
          duration: 5000,
          dismissible: true,
          richColors: true,
        });
        setDesigns([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDesigns();
  }, []);

  interface FormValues {
    title: string;
    description: string;
    images?: string[];
    category: string;
    style: string;
    sqm: number;
    rooms: number;
    estimatedCost: number;
    isFeatured?: boolean;
    materials?: { name: string; quantity: number; unitPrice: number }[];
  }

  const handleSubmit: SubmitHandler<FormValues> = async (values) => {
    setIsSubmitting(true);
    try {
      console.log("Starting design submission:", values);

      // Validate URLs if images are provided
      if (values.images && values.images.length > 0) {
        const isValidUrl = (url: string) => {
          try {
            new URL(url);
            return true;
          } catch {
            return false;
          }
        };
        const invalidUrls = values.images.filter((url) => !isValidUrl(url));
        if (invalidUrls.length > 0) {
          throw new Error(`Invalid image URLs: ${invalidUrls.join(", ")}`);
        }
      }

      const response = await fetch("/api/admin/projects/designs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData);
        throw new Error(errorData.error || "Failed to create design");
      }

      const result = await response.json();
      const newDesign = result.data;
      console.log("Design saved successfully:", newDesign);

      setDesigns((prevDesigns) => [newDesign, ...prevDesigns]);
      setIsModalOpen(false);
      toast.success("Design created successfully", {
        position: "bottom-right",
        duration: 5000,
        dismissible: true,
        richColors: true,
      });
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create design",
        {
          position: "bottom-right",
          duration: 5000,
          dismissible: true,
          richColors: true,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/projects/designs/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDesigns(designs.filter((design) => design._id !== id));
        toast.success("Design deleted successfully", {
          position: "bottom-right",
          duration: 5000,
          dismissible: true,
          richColors: true,
        });
      } else {
        throw new Error("Failed to delete design");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete design",
        {
          position: "bottom-right",
          duration: 5000,
          dismissible: true,
          richColors: true,
        }
      );
    } finally {
      setIsDeleteModalOpen(false);
      setDesignToDelete(null);
    }
  };

  const openDeleteModal = (id: string) => {
    setDesignToDelete(id);
    setIsDeleteModalOpen(true);
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
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white backdrop-blur-sm">
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

      {filteredDesigns.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDesigns.map((design) => (
            <Card
              key={design._id}
              className="hover:shadow-lg transition-shadow flex flex-col"
            >
              <CardHeader className="p-0">
                <div className="relative h-48 w-full overflow-hidden">
                  {design.images && design.images.length > 0 ? (
                    <div className="flex overflow-x-auto snap-x snap-mandatory">
                      {design.images.map((image, index) => (
                        <div
                          key={index}
                          className="flex-shrink-0 w-full h-48 snap-center"
                        >
                          <Image
                            src={image}
                            alt={`${design.title} image ${index + 1}`}
                            width={400}
                            height={200}
                            className="w-full h-full object-cover rounded-t-lg"
                            priority={index === 0}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center rounded-t-lg">
                      <span className="text-gray-500">No Image Available</span>
                    </div>
                  )}
                  {design.isFeatured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                      Featured
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-grow">
                <CardTitle className="text-lg">{design.title}</CardTitle>
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
                <Dialog
                  open={isDeleteModalOpen}
                  onOpenChange={setIsDeleteModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => openDeleteModal(design._id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white/40 backdrop-blur-sm">
                    <DialogHeader>
                      <DialogTitle>Confirm Deletion</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete the design "
                        {designs.find((d) => d._id === designToDelete)?.title}"?
                        This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsDeleteModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          designToDelete && handleDelete(designToDelete)
                        }
                        disabled={!designToDelete}
                      >
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Design
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
