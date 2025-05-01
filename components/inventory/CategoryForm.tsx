"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation"; // Add this import
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { categorySchema } from "@/lib/validations/category";
import { toast } from "sonner";
import { createCategory, updateCategory } from "@/lib/actions/category.actions";

interface CategoryFormProps {
  initialData?: any;
  categories: any[];
  isEdit?: boolean;
  onSuccess?: () => void;
}

export function CategoryForm({
  initialData,
  categories,
  isEdit = false,
  onSuccess,
}: CategoryFormProps) {
  const router = useRouter(); // Initialize the router
  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      parentCategory: null,
      isActive: true,
    },
  });

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append(
      "parentCategory",
      data.parentCategory === "none" ? "" : data.parentCategory || ""
    );
    formData.append("isActive", data.isActive ? "on" : "off");

    try {
      let result;
      if (isEdit && initialData?._id) {
        result = await updateCategory(initialData._id, formData);
      } else {
        result = await createCategory(formData);
      }

      if (result?.success) {
        toast.success(
          isEdit
            ? "Category updated successfully"
            : "Category created successfully"
        );
        onSuccess
          ? onSuccess()
          : router.push("/admin/inventory/materials/categories");
      } else {
        toast.error(result?.message || "Operation failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Category name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Category description"
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parentCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories
                      .filter(
                        (cat) =>
                          !initialData?._id || cat._id !== initialData._id
                      )
                      .map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Active Status</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Is this category active?
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onSuccess
                ? onSuccess()
                : router.push("/admin/inventory/materials/categories")
            }
          >
            Cancel
          </Button>
          <Button type="submit">
            {isEdit ? "Update Category" : "Create Category"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
