import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import Button from "@/components/Button";

export default function GameCard({
  game,
  variant = "catalog",
  status,
  playtimeHours,
  obtainedAchievements,
  actionLabel,
  onAction,
  footer,
}) {
  const title = game.title
  const coverUrl = game.coverurl || game.cover_url
  const gameId = game.gameid || game.fgameid
  const platform = game.platform
  const genre = game.genre
  const releaseYear = game.releaseyear || game.release_year
  const description = game.description
  const achievementCount = game.achievementcount ?? game.achievement_count

  const isCompact = variant === "compact"

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`relative bg-zinc-100 ${isCompact ? "h-36" : "h-48"}`}>
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`${title} cover`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">
            No cover image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900">
              <Link href={`/games/${gameId}`} className="hover:text-violet-700">
                {title}
              </Link>
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              {genre} · {platform} · {releaseYear}
            </p>
          </div>
          {status ? <StatusBadge status={status} /> : null}
        </div>

        {!isCompact && description ? (
          <p className="line-clamp-3 text-sm text-zinc-600">{description}</p>
        ) : null}

        {variant === "library" ? (
          <div className="grid grid-cols-2 gap-3 text-sm text-zinc-600">
            <p>
              <span className="font-medium text-zinc-800">Playtime:</span>{" "}
              {playtimeHours ?? 0} hrs
            </p>
            <p>
              <span className="font-medium text-zinc-800">Achievements:</span>{" "}
              {obtainedAchievements ?? 0}
              {achievementCount != null ? ` / ${achievementCount}` : ""}
            </p>
          </div>
        ) : null}

        {footer ? <div className="mt-auto">{footer}</div> : null}

        {actionLabel && onAction ? (
          <Button className="mt-auto w-full" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </article>
  )
}
