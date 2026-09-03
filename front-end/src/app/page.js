import Link from "next/link";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import GameCard from "@/components/GameCard";
import Button from "@/components/Button";
import { publicApi } from "@/lib/api";

export default async function HomePage() {
  let games = []

  try {
    games = await publicApi.getGames()
  } catch {
    games = []
  }

  const featuredGames = games.slice(0, 3)

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <section className="rounded-3xl bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 px-8 py-14 text-white shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-100">
            Personal game tracker
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Track what you want to play, what you are playing, and what you have finished.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-violet-100">
            Browse the public catalog anonymously, create an account to build your library,
            and submit new games for admin review.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/games">
              <Button variant="inverse">Browse catalog</Button>
            </Link>
            <Link href="/register">
              <Button variant="hero-outline">Create account</Button>
            </Link>
          </div>
        </section>

        <section className="mt-12">
          <PageHeader
            title="Featured games"
            subtitle=""
            action={
              <Link href="/games">
                <Button variant="secondary">View all games</Button>
              </Link>
            }
          />

          {featuredGames.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredGames.map((game) => (
                <GameCard key={game.gameid} game={game} variant="compact" />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center text-zinc-600">
              Start the API server and load the database schema to see games here.
            </p>
          )}
        </section>
      </main>
    </>
  )
}
