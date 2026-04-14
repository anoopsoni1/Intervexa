import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { clearUser, setUser } from "../slices/user.slice";
import { fetchDetailForResume, buildResumeTextFromDetail } from "../utils/detailApi.js";
import { useAtsCheck } from "./useAtsCheck.js";
import { useProfileAuthCheck } from "./useProfileAuthCheck.js";

const MIN_RESUME_WORDS = 20;
const MIN_JD_WORDS = 10;

function countWords(value) {
  const text = typeof value === "string" ? value : "";
  const words = text.match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g);
  return words ? words.length : 0;
}

function hasMeaningfulDetail(detailData) {
  if (!detailData) return false;
  const textFields = [
    detailData.summary,
    detailData.education,
    detailData.languageProficiency,
    detailData.email,
    detailData.phone,
  ];
  if (textFields.some((v) => String(v || "").trim().length > 0)) return true;

  const arrayFields = [detailData.skills, detailData.experience, detailData.projects, detailData.certifications];
  return arrayFields.some((arr) => Array.isArray(arr) && arr.some((item) => String(item || "").trim().length > 0));
}

export function useAtsPageData() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const resumeTextFromRedux = useSelector((state) => state.resume.resumeText);
  const accessToken = localStorage.getItem("accessToken");
  const hasToken = Boolean(accessToken);

  const [resumeText, setResumeText] = useState(resumeTextFromRedux || "");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const { data: detailData, isLoading: isDetailLoading } = useQuery({
    queryKey: ["resume-detail"],
    queryFn: fetchDetailForResume,
    enabled: hasToken,
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    const reduxText = String(resumeTextFromRedux || "").trim();
    // Prefer latest upload text from Redux; DB can lag briefly after upload.
    if (reduxText) {
      setResumeText(resumeTextFromRedux);
      return;
    }
    if (hasMeaningfulDetail(detailData)) {
      setResumeText(buildResumeTextFromDetail(detailData));
      return;
    }
    setResumeText("");
  }, [detailData, resumeTextFromRedux]);

  useEffect(() => {
    if (isDetailLoading) return;
    const hasReduxText = String(resumeTextFromRedux || "").trim().length > 0;
    const hasDetailText = hasMeaningfulDetail(detailData);
    const hasUploadedResume = hasReduxText || hasDetailText;
    if (!hasUploadedResume) navigate("/upload", { replace: true });
  }, [detailData, isDetailLoading, resumeTextFromRedux, navigate]);

  const handleUnauthorized = useCallback(() => {
    dispatch(clearUser());
    navigate("/login");
  }, [dispatch, navigate]);

  const handleUserLoaded = useCallback(
    (currentUser) => {
      dispatch(setUser(currentUser));
    },
    [dispatch]
  );

  const { authChecking } = useProfileAuthCheck({
    accessToken,
    hasToken,
    onUnauthorized: handleUnauthorized,
    onUserLoaded: handleUserLoaded,
  });

  const { checkAts, loading } = useAtsCheck({
    accessToken,
    hasToken,
    onUnauthorized: handleUnauthorized,
  });

  const resumeWordCount = useMemo(() => countWords(resumeText), [resumeText]);
  const jdWordCount = useMemo(() => countWords(jobDescription), [jobDescription]);
  const checkReadiness = useMemo(
    () => ({
      resumeOk: resumeWordCount >= MIN_RESUME_WORDS,
      jdOk: jdWordCount >= MIN_JD_WORDS,
    }),
    [resumeWordCount, jdWordCount]
  );

  const analyzeResume = async (jd) => {
    const r = String(resumeText || "").trim();
    const j = String(jd ?? "").trim();
    if (!r || !j) {
      setError("Resume text and a job description are required. Select a job role first.");
      return;
    }
    if (countWords(r) < MIN_RESUME_WORDS) {
      setError(
        `Resume text is too short for a reliable check (aim for at least ${MIN_RESUME_WORDS} words). Upload a fuller resume or edit in Optimize with AI.`
      );
      return;
    }
    if (countWords(j) < MIN_JD_WORDS) {
      setError(
        `The selected job description is too short for accurate keyword matching (minimum ${MIN_JD_WORDS} words).`
      );
      return;
    }

    setJobDescription(j);
    setError("");
    setResult(null);

    try {
      const resultData = await checkAts({
        resumeTextValue: r,
        jobDescriptionValue: j,
      });
      setResult(resultData);
    } catch (err) {
      if (err?.name === "AbortError") return;
      if (err?.message !== "Unauthorized") {
        setError(err?.message || "Failed to calculate ATS score");
      }
    }
  };

  const handleCheckATS = () => analyzeResume(jobDescription);

  return {
    resumeText,
    setResumeText,
    jobDescription,
    setJobDescription,
    result,
    error,
    loading,
    authChecking,
    analyzeResume,
    handleCheckATS,
    resumeWordCount,
    jdWordCount,
    checkReadiness,
    minResumeWords: MIN_RESUME_WORDS,
    minJdWords: MIN_JD_WORDS,
  };
}
