import { Schema, model, models } from "mongoose";

const MaterialSchema = new Schema({
  name: { 
    type: String, 
    required: [true, "Material name is required"],
    trim: true,
    maxlength: [100, "Material name cannot exceed 100 characters"]
  },
  description: { 
    type: String,
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"]
  },
  category: { 
    type: Schema.Types.ObjectId, 
    ref: 'Category', 
    required: [true, "Category is required"] 
  },
  unit: { 
    type: String, 
    required: [true, "Unit is required"],
    enum: {
      values: ['kg', 'g', 'lb', 'piece', 'box', 'pallet', 'liter', 'gallon', 'meter', 'foot'],
      message: '{VALUE} is not a valid unit'
    }
  },
  price: { 
    type: Number, 
    required: [true, "Price is required"],
    min: [0, "Price must be positive"]
  },
  cost: {
    type: Number,
    min: [0, "Cost must be positive"]
  },
  stock: { 
    type: Number, 
    required: true, 
    default: 0,
    min: [0, "Stock cannot be negative"]
  },
  minStockLevel: {
    type: Number,
    default: 0,
    min: [0, "Minimum stock level cannot be negative"]
  },
  supplier: { 
    type: String,
    trim: true
  },
  sku: { 
    type: String, 
    unique: true,
    trim: true,
    uppercase: true
  },
  barcode: {
    type: String,
    trim: true
  },
  images: [{
    url: { 
      type: String, 
      required: true,
      validate: {
        validator: (v: string) => {
          return v.startsWith('https://firebasestorage.googleapis.com/');
        },
        message: 'Image URL must be from Firebase Storage'
      }
    },
    altText: { type: String, default: '' }
  }],
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'g', 'lb', 'oz']
    }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'm', 'in', 'ft']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, "Notes cannot exceed 1000 characters"]
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});



// Add index for frequently queried fields
MaterialSchema.index({ name: 'text', description: 'text', sku: 1 });

const Material = models.Material || model('Material', MaterialSchema);

export default Material;