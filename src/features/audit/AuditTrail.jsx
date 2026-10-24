import { useCallback, useEffect, useState } from "react";
import { Activity, AlertCircle, Clock3, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { fetchAuditEvents } from "./auditApi";

const actionStyles = {
  "submission.created": "border-blue-500/30 bg-blue-500/10 text-blue-300",
  "approval.decided": "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  "brand.created": "border-violet-500/30 bg-violet-500/10 text-violet-300",
  "brand.updated": "border-amber-500/30 bg-amber-500/10 text-amber-300",
  "brand.deleted": "border-red-500/30 bg-red-500/10 text-red-300",
};

function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString();
}

export default function AuditTrail() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = useCallback(async (term = search) => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchAuditEvents({ search: term, limit: 150 });
      setEvents(result);
    } catch (err) {
      setError(err.message || "Could not load audit events. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadEvents("");
  }, []); // Load on mount; search is applied when the user submits it.

  function handleSearch(event) {
    event.preventDefault();
    loadEvents(search);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-800 bg-[#0d1424] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-blue-400">
              <ShieldCheck size={19} />
              <span className="text-xs font-semibold uppercase tracking-wider">Governance log</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Audit Trail</h3>
            <p className="mt-1 text-sm text-slate-400">
              A chronological record of submissions, review decisions, and brand changes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadEvents(search)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <form onSubmit={handleSearch} className="mt-5 flex flex-col gap-2 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search audit events</span>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search action, actor, record ID..."
              className="w-full rounded-lg border border-slate-700 bg-[#090e1a] py-2.5 pl-9 pr-3 text-sm text-slate-100 outline-none focus:border-blue-500"
            />
          </label>
          <button className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">
            Search
          </button>
        </form>
      </section>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-800 bg-[#0d1424]">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h4 className="font-semibold text-white">Activity history</h4>
            <p className="mt-1 text-xs text-slate-500">{events.length} event(s) loaded</p>
          </div>
          <Activity size={19} className="text-slate-500" />
        </div>

        {loading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-slate-400">
            <RefreshCw size={17} className="animate-spin" /> Loading audit events...
          </div>
        ) : events.length === 0 ? (
          <div className="p-10 text-center">
            <Clock3 size={28} className="mx-auto mb-3 text-slate-600" />
            <p className="font-medium text-slate-200">No audit events found</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              New submissions and review decisions will appear here after audit logging is connected.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {events.map((event) => (
              <article key={event.id} className="flex gap-3 p-5 sm:gap-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-900">
                  <Activity size={17} className="text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${actionStyles[event.action] || "border-slate-700 bg-slate-800 text-slate-300"}`}>
                      {event.action || "activity"}
                    </span>
                    <span className="text-xs text-slate-500">{formatDate(event.createdAt)}</span>
                  </div>
                  <p className="mt-2 break-words text-sm text-slate-200">
                    {event.description || "An action was recorded."}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>Actor: {event.actor || "Unknown"}</span>
                    <span>Record: {event.entityType || "item"} {event.entityId ? `· ${event.entityId}` : ""}</span>
                  </div>
                  {event.details && Object.keys(event.details).length > 0 && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs text-blue-400 hover:text-blue-300">View event details</summary>
                      <pre className="mt-2 overflow-x-auto rounded-lg bg-[#090e1a] p-3 text-xs text-slate-400">
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
