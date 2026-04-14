import {
  BarChart3,
  Blocks,
  Brain,
  Briefcase,
  Code2,
  Database,
  Gamepad2,
  Laptop,
  Layout,
  Network,
  PenTool,
  Server,
  Shield,
  Smartphone,
  TestTube2,
} from "lucide-react";

const ARCHETYPE_BASE = {
  software_dev:
    "[ROLE_TITLE] role for students, freshers, and early-career candidates. Strong fundamentals in one language, Git usage, and project-based learning are enough to apply. You will build features, fix bugs, write simple tests, and collaborate with teammates. Coursework, internships, hackathons, and personal projects all count. We value clarity, consistency, and willingness to learn over years of enterprise experience.",
  mobile_dev:
    "[ROLE_TITLE] role focused on learning mobile fundamentals. Exposure to Android, iOS, Flutter, or React Native through projects or coursework is sufficient. You will implement UI screens, handle basic app navigation, connect APIs, and improve user experience over time. We value debugging skills, app design thinking, and steady learning progress.",
  ai_data_ml:
    "[ROLE_TITLE] role for learners in AI, ML, and data. Python basics, practical datasets, notebook workflows, and curiosity about model behavior are important. You may have done coursework, mini projects, or internship tasks involving analysis, prediction, or automation. We value reproducible work, clear explanations, and problem-solving more than heavy production experience.",
  cloud_devops:
    "[ROLE_TITLE] role suitable for candidates learning cloud and operations fundamentals. Basic Linux/CLI comfort, scripting, Git, and understanding deployment workflows are expected. You will support CI/CD tasks, monitoring, and environment setup with mentorship. We value reliability mindset, documentation, and learning discipline over advanced platform ownership.",
  cybersecurity:
    "[ROLE_TITLE] role open to students and junior candidates interested in security. Knowledge of basic security concepts, common vulnerabilities, and ethical practices is enough to start. CTFs, labs, coursework, and incident-analysis exercises are relevant. We value attention to detail, secure thinking, and strong communication.",
  design:
    "[ROLE_TITLE] role for portfolio-driven designers. Basic Figma skills, visual hierarchy, and user-flow thinking are expected. Academic projects, redesigns, and internships are valid proof of ability. You will collaborate with product and engineering, iterate quickly, and improve usability. We value clarity and empathy over years of agency experience.",
  analytics_business:
    "[ROLE_TITLE] role for candidates with analytical thinking and reporting skills. Spreadsheet/SQL basics, dashboard exposure, and communication with stakeholders are important. Coursework, capstones, and internship assignments in analysis or reporting are valid experience. We value structured problem-solving and data storytelling.",
  testing_qa:
    "[ROLE_TITLE] role focused on product quality and validation. Understanding test cases, bug reporting, and QA fundamentals is expected. You may have hands-on experience from projects, QA labs, or internships. We value detail orientation, reproducible bug reports, and quality mindset.",
  systems_it:
    "[ROLE_TITLE] role for IT and systems learners. Networking basics, OS troubleshooting, and support workflows are expected. Coursework, certifications, and practical labs in infrastructure or support are valuable. We value reliability, documentation, and user support communication.",
  product_management:
    "[ROLE_TITLE] role for candidates who can plan, prioritize, and communicate clearly. Exposure to agile workflows, documentation, and cross-team collaboration is expected. Internships, club leadership, and product case studies are relevant proof. We value ownership mindset, clarity, and execution focus.",
  specialized_tech:
    "[ROLE_TITLE] role in specialized technology domains. Foundational projects, prototypes, or labs in this domain are expected rather than deep production experience. You will work on implementation tasks, debugging, and feature experiments with guidance. We value curiosity and practical building ability.",
  web3_emerging:
    "[ROLE_TITLE] role for emerging technology builders. Basic understanding of blockchain/web3 concepts and small project experience are expected. You may have explored smart contracts, wallets, or decentralized app workflows. We value secure coding habits and practical experimentation.",
  tech_business:
    "[ROLE_TITLE] role at the intersection of technology and business outcomes. Strong communication, basic technical understanding, and measurable execution are expected. Projects, internships, campaigns, or writing samples can demonstrate fit. We value clarity, impact orientation, and continuous improvement.",
  entry_level:
    "[ROLE_TITLE] role tailored for entry-level candidates. We evaluate fundamentals, learning agility, communication, and project evidence more than years of experience. Coursework, internships, and practical assignments are valid signals. We value growth mindset and consistency.",
  trending_ai:
    "[ROLE_TITLE] role in modern AI workflows. Strong fundamentals in prompting, automation logic, API usage, and experiment-driven iteration are expected. Projects involving LLM tools, workflows, or AI-assisted products are valuable. We value practical outcomes, prompt quality, and responsible AI usage.",
};

