"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Design, Quotation } from "@/types/Design";
import { DesignCard } from "@/components/DesignCard";

// Animation variants for scroll reveal
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function UserDesignPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [quotationOpen, setQuotationOpen] = useState<string | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(
    null
  );
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [hoveredDesign, setHoveredDesign] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { user } = useAuth();
  const { setIsLoginOpen } = useModal();

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const response = await fetch("/api/admin/projects/designs");
        if (!response.ok) {
          throw new Error("Failed to fetch designs");
        }
        const data = await response.json();
        const validDesigns = Array.isArray(data.data)
          ? data.data.filter((design: Design) => {
              if (!design._id || !design.title) {
                console.error("Invalid design:", design);
                return false;
              }
              return true;
            })
          : [];
        setDesigns(validDesigns);
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

  const handleSetAppointment = () => {
    if (!user) {
      toast.error("Please log in or sign up to set an appointment", {
        position: "bottom-right",
        duration: 5000,
        dismissible: true,
        richColors: true,
        action: {
          label: "Login",
          onClick: () => setIsLoginOpen(true),
        },
      });
      return;
    }
    toast.success("Redirecting to appointment scheduling...", {
      position: "bottom-right",
      duration: 5000,
      dismissible: true,
      richColors: true,
    });
    // Optional: Redirect to appointment page
    // window.location.href = "/appointments/new";
  };

  const handleGetQuotation = async (design: Design) => {
    try {
      if (!design._id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid design ID");
      }

      const response = await fetch(
        `/api/admin/projects/designs/${design._id}/quotation`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(
          response.status === 404
            ? "Quotation not available for this design. Please contact support."
            : `Expected JSON, received ${contentType || "unknown content type"}`
        );
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.materials?.length > 0) {
          setSelectedDesign(design);
          setSelectedQuotation(data.data);
          setQuotationOpen(design._id);
        } else {
          throw new Error(
            data.error || "No quotation available for this design"
          );
        }
      } else if (response.status === 404) {
        throw new Error("No quotation available for this design");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
    } catch (error) {
      console.error("Quotation fetch error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch quotation";
      toast.error(errorMessage, {
        position: "bottom-right",
        duration: 5000,
        dismissible: true,
        richColors: true,
      });
    }
  };

  const generatePDF = async (design: Design, quotation: Quotation) => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    let yOffset = margin;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Gian Construction", margin, yOffset);
    yOffset += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("123 Construction St., Manila, Philippines", margin, yOffset);
    yOffset += 10;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Quotation: ${design.title}`, margin, yOffset);
    yOffset += 10;

    doc.setFontSize(10);
    const details = [
      `Description: ${design.description}`,
      `Category: ${design.category}`,
      `Style: ${design.style}`,
      `Area: ${design.sqm} sqm`,
      `Rooms: ${design.rooms}`,
      `Estimated Cost: ₱${design.estimatedCost.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    ];
    details.forEach((line) => {
      doc.text(line, margin, yOffset);
      yOffset += 6;
    });

    yOffset += 5;

    if (quotation.materials.length > 0) {
      autoTable(doc, {
        startY: yOffset,
        head: [["Material", "Quantity", "Unit", "Unit Price (₱)", "Total (₱)"]],
        body: quotation.materials.map((material) => [
          material.name,
          material.quantity.toString(),
          material.unit,
          `₱${material.unitPrice.toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          `₱${(material.quantity * material.unitPrice).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        ]),
        theme: "striped",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontSize: 10,
        },
        bodyStyles: { fontSize: 10 },
        margin: { left: margin, right: margin },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
          4: { cellWidth: 30 },
        },
      });

      yOffset = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.text("No materials specified.", margin, yOffset);
      yOffset += 10;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Total Quotation Cost: ₱${quotation.totalCost.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      margin,
      yOffset
    );

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Generated by Gian Construction | Page ${i} of ${pageCount}`,
        pageWidth - margin - 50,
        doc.internal.pageSize.getHeight() - margin,
        { align: "right" }
      );
    }

    doc.save(`${design.title}_quotation.pdf`);
  };

  const prevImage = (images: string[] | undefined) => {
    if (!images || images.length === 0) return;
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (images: string[] | undefined) => {
    if (!images || images.length === 0) return;
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-16">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-16">
      <motion.div
        className="mb-8 text-center"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <h1 className="text-3xl font-bold tracking-tight">
          Explore Our Design Catalog
        </h1>
        <p className="text-muted-foreground mt-2">
          Discover our curated collection of construction design templates
        </p>
      </motion.div>

      {designs.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {designs.map((design, index) => (
            <DesignCard
              key={design._id}
              design={design}
              index={index}
              hoveredDesign={hoveredDesign}
              setHoveredDesign={setHoveredDesign}
              currentImageIndex={currentImageIndex}
              setCurrentImageIndex={setCurrentImageIndex}
              quotationOpen={quotationOpen}
              setQuotationOpen={setQuotationOpen}
              selectedQuotation={selectedQuotation}
              setSelectedQuotation={setSelectedQuotation}
              selectedDesign={selectedDesign}
              setSelectedDesign={setSelectedDesign}
              handleSetAppointment={handleSetAppointment}
              handleGetQuotation={handleGetQuotation}
              generatePDF={generatePDF}
              prevImage={prevImage}
              nextImage={nextImage}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="flex flex-col items-center justify-center py-12 border rounded-lg bg-white shadow-sm"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h3 className="text-xl font-medium mb-2">No designs available</h3>
          <p className="text-muted-foreground text-center mb-4">
            Check back later for our latest design templates.
          </p>
          <Button variant="outline" asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </motion.div>
      )}
    </div>
  );
}
