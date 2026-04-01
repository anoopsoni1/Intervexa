import ResumeDesignListPage from "./ResumeDesignListPage.jsx";

/** Classic resume design list — for all users (replaces premium-only gate). */
export default function ClassResumeDesignViewPage() {
  return (
    <ResumeDesignListPage styleKey="classic" hubPath="/templates/classic" styleTitle="Classic" />
  );
}
