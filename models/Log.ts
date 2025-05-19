import mongoose from "mongoose";

export interface ILog extends mongoose.Document {
  action: string;
  adminName: string;
  targetEmail: string;
  targetName: string;
  createdAt: Date;
}

const LogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    adminName: { type: String, required: true },
    targetEmail: { type: String, required: true },
    targetName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: "Log",
  }
);

const Log = mongoose.models.Log || mongoose.model<ILog>("Log", LogSchema);

export default Log;
