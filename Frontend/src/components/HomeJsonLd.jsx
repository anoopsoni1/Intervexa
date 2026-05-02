import { Head } from "vite-react-ssg";

const ORGANIZATION_JSON = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Ansoyal AI",
  url: "https://intervexa.co-vid.in/",
  description:
    "Ansoyal AI helps you build your resume and portfolio, get career guidance, and practice with AI mock interviews—all in your browser.",
  founder: {
    "@type": "Person",
    name: "Anoop Soni",
    url: "https://www.linkedin.com/in/anoop-soni-55277a321/",
  },
};

const FAQ_JSON = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Ansoyal AI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ansoyal AI is a career helper in your browser. It helps you fix your resume and portfolio for hiring software, plan your next step, practice coding, and run mock interviews with scores and tips.",
      },
    },
    {
      "@type": "Question",
      name: "Is Ansoyal AI free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Core resume and interview practice are free so you can try the product. Paid plans may add more usage or extra templates—see Pricing for details.",
      },
    },
    {
      "@type": "Question",
      name: "How does Ansoyal AI work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You upload or enter your details, get AI suggestions and a resume score, then practice mock or coding interviews. After each session you get clear feedback and scores you can use right away.",
      },
    },
    {
      "@type": "Question",
      name: "Can Ansoyal AI help me prepare for technical interviews?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can practice coding-style questions in a simple space and read AI notes on how you explain your thinking—not only whether the answer was right.",
      },
    },
    {
      "@type": "Question",
      name: "Does Ansoyal AI provide interview feedback?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You get notes on how clear your answers were, how you organized them, and how well they fit the question, plus an overall view so you know what to improve next.",
      },
    },
    {
      "@type": "Question",
      name: "Is Ansoyal AI suitable for beginners?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. It works for first-time job seekers and experienced hires. Resume steps are guided, and interview practice is calm and easy to repeat.",
      },
    },
    {
      "@type": "Question",
      name: "Can I track my progress on Ansoyal AI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can see your scores and past practice so you know if you are improving over time.",
      },
    },
    {
      "@type": "Question",
      name: "Does Ansoyal AI support mock interviews?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. AI mock interviews use realistic questions and pacing so you can practice anytime without booking another person.",
      },
    },
    {
      "@type": "Question",
      name: "Is Ansoyal AI available online?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. It runs in your web browser. Sign in from any device with internet. You do not need to install the website.",
      },
    },
    {
      "@type": "Question",
      name: "Why should I use Ansoyal AI for interview preparation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You get one place to fix your resume, practice under pressure, and read feedback you can use the same day—so you feel ready instead of guessing.",
      },
    },
  ],
};

const PERSON_JSON = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Anoop Soni",
  jobTitle: "Founder & Software Developer",
  url: "https://intervexa.co-vid.in/",
  sameAs: [
    "https://www.linkedin.com/in/anoop-soni-55277a321",
    "https://github.com/anoopsoni1",
    "https://www.instagram.com/anup_soni_1?igsh=MTZldGQwbXRjaDMyeA==",
  ],
};

/** Home-only structured data (kept out of `index.html` so other SSG routes are not polluted). */
export default function HomeJsonLd() {
  return (
    <Head>
      <meta name="author" content="Anoop Soni, Founder & Software Developer" />
      <script type="application/ld+json">{JSON.stringify(ORGANIZATION_JSON)}</script>
      <script type="application/ld+json">{JSON.stringify(FAQ_JSON)}</script>
      <script type="application/ld+json">{JSON.stringify(PERSON_JSON)}</script>
    </Head>
  );
}
