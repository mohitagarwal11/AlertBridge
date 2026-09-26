const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const error = new Error(
      errorBody?.error?.message || "The request could not be completed.",
    );
    error.code = errorBody?.error?.code || "REQUEST_FAILED";
    throw error;
  }

  return response.json();
}

export function normalizeAlertList(response) {
  return Array.isArray(response) ? response : response?.data || [];
}

export function normalizeStatistics(response) {
  return {
    ...response,
    recipients: response?.totalRecipients ?? response?.recipients ?? 0,
  };
}

export const api = {
  listAlerts: async (status) =>
    normalizeAlertList(
      await request(
        status
          ? `/api/alerts?status=${encodeURIComponent(status)}`
          : "/api/alerts",
      ),
    ),
  getAlert: (alertId) => request(`/api/alerts/${alertId}`),
  createAlert: (alert) =>
    request("/api/alerts", {
      method: "POST",
      body: JSON.stringify(alert),
    }),
  processAlert: (alertId) =>
    request(`/api/alerts/${alertId}/process`, { method: "POST" }),
  sendAlert: (alertId) =>
    request(`/api/alerts/${alertId}/send`, { method: "POST" }),
  viewAlert: (alertId, userId) =>
    request(`/api/alerts/${alertId}/view`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),
  acknowledgeAlert: (alertId, userId) =>
    request(`/api/alerts/${alertId}/acknowledge`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),
  getStatistics: async (alertId) =>
    normalizeStatistics(await request(`/api/alerts/${alertId}/statistics`)),
};

export { apiUrl };
