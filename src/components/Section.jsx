export default function Section({ title, right, children }) { // right = space for badge
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {right}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}