import { Types } from "mongoose";

export type DesignFormValues = {
  title: string;
  description: string;
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
  images?: string[];
  isFeatured?: boolean;
  materials?: {
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
  }[];
};

export interface Design extends DesignFormValues {
  _id: string;
  projectId?: Types.ObjectId;
  createdAt?: Date;
}

export interface Quotation {
  _id?: string;
  designId: Types.ObjectId;
  materials: {
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
  }[];
  totalCost: number;
  createdAt?: Date;
  updatedAt?: Date;
}
