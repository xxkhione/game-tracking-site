const API_URL = "http://localhost:3001"

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new ApiError(data.error || "Something went wrong.", response.status)
  }

  return data
}

export const publicApi = {
  getGames: () => request("/games"),
  getGame: (gameId) => request(`/games/${gameId}`),
  register: (body) =>
    request("/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) =>
    request("/login", { method: "POST", body: JSON.stringify(body) }),
}

export const authApi = {
  getMe: () => request("/me"),
  logout: () => request("/logout", { method: "POST" }),
  getLibrary: () => request("/me/games"),
  addToLibrary: (body) =>
    request("/me/games", { method: "POST", body: JSON.stringify(body) }),
  updateLibraryEntry: (userGameId, body) =>
    request(`/me/games/${userGameId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  removeFromLibrary: (userGameId) =>
    request(`/me/games/${userGameId}`, { method: "DELETE" }),
  submitPendingGame: (body) =>
    request("/pending-games", { method: "POST", body: JSON.stringify(body) }),
}

export const adminApi = {
  getPendingGames: () => request("/admin/pending-games"),
  approvePendingGame: (pendingGameId, body) =>
    request(`/admin/pending-games/${pendingGameId}/approve`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  rejectPendingGame: (pendingGameId, body) =>
    request(`/admin/pending-games/${pendingGameId}/reject`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  createGame: (body) =>
    request("/admin/games", { method: "POST", body: JSON.stringify(body) }),
  deleteGame: (gameId) =>
    request(`/admin/games/${gameId}`, { method: "DELETE" }),
}

export const GAME_STATUSES = [
  "Plan_to_play",
  "Playing",
  "Completed",
  "On_hold",
  "Dropped",
]

export function formatStatus(status) {
  return status.replaceAll("_", " ")
}
