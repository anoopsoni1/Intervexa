import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Store raw extracted resume text (used by ATS, views, filters, etc.)
  resumeText: "",
  // Optionally store an edited/optimized version
  editedResumeText: "",
  /** 0–100 from last upload extraction quality (ATS text parse rate) */
  resumeParseRate: null,
  /** "native" | "ocr" from last upload */
  resumeExtractionMethod: "",
};

const resumeSlice = createSlice({
  name: "resume",
  initialState ,


  reducers: {
    setResumeText: (state, action) => {
      state.resumeText = action.payload;
    },
    /** Set text plus optional parse metadata from upload API */
    setResumeUploadMeta: (state, action) => {
      const p = action.payload;
      if (p && typeof p === "object") {
        if (p.resumeText != null) state.resumeText = String(p.resumeText);
        if (p.parseRate != null && !Number.isNaN(Number(p.parseRate))) {
          state.resumeParseRate = Math.min(100, Math.max(0, Number(p.parseRate)));
        }
        if (p.extractionMethod != null) {
          state.resumeExtractionMethod = String(p.extractionMethod);
        }
      }
    },
    setEditedResumeText: (state, action) => {
      state.editedResumeText = action.payload;
    },
    clearResume: (state) => {
      state.resumeText = "";
      state.editedResumeText = "";
      state.resumeParseRate = null;
      state.resumeExtractionMethod = "";
    },
  },
});

export const { setResumeText, setEditedResumeText, setResumeUploadMeta, clearResume } =
  resumeSlice.actions;

export default resumeSlice.reducer;
