"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
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
import { Plus, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { DesignFormValues, Quotation } from "@/types/Design";

// Define available units
const availableUnits = [
  "piece",
  "kg",
  "meter",
  "liter",
  "square meter",
  "cubic meter",
  "set",
  "bundle",
  "roll",
  "bag",
];

// Define the material schema
const materialSchema = z.object({
  name: z.string().min(1, "Material name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit: z.enum(availableUnits as [string, ...string[]], {
    errorMap: () => ({ message: "Please select a valid unit" }),
  }),
  unitPrice: z.number().min(0, "Unit price must be positive"),
});

// Define the form schema with materials
const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required").max(500),
  images: z.array(z.string()).optional(),
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
  materials: z.array(materialSchema).optional(),
});

interface DesignFormProps {
  onSubmit: SubmitHandler<DesignFormValues>;
  onCancel?: () => void;
  defaultValues?: Partial<DesignFormValues>;
  isSubmitting?: boolean;
  designId?: string;
  quotation?: Quotation | null;
  onQuotationSubmit?: (materials: Quotation["materials"]) => void;
}

export function DesignForm({
  onSubmit,
  onCancel,
  defaultValues,
  isSubmitting = false,
  designId,
  quotation,
  onQuotationSubmit,
}: DesignFormProps) {
  // Initialize the form
  const form = useForm<DesignFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      images: [],
      category: "Residential",
      style: "Modern",
      sqm: 100,
      rooms: 1,
      estimatedCost: 0,
      isFeatured: false,
      materials: quotation?.materials || [],
      ...defaultValues,
    },
  });

  const {
    fields: materialFields,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: "materials",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [estimatedCostInput, setEstimatedCostInput] = useState(
    defaultValues?.estimatedCost
      ? defaultValues.estimatedCost.toLocaleString("en-PH")
      : ""
  );

  // Calculate total cost from materials
  const calculateTotalCost = (materials: DesignFormValues["materials"]) => {
    return (
      materials?.reduce(
        (sum, material) => sum + material.quantity * material.unitPrice,
        0
      ) || 0
    );
  };

  // Update estimated cost when materials change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith("materials")) {
        const materials = value.materials?.filter(
          (m): m is NonNullable<typeof m> => m !== undefined
        );
        const validMaterials = materials?.filter(
          (m): m is { name: string; quantity: number; unit: string; unitPrice: number } =>
            m.name !== undefined &&
            m.quantity !== undefined &&
            m.unit !== undefined &&
            m.unitPrice !== undefined
        );
        const totalCost = calculateTotalCost(validMaterials);
        form.setValue("estimatedCost", totalCost, { shouldValidate: true });
        setEstimatedCostInput(totalCost.toLocaleString("en-PH"));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Handle file selection and generate previews
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);

    e.target.value = "";
  };

  // Remove a selected file and its preview
  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      const newPreviews = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index]);
      return newPreviews;
    });
  };

  // Remove an existing image
  const handleRemoveExistingImage = (index: number) => {
    const removedUrl = form.getValues("images")?.[index];
    if (removedUrl) {
      setRemovedImages((prev) => [...prev, removedUrl]);
    }
    const newImages = [...(form.getValues("images") || [])];
    newImages.splice(index, 1);
    form.setValue("images", newImages, { shouldValidate: true });
  };

  // Handle estimated cost input
  const handleEstimatedCostChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // Remove non-digits
    const numValue = Number(value) || 0;
    setEstimatedCostInput(numValue.toLocaleString("en-PH"));
    form.setValue("estimatedCost", numValue, { shouldValidate: true });
  };

  // Format estimated cost on blur
  const handleEstimatedCostBlur = () => {
    const value = form.getValues("estimatedCost") || 0;
    setEstimatedCostInput(value.toLocaleString("en-PH"));
  };

  // Validate and submit materials for quotation
  const handleQuotationSubmit = () => {
    const materials = form.getValues("materials") || [];
    try {
      const validMaterials = materials
        .filter((m): m is NonNullable<typeof m> => m !== undefined)
        .map((m) => materialSchema.parse(m)); // Validate each material
      if (validMaterials.length === 0 && materials.length > 0) {
        toast.error("Please ensure all materials have valid data.");
        return;
      }
      onQuotationSubmit?.(validMaterials);
      toast.success("Quotation saved successfully");
    } catch (error) {
      toast.error("Invalid material data. Please fill all required fields.");
    }
  };

  // Upload files, delete removed images, and submit form
  const handleSubmitWithUpload: SubmitHandler<DesignFormValues> = async (
    values
  ) => {
    setIsUploading(true);

    try {
      let uploadedUrls = values.images || [];

      // Delete removed images
      if (removedImages.length > 0) {
        const deleteResponse = await fetch("/api/upload/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls: removedImages }),
        });

        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json();
          throw new Error(errorData.error || "Failed to delete removed images");
        }

        uploadedUrls = uploadedUrls.filter(
          (url) => !removedImages.includes(url)
        );
      }

      // Upload new images
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append("files", file);
        });

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }

        const { urls } = await uploadResponse.json();
        if (!Array.isArray(urls) || urls.length === 0) {
          throw new Error("No valid URLs returned from upload");
        }

        uploadedUrls = [...uploadedUrls, ...urls];
      }

      const updatedValues = { ...values, images: uploadedUrls };

      // Submit design data
      await onSubmit(updatedValues);

      // Submit quotation if in edit mode and materials have changed
      if (onQuotationSubmit && updatedValues.materials?.length) {
        const validMaterials = updatedValues.materials
          .filter((m): m is NonNullable<typeof m> => m !== undefined)
          .map((m) => materialSchema.parse(m));
        if (validMaterials.length > 0) {
          await onQuotationSubmit(validMaterials);
        }
      }

      // Reset form and state
      form.reset({
        title: "",
        description: "",
        images: [],
        category: "Residential",
        style: "Modern",
        sqm: 100,
        rooms: 1,
        estimatedCost: 0,
        isFeatured: false,
        materials: [],
      });
      setSelectedFiles([]);
      setPreviews([]);
      setRemovedImages([]);
      setEstimatedCostInput("");
      previews.forEach((preview) => URL.revokeObjectURL(preview));

      toast.success(
        designId ? "Design updated successfully" : "Design created successfully"
      );
    } catch (error: any) {
      const errorMessage =
        error.message || "Failed to process images or submit design";
      toast.error(errorMessage);
      form.setError("root", { type: "manual", message: errorMessage });
    } finally {
      setIsUploading(false);
    }
  };

  // Clean up previews on unmount
  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmitWithUpload)}
        className="space-y-4"
      >
        {/* Title Field */}
        <FormField
          control={form.control}
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
          control={form.control}
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
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Design Images (Optional)</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {(previews.length > 0 ||
                    (field.value && field.value.length > 0)) && (
                    <div className="grid grid-cols-3 gap-2">
                      {(field.value ?? []).map((url, index) => (
                        <div
                          key={`existing-${index}`}
                          className="relative h-24 rounded-md overflow-hidden border"
                        >
                          <img
                            src={url}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {previews.map((preview, index) => (
                        <div
                          key={`preview-${index}`}
                          className="relative h-24 rounded-md overflow-hidden border"
                        >
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={isUploading || isSubmitting}
                    className="hidden"
                    id="image-upload"
                    multiple
                  />
                  <Button
                    variant="outline"
                    type="button"
                    disabled={isUploading || isSubmitting}
                    className="w-full cursor-pointer"
                  >
                    <label
                      htmlFor="image-upload"
                      className="flex items-center cursor-pointer"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {isUploading
                        ? "Uploading..."
                        : previews.length > 0 ||
                          (field.value && field.value.length > 0)
                        ? "Add More Images"
                        : "Select Images"}
                    </label>
                  </Button>
                  {isUploading && (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category and Style Fields */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
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
            control={form.control}
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
            control={form.control}
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
            control={form.control}
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

        {/* Estimated Cost */}
        <FormField
          control={form.control}
          name="estimatedCost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Cost (₱)</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₱
                  </span>
                  <Input
                    type="text"
                    value={estimatedCostInput}
                    onChange={handleEstimatedCostChange}
                    onBlur={handleEstimatedCostBlur}
                    placeholder="1,000,000"
                    className="pl-8"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Quotation Materials (only in edit mode) */}
        {onQuotationSubmit && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quotation Materials</h3>
            <div className="border rounded-md">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Material</th>
                    <th className="p-2 text-left">Quantity</th>
                    <th className="p-2 text-left">Unit</th>
                    <th className="p-2 text-left">Unit Price</th>
                    <th className="p-2 text-left">Total</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {materialFields.map((material, index) => (
                    <tr key={material.id} className="border-t">
                      <td className="p-2">
                        <Input
                          {...form.register(`materials.${index}.name`)}
                          placeholder="Material Name"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          {...form.register(`materials.${index}.quantity`, {
                            valueAsNumber: true,
                          })}
                          min="1"
                        />
                      </td>
                      <td className="p-2">
                        <Select
                          onValueChange={(value) =>
                            form.setValue(`materials.${index}.unit`, value)
                          }
                          value={material.unit}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableUnits.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          {...form.register(`materials.${index}.unitPrice`, {
                            valueAsNumber: true,
                          })}
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="p-2">
                        ₱
                        {(
                          material.quantity * material.unitPrice
                        ).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {materialFields.length === 0 && (
                <p className="p-4 text-center text-muted-foreground">
                  No materials added yet.
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  name: "",
                  quantity: 1,
                  unit: availableUnits[0],
                  unitPrice: 0,
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Material
            </Button>
            <Button
              type="button"
              onClick={handleQuotationSubmit}
              disabled={isSubmitting}
            >
              Save Quotation
            </Button>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
              <span className="font-medium">Total Cost:</span>
              <span>
                ₱
                {calculateTotalCost(
                  form
                    .getValues("materials")
                    ?.filter(
                      (m): m is NonNullable<typeof m> => m !== undefined
                    ) || []
                ).toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        )}

        {/* Featured Design Checkbox */}
        <FormField
          control={form.control}
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
              onClick={() => {
                onCancel();
                form.reset();
                setSelectedFiles([]);
                setPreviews([]);
                setRemovedImages([]);
                setEstimatedCostInput("");
              }}
              disabled={isSubmitting || isUploading}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting || isUploading ? (
              "Saving..."
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                {designId ? "Update Design" : "Save Design"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
