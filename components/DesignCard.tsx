"use client";

import Image from "next/image";
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
import { motion } from "framer-motion";
import { Design, Quotation } from "@/types/Design";

interface DesignCardProps {
  design: Design;
  index: number;
  hoveredDesign: string | null;
  setHoveredDesign: (id: string | null) => void;
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  quotationOpen: string | null;
  setQuotationOpen: (id: string | null) => void;
  selectedQuotation: Quotation | null;
  setSelectedQuotation: (quotation: Quotation | null) => void;
  selectedDesign: Design | null;
  setSelectedDesign: (design: Design | null) => void;
  handleSetAppointment: () => void;
  handleGetQuotation: (design: Design) => void;
  generatePDF: (design: Design, quotation: Quotation) => void;
  prevImage: (images: string[] | undefined) => void;
  nextImage: (images: string[] | undefined) => void;
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function DesignCard({
  design,
  index,
  hoveredDesign,
  setHoveredDesign,
  currentImageIndex,
  setCurrentImageIndex,
  quotationOpen,
  setQuotationOpen,
  selectedQuotation,
  setSelectedQuotation,
  selectedDesign,
  setSelectedDesign,
  handleSetAppointment,
  handleGetQuotation,
  generatePDF,
  prevImage,
  nextImage,
}: DesignCardProps) {
  // Log design for debugging
  if (!design || !design._id) {
    console.error("Invalid design object:", design);
    return null;
  }

  const images = design.images ?? []; // Default to empty array if undefined

  return (
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
            {images.length > 0 ? (
              <>
                <Image
                  src={images[0]}
                  alt={`${design.title} image 1`}
                  width={400}
                  height={224}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  priority={true}
                />
                {images.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    +{images.length - 1}
                  </div>
                )}
              </>
            ) : (
              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No Image Available</span>
              </div>
            )}
            {design.isFeatured && (
              <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-semibold px-2 py-1 rounded-full">
                Featured
              </div>
            )}
            {hoveredDesign === design._id && images.length > 0 && (
              <div className="absolute top-0 left-0 w-full h-full bg-black/80 flex items-center justify-center z-10">
                <div className="relative w-[80vw] max-w-[600px] h-[40vh] max-h-[400px]">
                  <Image
                    src={images[currentImageIndex]}
                    alt={`${design.title} image ${currentImageIndex + 1}`}
                    width={600}
                    height={400}
                    className="w-full h-full object-contain"
                    priority={true}
                  />
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                        onClick={() => prevImage(images)}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                        onClick={() => nextImage(images)}
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
          onOpenChange={(open) => setQuotationOpen(open ? design._id : null)}
        >
          <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle>Quotation for {design.title}</DialogTitle>
              <DialogDescription>
                Below is the material breakdown and estimated cost for this
                design.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedQuotation?.materials &&
              selectedQuotation.materials.length > 0 ? (
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
                      {selectedQuotation.materials.map((material, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{material.name}</td>
                          <td className="p-2">{material.quantity}</td>
                          <td className="p-2">{material.unit}</td>
                          <td className="p-2">
                            ₱
                            {material.unitPrice.toLocaleString("en-PH", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
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
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  No material breakdown available. Estimated cost: ₱
                  {design.estimatedCost.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              )}
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
                <span className="font-medium">Total Quotation Cost:</span>
                <span className="text-lg font-semibold">
                  ₱
                  {(
                    selectedQuotation?.totalCost || design.estimatedCost
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
                  setSelectedQuotation(null);
                }}
              >
                Close
              </Button>
              {selectedQuotation?.materials &&
                selectedQuotation.materials.length > 0 && (
                  <Button
                    onClick={() =>
                      selectedDesign &&
                      selectedQuotation &&
                      generatePDF(selectedDesign, selectedQuotation)
                    }
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </motion.div>
  );
}
