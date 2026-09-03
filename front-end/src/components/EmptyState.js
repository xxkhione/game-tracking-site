import Button from "@/components/Button";

export default function EmptyState({ title, message, actionLabel, onAction, href }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center">
      <h2 className="text-xl font-semibold text-zinc-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">{message}</p>
      {actionLabel ? (
        <div className="mt-6">
          {href ? (
            <a href={href}>
              <Button>{actionLabel}</Button>
            </a>
          ) : (
            <Button onClick={onAction}>{actionLabel}</Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
