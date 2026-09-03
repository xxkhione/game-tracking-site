import Link from "next/link";
import Navbar from "@/components/Navbar";
import TrackGameSection from "@/components/TrackGameSection";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import { publicApi } from "@/lib/api";

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const game = await publicApi.getGame(id);
    return { title: `${game.title} | Game Backlog` };
  } catch {
    return { title: "Game Details | Game Backlog" };
  }
}

export default async function GameDetailPage({ params }) {
  const { id } = await params;
  let game = null;
  let error = null;

  try {
    game = await publicApi.getGame(id);
  } catch (err) {
    error = err.message;
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <PageHeader
          title={game?.title || "Game not found"}
          subtitle={game ? `${game.genre} · ${game.platform} · ${game.releaseyear}` : error}
          action={
            <Link href="/games">
              <Button variant="secondary">Back to catalog</Button>
            </Link>
          }
        />

        {game ? (
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
              {game.coverurl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={game.coverurl}
                  alt={`${game.title} cover`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-80 items-center justify-center text-zinc-400">
                  No cover image
                </div>
              )}
            </div>

            <div className="space-y-6">
              <p className="text-lg leading-8 text-zinc-700">{game.description}</p>
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-zinc-900">Details</h2>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm text-zinc-500">Platform</dt>
                    <dd className="font-medium text-zinc-900">{game.platform}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-zinc-500">Genre</dt>
                    <dd className="font-medium text-zinc-900">{game.genre}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-zinc-500">Release year</dt>
                    <dd className="font-medium text-zinc-900">{game.releaseyear}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-zinc-500">Achievements</dt>
                    <dd className="font-medium text-zinc-900">{game.achievementcount}</dd>
                  </div>
                </dl>
              </div>

              <TrackGameSection gameId={game.gameid} />
            </div>
          </div>
        ) : null}
      </main>
    </>
  );
}
