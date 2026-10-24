const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:5000/api'
    : 'https://brandora-ai.onrender.com/api')
export async function fetchAuditEvents({ search = "", limit = 100 } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (search.trim()) params.set("search", search.trim());

  const response = await fetch(`${API_BASE}/audit?${params.toString()}`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Could not load the audit trail.");
  }

  return Array.isArray(data.events) ? data.events : [];
}
