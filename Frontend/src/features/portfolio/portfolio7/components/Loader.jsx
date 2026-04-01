export default function Loader({ name, role }) {
  return (
    <div id="p7-loader" className="fixed inset-0 z-[120] grid place-items-center bg-black">
      <div className="text-center">
          <h2 className="mt-3 text-4xl md:text-6xl text-white">{name}</h2>
        <p className="text-[11px] uppercase tracking-[0.45em] text-white/45">{role}</p>
      </div>
    </div>
  );
}

