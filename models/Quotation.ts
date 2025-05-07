import { Schema, model, models } from "mongoose";

interface IQuotation {
  designId: Schema.Types.ObjectId;
  materials: Array<{
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
  }>;
  totalCost: number;
  createdAt: Date;
  updatedAt: Date;
}

const materialSchema = new Schema({
  name: {
    type: String,
    required: [true, "Material name is required"],
    trim: true,
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"],
  },
  unit: {
    type: String,
    required: [true, "Unit is required"],
    trim: true,
  },
  unitPrice: {
    type: Number,
    required: [true, "Unit price is required"],
    min: [0, "Unit price must be positive"],
  },
});

const quotationSchema = new Schema<IQuotation>(
  {
    designId: {
      type: Schema.Types.ObjectId,
      ref: "Design",
      required: [true, "Design ID is required"],
    },
    materials: {
      type: [materialSchema],
      required: [true, "Materials are required"],
      validate: {
        validator: (v: any[]) => v.length > 0,
        message: "At least one material is required",
      },
    },
    totalCost: {
      type: Number,
      required: [true, "Total cost is required"],
      min: [0, "Total cost must be positive"],
    },
  },
  { timestamps: true }
);

// Define indexes
quotationSchema.index({ designId: 1 });

const Quotation = models.Quotation || model("Quotation", quotationSchema);

export default Quotation;
