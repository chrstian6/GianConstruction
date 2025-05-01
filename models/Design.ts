import { Schema, model, models } from "mongoose";

const DesignSchema = new Schema(
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
    image: {
      type: String,
      required: [true, "Image URL is required"],
      validate: {
        validator: (v: string) => {
          return v.startsWith("https://") || v.startsWith("/images/");
        },
        message: "Image must be a valid URL",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["Residential", "Commercial", "Industrial", "Landscape"],
        message: "{VALUE} is not a valid category",
      },
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
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Design = models.Design || model("Design", DesignSchema);

export default Design;
    