const ARCHETYPE_ADVANCED = {
  software_dev:
    "Optional advanced keywords: microservices, distributed systems, gRPC, event-driven architecture, large-scale CI/CD, production observability, and secure SDLC.",
  mobile_dev:
    "Optional advanced keywords: advanced native optimization, offline sync strategies, app store optimization, background services, and mobile analytics pipelines.",
  ai_data_ml:
    "Optional advanced keywords: transformer fine-tuning, vector databases, MLOps pipelines, GPU inference optimization, and model evaluation frameworks.",
  cloud_devops:
    "Optional advanced keywords: Kubernetes operations, Terraform/Pulumi, service mesh, multi-region architecture, incident response, and SRE metrics.",
  cybersecurity:
    "Optional advanced keywords: SIEM operations, penetration methodology, zero-trust design, cloud security posture management, and compliance automation.",
  design:
    "Optional advanced keywords: large-scale design systems, design ops, accessibility governance, advanced prototyping, and experimentation frameworks.",
  analytics_business:
    "Optional advanced keywords: semantic modeling, advanced BI stack architecture, dbt workflows, experimentation analytics, and executive KPI frameworks.",
  testing_qa:
    "Optional advanced keywords: framework-level automation, CI test orchestration, contract testing, performance benchmarking, and quality engineering strategy.",
  systems_it:
    "Optional advanced keywords: enterprise network hardening, high-availability architecture, identity federation, backup strategy, and infra automation.",
  product_management:
    "Optional advanced keywords: roadmap governance, quantitative prioritization models, platform strategy, product analytics depth, and multi-team delivery.",
  specialized_tech:
    "Optional advanced keywords: real-time optimization, low-level systems debugging, hardware/software integration, and domain-specific performance tuning.",
  web3_emerging:
    "Optional advanced keywords: smart contract security audits, L2 scaling, tokenomics modeling, cross-chain integration, and protocol-level architecture.",
  tech_business:
    "Optional advanced keywords: technical SEO at scale, growth experimentation architecture, marketing automation pipelines, and analytics instrumentation.",
  entry_level:
    "Optional advanced keywords: production delivery ownership, architecture contributions, advanced tooling depth, and cross-functional leadership.",
  trending_ai:
    "Optional advanced keywords: agentic workflows, RAG architecture, evaluation harnesses, prompt chaining reliability, and enterprise GenAI integration.",
};

const ARCHETYPE_META = {
  software_dev: { icon: Laptop, subtitle: "Frontend · Backend · API" },
  mobile_dev: { icon: Smartphone, subtitle: "Android · iOS · Cross-platform" },
  ai_data_ml: { icon: Brain, subtitle: "AI · ML · Data" },
  cloud_devops: { icon: Server, subtitle: "Cloud · DevOps · SRE" },
  cybersecurity: { icon: Shield, subtitle: "Security · Risk · Defense" },
  design: { icon: Layout, subtitle: "UI · UX · Product" },
  analytics_business: { icon: BarChart3, subtitle: "BI · Insights · Reporting" },
  testing_qa: { icon: TestTube2, subtitle: "QA · Testing · Automation" },
  systems_it: { icon: Network, subtitle: "Systems · IT · Network" },
  product_management: { icon: Briefcase, subtitle: "Product · Delivery · Agile" },
  specialized_tech: { icon: Gamepad2, subtitle: "Specialized Engineering" },
  web3_emerging: { icon: Blocks, subtitle: "Web3 · Blockchain" },
  tech_business: { icon: PenTool, subtitle: "Tech + Business" },
  entry_level: { icon: Code2, subtitle: "Intern · Junior · GET" },
  trending_ai: { icon: Database, subtitle: "GenAI · LLM · Automation" },
};

