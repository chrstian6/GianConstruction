"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler, Control } from "react-hook-form";
import * as z from "zod";
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
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

// 1. Define the form schema with Zod
const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required").max(500),
  image: z.string().min(1, "Image is required"),
  category: z.enum(["Residential", "Commercial", "Industrial", "Landscape"]),
  style: z.enum([
    "Modern",
    "Traditional",
    "Contemporary",
    "Minimalist",
    "Industrial",
    "Rustic",
  ]),
  sqm: z.number().min(10, "Must be at least 10 sqm"),
  rooms: z.number().min(1, "Must have at least 1 room"),
  estimatedCost: z.number().min(0, "Cost must be positive"),
  isFeatured: z.boolean().default(false).optional(),
});

// 2. Create a type from the Zod schema
export type DesignFormValues = z.infer<typeof formSchema>;

// 3. Define the control type explicitly
export type DesignFormControl = Control<DesignFormValues>;

interface DesignFormProps {
  onSubmit: SubmitHandler<DesignFormValues>;
  onCancel?: () => void;
  defaultValues?: Partial<DesignFormValues>;
  isSubmitting?: boolean;
}

export function DesignForm({
  onSubmit,
  onCancel,
  defaultValues,
  isSubmitting = false,
}: DesignFormProps) {
  // 4. Initialize the form with explicit type
  const form = useForm<DesignFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
      category: "Residential",
      style: "Modern",
      sqm: 100,
      rooms: 1,
      estimatedCost: 0,
      isFeatured: false,
      ...defaultValues,
    },
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { url } = await response.json();
      form.setValue("image", url, { shouldValidate: true });
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      form.setError("image", {
        type: "manual",
        message: "Failed to upload image",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Title Field */}
        <FormField
          control={form.control as DesignFormControl}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Modern Minimalist House" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control as DesignFormControl}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Clean lines and open spaces with natural lighting"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image Upload Field */}
        <FormField
          control={form.control as DesignFormControl}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Design Image</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {field.value && (
                    <div className="relative w-full h-48 rounded-md overflow-hidden border">
                      <img
                        src={field.value}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    variant="outline"
                    type="button"
                    disabled={isUploading}
                    className="w-full"
                  >
                    <label
                      htmlFor="image-upload"
                      className="flex items-center cursor-pointer"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {isUploading
                        ? "Uploading..."
                        : field.value
                        ? "Change Image"
                        : "Upload Image"}
                    </label>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category and Style Fields */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control as DesignFormControl}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {formSchema.shape.category.options.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as DesignFormControl}
            name="style"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Style</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {formSchema.shape.style.options.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Area and Rooms Fields */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control as DesignFormControl}
            name="sqm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Area (sqm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="10"
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as DesignFormControl}
            name="rooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rooms</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Estimated Cost Field */}
        <FormField
          control={form.control as DesignFormControl}
          name="estimatedCost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Cost</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Featured Design Checkbox */}
        <FormField
          control={form.control as DesignFormControl}
          name="isFeatured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="mt-1"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Featured Design</FormLabel>
                <p className="text-sm text-muted-foreground">
                  This design will be highlighted in the portfolio
                </p>
              </div>
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-4">
          {onCancel && (
            <Button
              variant="outline"
              type="button"
              onClick={onCancel}
              disabled={isSubmitting || isUploading}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Save Design
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
