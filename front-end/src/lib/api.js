const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.error || "Something went wrong.", response.status);
  }

  return data;
}

export function apiRequest(path, options = {}, token = null) {
  const headers = { ...options.headers };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return request(path, { ...options, headers });
}

export const publicApi = {
  getGames: () => request("/games"),
  getGame: (gameId) => request(`/games/${gameId}`),
  register: (body) =>
    request("/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) =>
    request("/login", { method: "POST", body: JSON.stringify(body) }),
};

export const authApi = {
  getMe: (token) => apiRequest("/me", {}, token),
  getLibrary: (token) => apiRequest("/me/games", {}, token),
  addToLibrary: (token, body) =>
    apiRequest("/me/games", { method: "POST", body: JSON.stringify(body) }, token),
  updateLibraryEntry: (token, userGameId, body) =>
    apiRequest(
      `/me/games/${userGameId}`,
      { method: "PATCH", body: JSON.stringify(body) },
      token
    ),
  removeFromLibrary: (token, userGameId) =>
    apiRequest(`/me/games/${userGameId}`, { method: "DELETE" }, token),
  submitPendingGame: (token, body) =>
    apiRequest("/pending-games", { method: "POST", body: JSON.stringify(body) }, token),
};

export const adminApi = {
  getPendingGames: (token) => apiRequest("/admin/pending-games", {}, token),
  approvePendingGame: (token, pendingGameId, body) =>
    apiRequest(
      `/admin/pending-games/${pendingGameId}/approve`,
      { method: "POST", body: JSON.stringify(body) },
      token
    ),
  rejectPendingGame: (token, pendingGameId, body) =>
    apiRequest(
      `/admin/pending-games/${pendingGameId}/reject`,
      { method: "PATCH", body: JSON.stringify(body) },
      token
    ),
  createGame: (token, body) =>
    apiRequest("/admin/games", { method: "POST", body: JSON.stringify(body) }, token),
  deleteGame: (token, gameId) =>
    apiRequest(`/admin/games/${gameId}`, { method: "DELETE" }, token),
};

export const GAME_STATUSES = [
  "Plan_to_play",
  "Playing",
  "Completed",
  "On_hold",
  "Dropped",
];

export function formatStatus(status) {
  return status.replaceAll("_", " ");
}
