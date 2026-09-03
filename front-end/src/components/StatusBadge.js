import { formatStatus } from "@/lib/api";

const colors = {
  Plan_to_play: "bg-sky-100 text-sky-800",
  Playing: "bg-emerald-100 text-emerald-800",
  Completed: "bg-violet-100 text-violet-800",
  On_hold: "bg-amber-100 text-amber-800",
  Dropped: "bg-rose-100 text-rose-800",
  Pending: "bg-amber-100 text-amber-800",
  Approved: "bg-emerald-100 text-emerald-800",
  Rejected: "bg-rose-100 text-rose-800",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colors[status] || "bg-zinc-100 text-zinc-700"}`}
    >
      {formatStatus(status)}
    </span>
  );
}
