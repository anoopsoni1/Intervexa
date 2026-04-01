// i want to write schema for template model in mongoose i am uplading a template in img format and you write a schema for it 
// i want to write schema for template model in mongoose i am uplading a template in img format and you write a schema for it 
// i want to write schema for template model in mongoose i am uplading a template in img format and you write a schema for it 
// i want to write schema for template model in mongoose i am uplading a template in img format and you write a schema for it 
import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      unique: true,
    },
    /** "resume" → Resume design page; "portfolio" → Portfolio design page */
    type: {
      type: String,
      enum: ["resume", "portfolio"],
      default: "resume",
      trim: true,
    },
    /** Display order (lower = first). Used to arrange templates, e.g. 1,2,3,4 for four resumes. */
    order: {
      type: Number,
      default: 0,
    },
    /** Layout style: which resume layout to use (classic, minimal, premium, modern). */
    style: {
      type: String,
      enum: ["modern", "classic", "minimal", "premium"],
      default: "modern",
      trim: true,
    },
  },

  {
    timestamps: true,
  }
);

export const Template = mongoose.model("Template", templateSchema);