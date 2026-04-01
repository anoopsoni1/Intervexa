export default function EducationSection({ blocks }) {
  const list = blocks.length
    ? blocks
    : [{ degree: "Your degree or program", school: "Institution", dateLine: "Add education in your profile" }];

  return (
    <section id="p7-education" data-section className="bg-white/[0.02] px-6 py-20 md:px-12 lg:px-20">
      <div data-section-inner>
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Academic</p>
        <h2 data-split="chars" className="mt-3 max-w-4xl text-3xl font-semibold leading-[1.05] text-white md:text-5xl">
          Education
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {list.map((edu, i) => (
            <div key={`${edu.degree}-${i}`} data-stagger data-micro className="rounded-2xl border border-white/12 bg-black/30 p-6 md:p-8">
              <p className="text-lg font-semibold text-white">{edu.degree || "Program"}</p>
              {edu.school ? <p className="mt-2 text-sm text-[#e85b25]/90">{edu.school}</p> : null}
              {edu.dateLine ? <p className="mt-3 text-xs uppercase tracking-[0.16em] text-white/45">{edu.dateLine}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
