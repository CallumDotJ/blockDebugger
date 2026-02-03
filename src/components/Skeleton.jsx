export default function Skeleton() { // simple loading skeleton 
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 w-2/3 rounded bg-slate-100" />
      <div className="h-4 w-1/2 rounded bg-slate-100" />
      <div className="h-24 w-full rounded bg-slate-100" />
    </div>
  );
}