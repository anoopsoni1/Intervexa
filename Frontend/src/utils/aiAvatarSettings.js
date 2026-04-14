export const AI_AVATAR_STORAGE_KEY = "resumeai.admin.aiAvatarPreset";

export const AI_AVATAR_PRESETS = {
  female: {
    id: "female",
    label: "Female interviewer",
    description: "Friendly female-style AI avatar",
    src: "/ai/interviewer-female.svg",
  },
  male: {
    id: "male",
    label: "Male interviewer",
    description: "Friendly male-style AI avatar",
    src: "/ai/interviewer-male.svg",
  },
};

export const DEFAULT_AI_AVATAR_PRESET = "female";

export function getAiAvatarPreset() {
  if (typeof window === "undefined") return DEFAULT_AI_AVATAR_PRESET;
  const value = localStorage.getItem(AI_AVATAR_STORAGE_KEY);
  return AI_AVATAR_PRESETS[value] ? value : DEFAULT_AI_AVATAR_PRESET;
}

export function setAiAvatarPreset(presetId) {
  if (typeof window === "undefined") return;
  const safePreset = AI_AVATAR_PRESETS[presetId] ? presetId : DEFAULT_AI_AVATAR_PRESET;
  localStorage.setItem(AI_AVATAR_STORAGE_KEY, safePreset);
}

export function getAiAvatarSrc(presetId) {
  const safePreset = AI_AVATAR_PRESETS[presetId] ? presetId : DEFAULT_AI_AVATAR_PRESET;
  return AI_AVATAR_PRESETS[safePreset].src;
}