const ARCHETYPE_CATEGORY = {
  software_dev: { id: "software", label: "Software" },
  mobile_dev: { id: "mobile", label: "Mobile" },
  ai_data_ml: { id: "ai_data_ml", label: "AI / Data / ML" },
  cloud_devops: { id: "cloud_devops", label: "Cloud / DevOps" },
  cybersecurity: { id: "cybersecurity", label: "Cybersecurity" },
  design: { id: "design", label: "Design" },
  analytics_business: { id: "analytics_business", label: "Analytics / Business" },
  testing_qa: { id: "testing_qa", label: "Testing / QA" },
  systems_it: { id: "systems_it", label: "Systems / IT" },
  product_management: { id: "product_management", label: "Product / Management" },
  specialized_tech: { id: "specialized", label: "Specialized Tech" },
  web3_emerging: { id: "web3", label: "Web3 / Emerging" },
  tech_business: { id: "tech_business", label: "Tech + Business" },
  entry_level: { id: "entry_level", label: "Entry Level" },
  trending_ai: { id: "trending", label: "Trending" },
};

/** @type {{ title: string; archetype: keyof typeof ARCHETYPE_BASE }[]} */
const ROLE_LIST = [
  { title: "Software Developer", archetype: "software_dev" },
  { title: "Frontend Developer", archetype: "software_dev" },
  { title: "Backend Developer", archetype: "software_dev" },
  { title: "Full Stack Developer", archetype: "software_dev" },
  { title: "Web Developer", archetype: "software_dev" },
  { title: "Software Engineer", archetype: "software_dev" },
  { title: "Application Developer", archetype: "software_dev" },
  { title: "API Developer", archetype: "software_dev" },

  { title: "Android Developer", archetype: "mobile_dev" },
  { title: "iOS Developer", archetype: "mobile_dev" },
  { title: "Flutter Developer", archetype: "mobile_dev" },
  { title: "React Native Developer", archetype: "mobile_dev" },
  { title: "Mobile App Developer", archetype: "mobile_dev" },

  { title: "AI Engineer", archetype: "ai_data_ml" },
  { title: "Machine Learning Engineer", archetype: "ai_data_ml" },
  { title: "Data Scientist", archetype: "ai_data_ml" },
  { title: "Data Analyst", archetype: "ai_data_ml" },
  { title: "Data Engineer", archetype: "ai_data_ml" },
  { title: "NLP Engineer", archetype: "ai_data_ml" },
  { title: "Computer Vision Engineer", archetype: "ai_data_ml" },
  { title: "Deep Learning Engineer", archetype: "ai_data_ml" },

  { title: "DevOps Engineer", archetype: "cloud_devops" },
  { title: "Cloud Engineer", archetype: "cloud_devops" },
  { title: "Site Reliability Engineer", archetype: "cloud_devops" },
  { title: "Platform Engineer", archetype: "cloud_devops" },
  { title: "Infrastructure Engineer", archetype: "cloud_devops" },
  { title: "AWS Engineer", archetype: "cloud_devops" },
  { title: "Cloud Architect", archetype: "cloud_devops" },

  { title: "Cybersecurity Analyst", archetype: "cybersecurity" },
  { title: "Security Engineer", archetype: "cybersecurity" },
  { title: "Ethical Hacker", archetype: "cybersecurity" },
  { title: "Penetration Tester", archetype: "cybersecurity" },
  { title: "SOC Analyst", archetype: "cybersecurity" },
  { title: "Security Architect", archetype: "cybersecurity" },

  { title: "UI Designer", archetype: "design" },
  { title: "UX Designer", archetype: "design" },
  { title: "Product Designer", archetype: "design" },
  { title: "Interaction Designer", archetype: "design" },
  { title: "Visual Designer", archetype: "design" },

  { title: "Business Analyst", archetype: "analytics_business" },
  { title: "BI Analyst", archetype: "analytics_business" },
  { title: "Analytics Engineer", archetype: "analytics_business" },
  { title: "Data Visualization Engineer", archetype: "analytics_business" },

  { title: "QA Engineer", archetype: "testing_qa" },
  { title: "Automation Tester", archetype: "testing_qa" },
  { title: "Manual Tester", archetype: "testing_qa" },
  { title: "Performance Tester", archetype: "testing_qa" },
  { title: "Test Engineer", archetype: "testing_qa" },

  { title: "System Administrator", archetype: "systems_it" },
  { title: "Network Engineer", archetype: "systems_it" },
  { title: "Database Administrator", archetype: "systems_it" },
  { title: "IT Support Engineer", archetype: "systems_it" },
  { title: "System Engineer", archetype: "systems_it" },

  { title: "Product Manager", archetype: "product_management" },
  { title: "Technical Product Manager", archetype: "product_management" },
  { title: "Project Manager", archetype: "product_management" },
  { title: "Scrum Master", archetype: "product_management" },
  { title: "Program Manager", archetype: "product_management" },

  { title: "Game Developer", archetype: "specialized_tech" },
  { title: "Blockchain Developer", archetype: "specialized_tech" },
  { title: "Embedded Systems Engineer", archetype: "specialized_tech" },
  { title: "Firmware Engineer", archetype: "specialized_tech" },
  { title: "AR/VR Developer", archetype: "specialized_tech" },

  { title: "Web3 Developer", archetype: "web3_emerging" },
  { title: "Smart Contract Developer", archetype: "web3_emerging" },
  { title: "Crypto Engineer", archetype: "web3_emerging" },
  { title: "Metaverse Developer", archetype: "web3_emerging" },

  { title: "Technical Writer", archetype: "tech_business" },
  { title: "SEO Specialist", archetype: "tech_business" },
  { title: "Digital Marketing Specialist", archetype: "tech_business" },
  { title: "Growth Engineer", archetype: "tech_business" },

  { title: "Junior Developer", archetype: "entry_level" },
  { title: "Software Intern", archetype: "entry_level" },
  { title: "Data Intern", archetype: "entry_level" },
  { title: "AI Intern", archetype: "entry_level" },
  { title: "Graduate Engineer Trainee", archetype: "entry_level" },

  { title: "Prompt Engineer", archetype: "trending_ai" },
  { title: "Generative AI Engineer", archetype: "trending_ai" },
  { title: "LLM Engineer", archetype: "trending_ai" },
  { title: "AI Automation Engineer", archetype: "trending_ai" },
  { title: "AI Product Engineer", archetype: "trending_ai" },
];

