import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import CatalogGameGrid from "@/components/CatalogGameGrid";
import { publicApi } from "@/lib/api";

export const metadata = {
  title: "Game Catalog | Game Backlog",
};

export default async function GamesPage() {
  let games = []

  try {
    games = await publicApi.getGames()
  } catch {
    games = []
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <PageHeader
          title="Game catalog"
          subtitle=""
        />

        {games.length > 0 ? (
          <CatalogGameGrid games={games} />
        ) : (
          <p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center text-zinc-600">
            No games found. Make sure the Express API and PostgreSQL database are running.
          </p>
        )}
      </main>
    </>
  )
}
