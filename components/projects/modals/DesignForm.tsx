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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

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

// Create a type from the Zod schema
export type DesignFormValues = z.infer<typeof formSchema>;

// Define the control type explicitly
export type DesignFormControl = Control<DesignFormValues>;

interface DesignFormProps {
  onSubmit: SubmitHandler<DesignFormValues>;
  onCancel?: () => void;
  defaultValues?: Partial<DesignFormValues>;
  isSubmitting?: boolean;
  designId?: string;
}

export function DesignForm({
  onSubmit,
  onCancel,
  defaultValues,
  isSubmitting = false,
  designId,
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
      materials: [],
      ...defaultValues,
    },
  });

  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    quantity: 1,
    unit: availableUnits[0], // Default to first unit
    unitPrice: 0,
  });
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

  // Handle adding a new material
  const handleAddMaterial = () => {
    try {
      const validatedMaterial = materialSchema.parse(newMaterial);
      const currentMaterials = form.getValues("materials") || [];
      const updatedMaterials = [...currentMaterials, validatedMaterial];
      form.setValue("materials", updatedMaterials, { shouldValidate: true });
      const totalCost = calculateTotalCost(updatedMaterials);
      form.setValue("estimatedCost", totalCost, { shouldValidate: true });
      setEstimatedCostInput(totalCost.toLocaleString("en-PH"));
      setNewMaterial({
        name: "",
        quantity: 1,
        unit: availableUnits[0],
        unitPrice: 0,
      });
      setIsQuotationOpen(false);
    } catch (error) {
      toast.error("Invalid material details. Please fill all fields.", {
        position: "bottom-right",
        richColors: true,
      });
    }
  };

  // Handle removing a material
  const handleRemoveMaterial = (index: number) => {
    const currentMaterials = form.getValues("materials") || [];
    const updatedMaterials = currentMaterials.filter((_, i) => i !== index);
    form.setValue("materials", updatedMaterials, { shouldValidate: true });
    const totalCost = calculateTotalCost(updatedMaterials);
    form.setValue("estimatedCost", totalCost, { shouldValidate: true });
    setEstimatedCostInput(totalCost.toLocaleString("en-PH"));
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

  // Upload files, delete removed images, and submit form
  const handleSubmitWithUpload: SubmitHandler<DesignFormValues> = async (
    values
  ) => {
    setIsUploading(true);

    try {
      let uploadedUrls = values.images || [];

      // Delete removed images
      if (removedImages.length > 0) {
        console.log("Deleting images:", removedImages);
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

        console.log(
          "Sending files to /api/upload:",
          selectedFiles.map((f) => f.name)
        );
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }

        const { urls } = await uploadResponse.json();
        console.log("Received URLs from /api/upload:", urls);

        if (!Array.isArray(urls) || urls.length === 0) {
          throw new Error("No valid URLs returned from upload");
        }

        uploadedUrls = [...uploadedUrls, ...urls];
      }

      const updatedValues = { ...values, images: uploadedUrls };

      console.log("Submitting form with values:", updatedValues);
      await onSubmit(updatedValues);

      previews.forEach((preview) => URL.revokeObjectURL(preview));
      setSelectedFiles([]);
      setPreviews([]);
      setRemovedImages([]);
      toast.success(
        designId
          ? "Design updated successfully"
          : "Design created successfully",
        { position: "bottom-right", richColors: true }
      );
    } catch (error: any) {
      console.error("Upload/Delete error:", error);
      const errorMessage =
        error.message || "Failed to process images or submit design";
      toast.error(errorMessage, {
        position: "bottom-right",
        richColors: true,
      });
      form.setError("root", {
        type: "manual",
        message: errorMessage,
      });
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

        {/* Estimated Cost and Quotation */}
        <div className="space-y-4">
          <FormField
            control={form.control as DesignFormControl}
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

          <Dialog open={isQuotationOpen} onOpenChange={setIsQuotationOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" type="button">
                <Plus className="mr-2 h-4 w-4" />
                Manage Quotation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-white/80 backdrop-blur-sm">
              <DialogHeader>
                <DialogTitle>Manage Quotation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Material List */}
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
                      {(form.getValues("materials") || []).map(
                        (material, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-2">{material.name}</td>
                            <td className="p-2">{material.quantity}</td>
                            <td className="p-2">{material.unit}</td>
                            <td className="p-2">
                              ₱{material.unitPrice.toFixed(2)}
                            </td>
                            <td className="p-2">
                              ₱
                              {(material.quantity * material.unitPrice).toFixed(
                                2
                              )}
                            </td>
                            <td className="p-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMaterial(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                  {(form.getValues("materials") || []).length === 0 && (
                    <p className="p-4 text-center text-muted-foreground">
                      No materials added yet.
                    </p>
                  )}
                </div>

                {/* Add New Material */}
                <div className="space-y-4">
                  <h4 className="font-medium">Add New Material</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <Input
                      placeholder="Material Name"
                      value={newMaterial.name}
                      onChange={(e) =>
                        setNewMaterial({
                          ...newMaterial,
                          name: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="number"
                      min="1"
                      placeholder="Quantity"
                      value={newMaterial.quantity}
                      onChange={(e) =>
                        setNewMaterial({
                          ...newMaterial,
                          quantity: Number(e.target.value),
                        })
                      }
                    />
                    <Select
                      value={newMaterial.unit}
                      onValueChange={(value) =>
                        setNewMaterial({ ...newMaterial, unit: value })
                      }
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
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Unit Price"
                      value={newMaterial.unitPrice}
                      onChange={(e) =>
                        setNewMaterial({
                          ...newMaterial,
                          unitPrice: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddMaterial}
                    disabled={
                      !newMaterial.name ||
                      newMaterial.quantity < 1 ||
                      !newMaterial.unit ||
                      newMaterial.unitPrice < 0
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Material
                  </Button>
                </div>

                {/* Total Cost */}
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
                  <span className="font-medium">Total Cost:</span>
                  <span>
                    ₱
                    {calculateTotalCost(
                      form.getValues("materials")
                    ).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsQuotationOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

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
