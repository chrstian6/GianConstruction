import { Schema, model, models } from "mongoose";

interface IDesign {
  title: string;
  description: string;
  images: string[];
  category: "Residential" | "Commercial" | "Industrial" | "Landscape";
  style:
    | "Modern"
    | "Traditional"
    | "Contemporary"
    | "Minimalist"
    | "Industrial"
    | "Rustic";
  sqm: number;
  rooms: number;
  estimatedCost: number;
  isFeatured?: boolean;
  projectId?: Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const DesignSchema = new Schema<IDesign>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    images: {
      type: [String],
      required: false,
      validate: {
        validator: (v: string[]) =>
          !v ||
          (Array.isArray(v) &&
            v.every((url) => {
              try {
                new URL(url);
                return true;
              } catch {
                return false;
              }
            })),
        message: "All provided image URLs must be valid",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["Residential", "Commercial", "Industrial", "Landscape"],
        message: "{VALUE} is not a valid category",
      },
      trim: true,
    },
    style: {
      type: String,
      required: [true, "Style is required"],
      enum: {
        values: [
          "Modern",
          "Traditional",
          "Contemporary",
          "Minimalist",
          "Industrial",
          "Rustic",
        ],
        message: "{VALUE} is not a valid style",
      },
      trim: true,
    },
    sqm: {
      type: Number,
      required: [true, "Square meters is required"],
      min: [10, "Area must be at least 10 sqm"],
    },
    rooms: {
      type: Number,
      required: [true, "Number of rooms is required"],
      min: [1, "Must have at least 1 room"],
    },
    estimatedCost: {
      type: Number,
      required: [true, "Estimated cost is required"],
      min: [0, "Cost must be positive"],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Define indexes
DesignSchema.index({ projectId: 1 }, { sparse: true });

const Design = models.Design || model("Design", DesignSchema);

export default Design;
