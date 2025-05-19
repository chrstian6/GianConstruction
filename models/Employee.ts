import mongoose from "mongoose";

export interface IEmployee extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contact: string;
  gender?: string;
  address?: string;
  role: string;
  position: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contact: { type: String, required: true },
    gender: { type: String },
    address: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "admin" },
    position: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: "Employee",
  }
);

const Employee =
  mongoose.models.Employee ||
  mongoose.model<IEmployee>("Employee", EmployeeSchema);

export default Employee;
