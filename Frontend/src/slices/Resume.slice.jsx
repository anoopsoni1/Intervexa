import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Store raw extracted resume text (used by ATS, views, filters, etc.)
  resumeText: "",
  // Optionally store an edited/optimized version
  editedResumeText: "",
};

const resumeSlice = createSlice({
  name: "resume",
  initialState ,


  reducers: {
    setResumeText: (state, action) => {
      state.resumeText = action.payload;
    },
    setEditedResumeText: (state, action) => {
      state.editedResumeText = action.payload;
    },
    clearResume: (state) => {
      state.resumeText = "";
      state.editedResumeText = "";
    },
  },
});

export const { setResumeText, setEditedResumeText, clearResume } =
  resumeSlice.actions;

export default resumeSlice.reducer;
