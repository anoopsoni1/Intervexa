import mongoose from "mongoose";

const detailSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: "Your Name",
    },
    role: {
        type: String,
        required: true,
        default: "Your Role",
    },
    summary: {
        type: String,
        default: "",
    },
    skills: {
        type: [String],
        default: [],
    },
    experience: {
        type: [String],
        default: [],
    },
    projects: {
        type: [String],
        default: [],
    },
    achievements: {
        type: [String],
        default: [],
    },
    education: {
        type: String,
        default: "",
    },
    languageProficiency: {
        type: String,
        default: "",
    },
    email: {
        type: String,
        default: "",
    },
    phone: {
        type: String,
        default: "",
    },
    website: {
        type: String,
        default: "",
    },
    linkedin: {
        type: String,
        default: "",
    },
    github: {
        type: String,
        default: "",
    },
    certifications: {
        type: [String],
        default: [],
    },
    /** Last upload: how readable extracted text was for ATS (0–100). */
    resumeParseRate: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
    },
    /** "native" (PDF text layer / Word) or "ocr" */
    resumeExtractionMethod: {
        type: String,
        default: "",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });

export const Detail = mongoose.model("Detail", detailSchema);