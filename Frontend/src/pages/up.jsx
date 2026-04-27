import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Particles from "../components/ui/Lighting.jsx";

import { API_BASE } from "../config";
const TEMPLATES_API = `${API_BASE}/templates`;

// ——— API calls for template.controller.js ———

/** GET all templates; optional type: "resume" | "portfolio" to filter */
export async function fetchAllTemplates(typeFilter = "") {
  const url = typeFilter && (typeFilter === "resume" || typeFilter === "portfolio")
    ? `${TEMPLATES_API}?type=${typeFilter}`
    : TEMPLATES_API;
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Failed to fetch templates");
  return json.data;
}

/** GET single template by id */
export async function fetchTemplateById(id) {
  const res = await fetch(`${TEMPLATES_API}/${id}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Failed to fetch template");
  return json.data;
}

/** POST create template (name + image file + type: "resume"|"portfolio" + style: "modern"|"classic"|"minimal"|"premium") */
export async function createTemplate(name, imageFile, type = "resume", style = "modern") {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("image", imageFile);
  formData.append("type", type === "portfolio" ? "portfolio" : "resume");
  formData.append("style", ["modern", "classic", "minimal", "premium"].includes(style) ? style : "modern");
  const res = await fetch(TEMPLATES_API, {
    method: "POST",
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Failed to create template");
  return json.data;
}

/** DELETE template by id */
export async function deleteTemplate(id) {
  const res = await fetch(`${TEMPLATES_API}/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Failed to delete template");
  return json.data;
}

// ——— Simple UI page using the APIs ———

function UpPageContent() {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createName, setCreateName] = useState("");
  const [createFile, setCreateFile] = useState(null);
  const [createType, setCreateType] = useState("resume");
  const [createStyle, setCreateStyle] = useState("modern");
  const [videoFile, setVideoFile] = useState(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoError, setVideoError] = useState("");
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState("");
  /** Filter list: "all" | "resume" | "portfolio" — only show templates of this type */
  const [listTypeFilter, setListTypeFilter] = useState("all");
  /** Filter list by style when showing resumes: "all" | "modern" | "classic" | "minimal" | "premium" */
  const [listStyleFilter, setListStyleFilter] = useState("all");
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 768,
    height: typeof window !== "undefined" ? window.innerHeight : 1024,
  });

  useEffect(() => {
    const handleResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    setError("");
    try {
      const typeParam = listTypeFilter === "resume" || listTypeFilter === "portfolio" ? listTypeFilter : "";
      const data = await fetchAllTemplates(typeParam);
      setTemplates(data || []);
    } catch (err) {
      setError(err.message);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [listTypeFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createName.trim() || !createFile) {
      setError("Name and image are required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await createTemplate(createName.trim(), createFile, createType, createStyle);
      setCreateName("");
      setCreateFile(null);
      if (document.getElementById("create-image")) {
        document.getElementById("create-image").value = "";
      }
      await loadTemplates();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this template?")) return;
    setError("");
    try {
      await deleteTemplate(id);
      if (selected?._id === id) setSelected(null);
      await loadTemplates();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSelect = async (id) => {
    setError("");
    try {
      const data = await fetchTemplateById(id);
      setSelected(data);
    } catch (err) {
      setError(err.message);
      setSelected(null);
    }
  };

  const handleVideoUpload = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      setVideoError("Please choose a video file.");
      return;
    }
    setVideoError("");
    setUploadedVideoUrl("");
    setVideoUploading(true);
    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      
      const headers = {};
      const res = await fetch(`${API_BASE}/upload-video`, {
        method: "POST",
        credentials: "include",
        headers,
        body: formData,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Video upload failed");
      const url = json?.data?.fileUrl || json?.fileUrl || "";
      if (!url) throw new Error("Upload succeeded but no video URL was returned.");
      setUploadedVideoUrl(url);
      setVideoFile(null);
      const el = document.getElementById("create-video");
      if (el) el.value = "";
    } catch (err) {
      setVideoError(err.message || "Video upload failed");
    } finally {
      setVideoUploading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-900">
      {size.width >= 768 && (
        <div className="absolute inset-0 z-0 pointer-events-none min-h-screen w-full mix-blend-screen">
          <Particles
            particleColors={["#ffffff"]}
            particleCount={200}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={100}
            moveParticlesOnHover
            alphaParticles={false}
            disableRotation={false}
            pixelRatio={1}
          />
        </div>
      )}
      <div className="relative z-10 min-h-screen text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Templates (up.jsx)</h1>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Create form */}
      <form onSubmit={handleCreate} className="mb-8 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
        <h2 className="text-lg font-semibold mb-3">Create template</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <label className="flex flex-col gap-1">
            <span className="text-zinc-400 text-sm">Name</span>
            <input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="Template name"
              className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-600 text-white placeholder:text-zinc-500 w-48"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-zinc-400 text-sm">Type</span>
            <select
              value={createType}
              onChange={(e) => setCreateType(e.target.value)}
              className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-600 text-white w-40"
            >
              <option value="resume">Resume</option>
              <option value="portfolio">Portfolio</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-zinc-400 text-sm">Template style</span>
            <select
              value={createStyle}
              onChange={(e) => setCreateStyle(e.target.value)}
              className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-600 text-white w-40"
              title="Which layout to use when viewing this template (Classic, Minimal, Premium, Modern)"
            >
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="minimal">Minimal</option>
              <option value="premium">Premium</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-zinc-400 text-sm">Image</span>
            <input
              id="create-image"
              type="file"
              accept="image/*"
              onChange={(e) => setCreateFile(e.target.files?.[0] || null)}
              className="text-sm text-zinc-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-indigo-600 file:text-white"
            />
          </label>
          <button
            type="submit"
            disabled={loading || !createName.trim() || !createFile}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "Uploading…" : "Create"}
          </button>
        </div>
      </form>

      {/* Video upload form */}
      <form onSubmit={handleVideoUpload} className="mb-8 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
        <h2 className="text-lg font-semibold mb-3">Upload video</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <label className="flex flex-col gap-1">
            <span className="text-zinc-400 text-sm">Video file</span>
            <input
              id="create-video"
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              className="text-sm text-zinc-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-sky-600 file:text-white"
            />
          </label>
          <button
            type="submit"
            disabled={videoUploading || !videoFile}
            className="px-4 py-2 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-500 disabled:opacity-50 disabled:pointer-events-none"
          >
            {videoUploading ? "Uploading…" : "Upload video"}
          </button>
        </div>
        {videoError ? <p className="mt-3 text-sm text-red-400">{videoError}</p> : null}
        {uploadedVideoUrl ? (
          <div className="mt-3 text-sm">
            <p className="text-emerald-400 mb-1">Video uploaded successfully</p>
            <a
              href={uploadedVideoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:text-sky-300 underline break-all"
            >
              {uploadedVideoUrl}
            </a>
          </div>
        ) : null}
      </form>

      {/* List filters + list */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Templates</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <label className="flex flex-col gap-1">
            <span className="text-zinc-400 text-sm">Show type</span>
            <select
              value={listTypeFilter}
              onChange={(e) => setListTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-600 text-white w-40"
            >
              <option value="all">All</option>
              <option value="resume">Resume only</option>
              <option value="portfolio">Portfolio only</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-zinc-400 text-sm">Show style</span>
            <select
              value={listStyleFilter}
              onChange={(e) => setListStyleFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-600 text-white w-40"
              title="Filter by template style (when showing resumes or all)"
            >
              <option value="all">All styles</option>
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="minimal">Minimal</option>
              <option value="premium">Premium</option>
            </select>
          </label>
        </div>
        {loading && !templates.length ? (
          <p className="text-zinc-400">Loading…</p>
        ) : (() => {
          const styleFilter = (t) =>
            listStyleFilter === "all" || (t.style || "modern") === listStyleFilter;
          const filtered = templates.filter(styleFilter);
          return filtered.length === 0 ? (
            <p className="text-zinc-400">
              No templates{listTypeFilter !== "all" ? ` (${listTypeFilter})` : ""}
              {listStyleFilter !== "all" ? ` with style "${listStyleFilter}"` : ""}.
            </p>
          ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <div
                key={t._id}
                className="rounded-xl border border-zinc-700 bg-zinc-800/50 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => handleSelect(t._id)}
                  className="w-full text-left block"
                >
                  {t.image && (
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-3">
                    <p className="font-medium">{t.name}</p>
                    <p className="text-zinc-400 text-xs">{t.type === "portfolio" ? "Portfolio" : "Resume"}{t.style ? ` · ${t.style}` : ""}</p>
                    <p className="text-zinc-500 text-xs truncate">{t.image}</p>
                  </div>
                </button>
                <div className="px-3 pb-3">
                  <button
                    type="button"
                    onClick={() => handleDelete(t._id)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          );
        })()}
      </div>

      {/* Selected (GET by id) */}
      {selected && (
        <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
          <h2 className="text-lg font-semibold mb-2">Selected template (GET by id)</h2>
          <p className="text-zinc-400 text-sm mb-2">ID: {selected._id}</p>
          <p className="font-medium mb-2">{selected.name}</p>
          {selected.image && (
            <img
              src={selected.image}
              alt={selected.name}
              className="max-w-sm rounded-lg border border-zinc-600"
            />
          )}
        </div>
      )}
      </div>
    </div>
  );
}

export default function UpPage() {
  const userData = useSelector((state) => state.user.userData);
  if (!userData) return <Navigate to="/login" replace />;
  if (!userData.isAdmin) return <Navigate to="/dashboard" replace />;
  return <UpPageContent />;
}
