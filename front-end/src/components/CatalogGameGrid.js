"use client";

import { useEffect, useState } from "react";
import GameCard from "@/components/GameCard";
import AddToLibraryCardButton from "@/components/AddToLibraryCardButton";
import { authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function CatalogGameGrid({ games }) {
  const { isAuthenticated } = useAuth()
  const [libraryGameIds, setLibraryGameIds] = useState(new Set())

  useEffect(() => {
    if (!isAuthenticated) {
      setLibraryGameIds(new Set())
      return
    }

    authApi
      .getLibrary()
      .then((entries) => {
        setLibraryGameIds(new Set(entries.map((entry) => entry.fgameid)))
      })
      .catch(() => {
        setLibraryGameIds(new Set())
      })
  }, [isAuthenticated])

  function handleAdded(gameId) {
    setLibraryGameIds((current) => new Set([...current, gameId]))
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {games.map((game) => (
        <GameCard
          key={game.gameid}
          game={game}
          footer={
            <AddToLibraryCardButton
              gameId={game.gameid}
              inLibrary={libraryGameIds.has(game.gameid)}
              onAdded={handleAdded}
            />
          }
        />
      ))}
    </div>
  )
}