/**
 * Student-friendly defaults vs optional advanced items for Add Details form.
 * Shown as quick-add chips and HTML datalist suggestions on relevant fields.
 */

/** Core skills students typically learn first (courses, tutorials, campus) */
export const SKILLS_STUDENT = [
  "HTML",
  "CSS",
  "JavaScript",
  "Git",
  "GitHub",
  "VS Code",
  "Python",
  "Java",
  "C++",
  "SQL",
  "React",
  "Responsive design",
  "Figma",
  "npm",
  "Command line",
  "REST APIs",
  "Node.js (basics)",
  "Bootstrap",
  "Tailwind CSS",
];

/** Optional advanced / professional tools — same pick list, separate chip group */
export const SKILLS_ADVANCED = [
  "TypeScript",
  "Next.js",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "Terraform",
  "GraphQL",
  "gRPC",
  "Kafka",
  "Redis",
  "Elasticsearch",
  "Microservices",
  "CI/CD",
  "Jenkins",
  "GitHub Actions",
  "Ansible",
  "MongoDB",
  "PostgreSQL",
];

export const ALL_SKILL_SUGGESTIONS = [...SKILLS_STUDENT, ...SKILLS_ADVANCED];

/** Example responsibility lines — student level first */
export const EXPERIENCE_BULLETS_STUDENT = [
  "Built course projects using HTML, CSS, and JavaScript",
  "Collaborated with teammates using Git and GitHub for version control",
  "Practiced data structures and algorithms in Python",
  "Created a responsive personal portfolio website",
  "Participated in coding clubs, workshops, or hackathons",
  "Presented project demos to classmates and mentors",
];

export const EXPERIENCE_BULLETS_ADVANCED = [
  "Designed and shipped REST APIs consumed by web and mobile clients",
  "Owned CI/CD pipelines and reduced deployment time with automation",
  "Led code reviews and mentored junior developers on best practices",
  "Improved application performance and monitoring in production",
];

export const ALL_EXPERIENCE_BULLET_SUGGESTIONS = [
  ...EXPERIENCE_BULLETS_STUDENT,
  ...EXPERIENCE_BULLETS_ADVANCED,
];

/** Short project title ideas */
export const PROJECT_TITLES_STUDENT = [
  "Personal portfolio website",
  "Weather app",
  "Todo / task manager app",
  "College assignment — full-stack mini project",
  "Hackathon project — team submission",
  "Landing page for a local business",
];

export const PROJECT_TITLES_ADVANCED = [
  "Microservices API with authentication",
  "Real-time dashboard with live data",
  "Open-source contribution — documented feature",
];

export const ALL_PROJECT_TITLE_SUGGESTIONS = [...PROJECT_TITLES_STUDENT, ...PROJECT_TITLES_ADVANCED];

export const ACHIEVEMENTS_STUDENT = [
  "Dean's List or merit scholarship",
  "Completed an online web development bootcamp or specialization",
  "Won or placed in a college coding contest or hackathon",
  "Volunteered as peer tutor or lab assistant",
];

export const ACHIEVEMENTS_ADVANCED = [
  "Employee of the quarter / spot award at internship or job",
  "Led a team of 3+ on a shipped product or client project",
  "Published article or talk with measurable reach",
];

export const ALL_ACHIEVEMENT_SUGGESTIONS = [...ACHIEVEMENTS_STUDENT, ...ACHIEVEMENTS_ADVANCED];

export const CERTIFICATIONS_STUDENT = [
  "freeCodeCamp — Responsive Web Design",
  "Google UX Design Certificate (Coursera) — in progress or completed",
  "Microsoft Learn — Azure Fundamentals (AZ-900)",
  "NPTEL / university MOOC — Data Structures using Python",
  "HackerRank — Problem solving (verified)",
];

export const CERTIFICATIONS_ADVANCED = [
  "AWS Certified Solutions Architect – Associate",
  "Certified Kubernetes Administrator (CKA)",
  "Google Professional Cloud Developer",
  "Azure Developer Associate (AZ-204)",
];

export const ALL_CERTIFICATION_SUGGESTIONS = [...CERTIFICATIONS_STUDENT, ...CERTIFICATIONS_ADVANCED];
