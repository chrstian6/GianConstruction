"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Calendar,
  DollarSign,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { motion } from "framer-motion";

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
  materials?: {
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
  }[];
}

// Animation variants for scroll reveal
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function UserDesignPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [quotationOpen, setQuotationOpen] = useState<string | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [hoveredDesign, setHoveredDesign] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { user } = useAuth();
  const { setIsLoginOpen } = useModal();

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const response = await fetch("/api/admin/projects/designs");
        if (response.ok) {
          const data = await response.json();
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
      const response = await fetch(`/projects/design/${design._id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.materials?.length > 0) {
          setSelectedDesign(data);
          setQuotationOpen(design._id);
        } else {
          toast.error("No quotation available for this design at the moment", {
            position: "bottom-right",
            duration: 5000,
            dismissible: true,
            richColors: true,
          });
        }
      } else {
        throw new Error("Failed to fetch design");
      }
    } catch (error) {
      console.error("Quotation fetch error:", error);
      toast.error("Failed to fetch quotation", {
        position: "bottom-right",
        duration: 5000,
        dismissible: true,
        richColors: true,
      });
    }
  };

  const generatePDF = (design: Design) => {
    if (!design || !design.materials) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    let yOffset = margin;

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Gian Construction", margin, yOffset);
    yOffset += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("123 Construction St., Manila, Philippines", margin, yOffset);
    yOffset += 10;

    // Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Quotation: ${design.title}`, margin, yOffset);
    yOffset += 10;

    // Design Details
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

    // Quotation Table
    if (design.materials.length > 0) {
      autoTable(doc, {
        startY: yOffset,
        head: [["Material", "Quantity", "Unit", "Unit Price (₱)", "Total (₱)"]],
        body: design.materials.map((material) => [
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
          0: { cellWidth: 60 }, // Material
          1: { cellWidth: 30 }, // Quantity
          2: { cellWidth: 30 }, // Unit
          3: { cellWidth: 30 }, // Unit Price
          4: { cellWidth: 30 }, // Total
        },
      });

      yOffset = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.text("No materials specified.", margin, yOffset);
      yOffset += 10;
    }

    // Total Cost
    const totalCost =
      design.materials?.reduce(
        (sum, material) => sum + material.quantity * material.unitPrice,
        0
      ) || 0;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Total Quotation Cost: ₱${totalCost.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      margin,
      yOffset
    );

    // Footer
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

    // Save PDF
    doc.save(`${design.title}_quotation.pdf`);
  };

  const prevImage = (images: string[]) => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (images: string[]) => {
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
            <motion.div
              key={design._id}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all hover:shadow-xl border border-gray-100">
                <CardHeader className="p-0">
                  <div
                    className="relative h-56 w-full"
                    onMouseEnter={() => setHoveredDesign(design._id)}
                    onMouseLeave={() => {
                      setHoveredDesign(null);
                      setCurrentImageIndex(0);
                    }}
                  >
                    {design.images && design.images.length > 0 ? (
                      <>
                        <Image
                          src={design.images[0]}
                          alt={`${design.title} image 1`}
                          width={400}
                          height={224}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          priority={true}
                        />
                        {design.images.length > 1 && (
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            +{design.images.length - 1}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">
                          No Image Available
                        </span>
                      </div>
                    )}
                    {design.isFeatured && (
                      <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-semibold px-2 py-1 rounded-full">
                        Featured
                      </div>
                    )}
                    {hoveredDesign === design._id &&
                      design.images &&
                      design.images.length > 0 && (
                        <div className="absolute top-0 left-0 w-full h-full bg-black/80 flex items-center justify-center z-10">
                          <div className="relative w-[80vw] max-w-[600px] h-[40vh] max-h-[400px]">
                            <Image
                              src={design.images[currentImageIndex]}
                              alt={`${design.title} image ${
                                currentImageIndex + 1
                              }`}
                              width={600}
                              height={400}
                              className="w-full h-full object-contain"
                              priority={true}
                            />
                            {design.images.length > 1 && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                                  onClick={() => prevImage(design.images)}
                                >
                                  <ChevronLeft className="h-6 w-6" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                                  onClick={() => nextImage(design.images)}
                                >
                                  <ChevronRight className="h-6 w-6" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {design.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {design.description}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-700">
                    <div>
                      <p className="text-gray-500">Category</p>
                      <p>{design.category}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Style</p>
                      <p>{design.style}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Area</p>
                      <p>{design.sqm} sqm</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Est. Cost</p>
                      <p>
                        ₱
                        {design.estimatedCost.toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 flex justify-between gap-2 bg-gray-50">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                    onClick={handleSetAppointment}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Set Appointment
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 bg-primary hover:bg-primary-dark"
                    onClick={() => handleGetQuotation(design)}
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Get Quotation
                  </Button>
                </CardFooter>

                {/* Quotation Dialog */}
                <Dialog
                  open={quotationOpen === design._id}
                  onOpenChange={(open) =>
                    setQuotationOpen(open ? design._id : null)
                  }
                >
                  <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-sm">
                    <DialogHeader>
                      <DialogTitle>Quotation for {design.title}</DialogTitle>
                      <DialogDescription>
                        Below is the material breakdown and estimated cost for
                        this design.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {selectedDesign?.materials &&
                      selectedDesign.materials.length > 0 ? (
                        <div className="border rounded-md">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="p-2 text-left">Material</th>
                                <th className="p-2 text-left">Quantity</th>
                                <th className="p-2 text-left">Unit</th>
                                <th className="p-2 text-left">Unit Price</th>
                                <th className="p-2 text-left">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedDesign.materials.map(
                                (material, index) => (
                                  <tr key={index} className="border-t">
                                    <td className="p-2">{material.name}</td>
                                    <td className="p-2">{material.quantity}</td>
                                    <td className="p-2">{material.unit}</td>
                                    <td className="p-2">
                                      ₱
                                      {material.unitPrice.toLocaleString(
                                        "en-PH",
                                        {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }
                                      )}
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
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground">
                          No material breakdown available for this design.
                        </p>
                      )}
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
                        <span className="font-medium">
                          Total Quotation Cost:
                        </span>
                        <span className="text-lg font-semibold">
                          ₱
                          {(selectedDesign?.materials &&
                          selectedDesign.materials.length > 0
                            ? selectedDesign.materials.reduce(
                                (sum, material) =>
                                  sum + material.quantity * material.unitPrice,
                                0
                              )
                            : design.estimatedCost
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
                        onClick={() => {
                          setQuotationOpen(null);
                          setSelectedDesign(null);
                        }}
                      >
                        Close
                      </Button>
                      {selectedDesign?.materials &&
                        selectedDesign.materials.length > 0 && (
                          <Button onClick={() => generatePDF(design)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </Button>
                        )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </Card>
            </motion.div>
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
