import {
  ALL_ACHIEVEMENT_SUGGESTIONS,
  ALL_CERTIFICATION_SUGGESTIONS,
  ALL_EXPERIENCE_BULLET_SUGGESTIONS,
  ALL_PROJECT_TITLE_SUGGESTIONS,
  ALL_SKILL_SUGGESTIONS,
} from "../../data/formFieldSuggestions.js";

/**
 * HTML datalists referenced by Add Details inputs (skills, bullets, titles, etc.).
 */
export default function AddDetailsSuggestionLists() {
  return (
    <>
      <datalist id="adddetails-skills-suggestions">
        {ALL_SKILL_SUGGESTIONS.map((v) => (
          <option key={`skill-${v}`} value={v}>
            {v}
          </option>
        ))}
      </datalist>
      <datalist id="adddetails-exp-bullet-suggestions">
        {ALL_EXPERIENCE_BULLET_SUGGESTIONS.map((v) => (
          <option key={`exp-${v}`} value={v}>
            {v}
          </option>
        ))}
      </datalist>
      <datalist id="adddetails-project-title-suggestions">
        {ALL_PROJECT_TITLE_SUGGESTIONS.map((v) => (
          <option key={`pt-${v}`} value={v}>
            {v}
          </option>
        ))}
      </datalist>
      <datalist id="adddetails-achievement-suggestions">
        {ALL_ACHIEVEMENT_SUGGESTIONS.map((v) => (
          <option key={`ach-${v}`} value={v}>
            {v}
          </option>
        ))}
      </datalist>
      <datalist id="adddetails-cert-suggestions">
        {ALL_CERTIFICATION_SUGGESTIONS.map((v) => (
          <option key={`cert-${v}`} value={v}>
            {v}
          </option>
        ))}
      </datalist>
    </>
  );
}
