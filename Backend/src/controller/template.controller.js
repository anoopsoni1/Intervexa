import { Template } from "../models/Template.model.js";
import { uploadTemplateImage } from "../utils/Cloudinary.js";
import { Asynchandler } from "../utils/Asynchandler.js";

/** Create template: upload image to Cloudinary, save name + image URL */
export const createTemplate = Asynchandler(async (req, res) => {
  const name = req.body?.name?.trim();
  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Template name is required",
    });
  }
  if (!req.file || !req.file.path) {
    return res.status(400).json({
      success: false,
      message: "Template image is required",
    });
  }

  const uploadResult = await uploadTemplateImage(req.file.path);
  if (uploadResult.error) {
    const status = uploadResult.httpCode === 400 ? 400 : 500;
    return res.status(status).json({
      success: false,
      message: uploadResult.httpCode === 400 ? "Invalid image file. Use a valid image (e.g. JPG, PNG)." : "Failed to upload image to Cloudinary",
    });
  }
  const cloudinaryRes = uploadResult.response;
  if (!cloudinaryRes?.secure_url) {
    return res.status(500).json({
      success: false,
      message: "Failed to upload image to Cloudinary",
    });
  }

  const type = (req.body?.type || "resume").toString().trim().toLowerCase();
  const validType = type === "portfolio" ? "portfolio" : "resume";
  const order = typeof req.body?.order === "number" ? req.body.order : (req.body?.order != null ? Number(req.body.order) : undefined);
  const styleRaw = (req.body?.style ?? "modern").toString().trim().toLowerCase();
  const validStyle = ["classic", "minimal", "premium", "modern"].includes(styleRaw) ? styleRaw : "modern";

  const template = await Template.create({
    name,
    image: cloudinaryRes.secure_url,
    type: validType,
    style: validStyle,
    ...(order !== undefined && !Number.isNaN(order) && { order }),
  });

  return res.status(201).json({
    success: true,
    data: template,
    message: "Template created successfully",
  });
});

/** Get all templates; optional query: ?type=resume | ?type=portfolio (strict separation) */
export const getTemplates = Asynchandler(async (req, res) => {
  const type = (req.query?.type ?? "").toString().trim().toLowerCase();
  let filter = {};
  if (type === "portfolio") {
    filter = { type: "portfolio" };
  } else if (type === "resume") {
    filter = {
      $and: [
        { type: { $ne: "portfolio" } },
        { $or: [{ type: "resume" }, { type: { $exists: false } }, { type: "" }, { type: null }] },
      ],
    };
  }
  const templates = await Template.find(filter).sort({ order: 1, createdAt: -1 });
  return res.status(200).json({
    success: true,
    data: templates,
    message: "Templates fetched successfully",
  });
});

/** Update template (e.g. name, order) */
export const updateTemplate = Asynchandler(async (req, res) => {
  const { id } = req.params;
  const template = await Template.findById(id);
  if (!template) {
    return res.status(404).json({
      success: false,
      message: "Template not found",
    });
  }
  if (req.body?.name != null && typeof req.body.name === "string") template.name = req.body.name.trim();
  if (req.body?.order != null) {
    const n = Number(req.body.order);
    if (!Number.isNaN(n)) template.order = n;
  }
  if (req.body?.style != null) {
    const s = req.body.style.toString().trim().toLowerCase();
    if (["modern", "classic", "minimal", "premium"].includes(s)) template.style = s;
  }
  await template.save();
  return res.status(200).json({
    success: true,
    data: template,
    message: "Template updated successfully",
  });
});

/** Get single template by id */
export const getTemplateById = Asynchandler(async (req, res) => {
  const { id } = req.params;
  const template = await Template.findById(id);
  if (!template) {
    return res.status(404).json({
      success: false,
      message: "Template not found",
    });
  }
  return res.status(200).json({
    success: true,
    data: template,
    message: "Template fetched successfully",
  });
});

/** Delete template by id (Cloudinary asset not deleted; can be added if needed) */
export const deleteTemplate = Asynchandler(async (req, res) => {
  const { id } = req.params;
  const template = await Template.findByIdAndDelete(id);
  if (!template) {
    return res.status(404).json({
      success: false,
      message: "Template not found",
    });
  }
  return res.status(200).json({
    success: true,
    data: template,
    message: "Template deleted successfully",
  });
});

