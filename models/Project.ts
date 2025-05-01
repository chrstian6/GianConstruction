// models/Project.ts
import { Schema, model, models } from "mongoose";

const ProjectSchema = new Schema({
  name: {
    type: String,
    required: [true, "Project name is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
  design: {
    type: Schema.Types.ObjectId,
    ref: "Design",
    required: false,
  },
});

const Project = models.Project || model("Project", ProjectSchema);

export default Project;
