// components/inventory/MaterialModal.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MaterialForm } from "./MaterialForm";
import { getCategories } from "@/lib/actions/category.actions";
import { Plus, Loader2 } from "lucide-react";

interface MaterialModalProps {
  initialData?: any;
  isEdit?: boolean;
  disabled?: boolean;
}

export function MaterialModal({
  initialData,
  isEdit = false,
  disabled = false,
}: MaterialModalProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCategories = async () => {
    const cats = await getCategories();
    setCategories(cats);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      loadCategories();
    }
    setOpen(isOpen);
  };

  const handleFormSubmitStart = () => {
    setIsSubmitting(true);
  };

  const handleFormSuccess = () => {
    setIsSubmitting(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {isEdit ? "Edit Material" : "Add Material"}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-background z-10">
          <DialogTitle className="text-xl">
            {isEdit ? "Edit Material" : "Create New Material"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update material details"
              : "Add new material to inventory"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 px-6 py-4 overflow-y-auto scroll-smooth no-scrollbar">
          <MaterialForm
            initialData={initialData}
            categories={categories}
            isEdit={isEdit}
            onSuccess={handleFormSuccess}
            onSubmitStart={handleFormSubmitStart}
            hideButtons
          />
        </div>

        <div className="border-t px-6 py-4 flex justify-end gap-3 sticky bottom-0 bg-background">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="material-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? "Updating..." : "Creating..."}
              </>
            ) : isEdit ? (
              "Update Material"
            ) : (
              "Create Material"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
