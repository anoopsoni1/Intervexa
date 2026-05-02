import { Head } from "vite-react-ssg";

const SITE_ORIGIN = ("https://intervexa.co-vid.in").replace(/\/$/, "");

function absoluteUrl(urlOrPath) {
  if (!urlOrPath) return `${SITE_ORIGIN}/one.png`;
  try {
    return new URL(urlOrPath, `${SITE_ORIGIN}/`).href;
  } catch {
    return urlOrPath;
  }
}

export default function SEO({
  title = "Ansoyal AI",
  description = "AI-powered career platform",
  image = "/default-og.png",
  url = `${SITE_ORIGIN}/`,
  keywords = "AI resume builder, ATS checker, interview preparation, career platform",
}) {
  const absImage = absoluteUrl(image);
  const absUrl = absoluteUrl(url);

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absImage} />
      <meta property="og:url" content={absUrl} />
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absImage} />

      <link rel="canonical" href={absUrl} />
    </Head>
  );
}
