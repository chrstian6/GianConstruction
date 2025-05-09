"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DesignForm } from "@/components/projects/modals/DesignForm";
import { toast } from "sonner";
import { SubmitHandler } from "react-hook-form";
import { Design, DesignFormValues } from "@/types/Design";

export default function EditDesignPage({ params }: { params: { id: string } }) {
  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDesign = async () => {
      try {
        const response = await fetch(
          `/api/admin/projects/designs/${params.id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch design");
        }
        const { data } = await response.json();
        setDesign(data);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load design", {
          position: "bottom-right",
          duration: 5000,
          dismissible: true,
          richColors: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDesign();
  }, [params.id]);

  const handleSubmit: SubmitHandler<DesignFormValues> = async (values) => {
    try {
      const { materials, ...designData } = values;
      const response = await fetch(`/api/admin/projects/designs/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...designData, materials }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update design");
      }

      toast.success("Design updated successfully", {
        position: "bottom-right",
        duration: 5000,
        dismissible: true,
        richColors: true,
      });
      router.push("/admin/projects/designs");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update design",
        {
          position: "bottom-right",
          duration: 5000,
          dismissible: true,
          richColors: true,
        }
      );
    }
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

  if (!design) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Design not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Edit Design: {design.title}</h1>
      <DesignForm
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/projects/designs")}
        defaultValues={design}
        isSubmitting={false}
        designId={params.id}
      />
    </div>
  );
}
