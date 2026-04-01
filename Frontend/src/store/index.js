import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../slices/user.slice.jsx";
import resumeReducer from "../slices/Resume.slice.jsx";

export const store = configureStore({
  reducer: {
    user: userReducer,
    resume: resumeReducer,
  },
});