function toId(title) {
  return String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function fillRole(template, title) {
  return template.replace(/\[ROLE_TITLE\]/g, title);
}

/** @typedef {{ id: string; title: string; subtitle: string; category: string; categoryId: string; Icon: import('lucide-react').LucideIcon }} JobRoleCard */

/** @type {JobRoleCard[]} */
export const jobRoleCards = ROLE_LIST.map((role) => {
  const meta = ARCHETYPE_META[role.archetype];
  const category = ARCHETYPE_CATEGORY[role.archetype];
  return {
    id: toId(role.title),
    title: role.title,
    subtitle: meta.subtitle,
    category: category.label,
    categoryId: category.id,
    Icon: meta.icon,
  };
});

export const jobRoleCategories = [
  { id: "all", label: "All" },
  ...Array.from(
    new Map(jobRoleCards.map((card) => [card.categoryId, { id: card.categoryId, label: card.category }])).values()
  ),
];

export const jobDescriptionsBase = Object.fromEntries(
  ROLE_LIST.map((role) => [toId(role.title), fillRole(ARCHETYPE_BASE[role.archetype], role.title)])
);

export const jobDescriptionsAdvanced = Object.fromEntries(
  ROLE_LIST.map((role) => [toId(role.title), ARCHETYPE_ADVANCED[role.archetype]])
);

/**
 * @param {string} roleId
 * @param {boolean} includeAdvanced
 */
export function buildJobDescription(roleId, includeAdvanced) {
  const base = jobDescriptionsBase[roleId] ?? "";
  const adv = jobDescriptionsAdvanced[roleId];
  if (includeAdvanced && adv && String(adv).trim()) {
    return `${base}\n\n${adv}`.trim();
  }
  return base.trim();
}

/** @deprecated Use jobDescriptionsBase for previews; buildJobDescription() for full JD. */
export const jobDescriptions = jobDescriptionsBase;
