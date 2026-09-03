export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-sm text-zinc-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
      {label}
    </div>
  );
}
