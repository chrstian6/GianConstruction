// models/user.ts
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contact: { type: String, required: true },
    gender: { type: String },
    address: { type: String },
    otp: { type: String },
    otpExpiry: { type: Date },
    tempRegistration: { type: Boolean, default: true },
    isActive: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: "User",
  }
);

export interface IUser extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contact: string;
  gender?: string;
  address?: string;
  otp?: string;
  otpExpiry?: Date;
  tempRegistration: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;