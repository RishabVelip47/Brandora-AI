import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  RefreshCw,
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  ShieldCheck,
} from 'lucide-react'
import { fetchApprovals } from '../approvals/approvalsApi'

const statuses = [
  'All',
  'Pending Review',
  'Approved',
  'Rejected',
  'Changes Requested',
]

const statusStyles = {
  'Pending Review': 'bg-amber-500/10 text-amber-300 ring-amber-500/20',
  Approved: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20',
  Rejected: 'bg-red-500/10 text-red-300 ring-red-500/20',
  'Changes Requested': 'bg-blue-500/10 text-blue-300 ring-blue-500/20',
}

function formatDate(value) {
  if (!value) return '—'

  const date = value?.toDate ? value.toDate() : new Date(value)

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString()
}

export default function ContentReviews({ onNavigate }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')

  async function loadReviews() {
    setLoading(true)
    setError('')

    try {
      const data = await fetchApprovals()
      setReviews(data)
    } catch (err) {
      setError(err.message || 'Unable to load content reviews.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [])

  const counts = useMemo(() => ({
    total: reviews.length,
    pending: reviews.filter(
      (item) => item.status === 'Pending Review'
    ).length,
    approved: reviews.filter(
      (item) => item.status === 'Approved'
    ).length,
    rejected: reviews.filter(
      (item) => item.status === 'Rejected'
    ).length,
  }), [reviews])

  const filteredReviews = reviews.filter((item) => {
    const query = search.toLowerCase()

    const matchesSearch = [
      item.title,
      item.brandName,
      item.content,
      item.status,
    ].some((value) => String(value || '').toLowerCase().includes(query))

    return matchesSearch &&
      (status === 'All' || item.status === status)
  })

  const cardClass =
    'rounded-xl border border-slate-800 bg-[#0d1424] p-5'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Review overview</h3>
          <p className="mt-1 text-sm text-slate-400">
            All content submitted for human review.
          </p>
        </div>

        <button
          onClick={loadReviews}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total reviews" value={counts.total} icon={FileCheck} />
        <StatCard title="Pending" value={counts.pending} icon={Clock} />
        <StatCard title="Approved" value={counts.approved} icon={CheckCircle2} />
        <StatCard title="Rejected" value={counts.rejected} icon={XCircle} />
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
          <button onClick={loadReviews} className="ml-2 underline">
            Try again
          </button>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-800 bg-[#0d1424]">
        <div className="space-y-4 border-b border-slate-800 p-4 sm:p-5">
          <div>
            <h3 className="font-semibold">Submission history</h3>
            <p className="mt-1 text-sm text-slate-400">
              {filteredReviews.length} result{filteredReviews.length === 1 ? '' : 's'}
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-700 bg-[#0a0f1c] px-3 py-2.5 focus-within:border-blue-500">
              <Search size={16} className="shrink-0 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, brand, or content..."
                aria-label="Search submissions"
                className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-600"
              />
            </div>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              aria-label="Filter by status"
              className="rounded-lg border border-slate-700 bg-[#0a0f1c] px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-500"
            >
              {statuses.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-400">
            Loading submissions...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-10 text-center">
            <FileCheck size={28} className="mx-auto mb-3 text-slate-600" />
            <p className="font-medium">No submissions found</p>
            <p className="mt-2 text-sm text-slate-400">
              Try another filter or submit content using the Compliance Checker.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredReviews.map((review) => (
              <article key={review.id} className="space-y-4 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h4 className="break-words font-semibold">
                      {review.title || 'Untitled submission'}
                    </h4>
                    <p className="mt-1 text-sm text-slate-400">
                      {review.brandName || 'Unknown brand'} · {formatDate(review.createdAt)}
                    </p>
                  </div>

                  <span className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${
                    statusStyles[review.status] || 'bg-slate-800 text-slate-300 ring-slate-700'
                  }`}>
                    {review.status}
                  </span>
                </div>

                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                  {review.content}
                </p>

                <div className="flex flex-col gap-3 border-t border-slate-800 pt-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">
                    Compliance score:{' '}
                    <span className="font-semibold text-slate-300">
                      {typeof review.score === 'number'
                        ? `${review.score}/100`
                        : 'Not available'}
                    </span>
                  </p>

                  <button
                    onClick={() => onNavigate('Approvals')}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                  >
                    <ClipboardCheck size={16} />
                    Open approval queue
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck size={22} className="mt-0.5 shrink-0 text-blue-400" />
            <div>
              <h3 className="font-semibold">Check new content</h3>
              <p className="mt-1 text-sm text-slate-400">
                Run a brand compliance check before submitting content for approval.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('Compliance Checker')}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Open checker
          </button>
        </div>
      </section>
    </div>
  )
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0d1424] p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-400">{title}</p>
        <Icon size={19} className="shrink-0 text-blue-400" />
      </div>
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
    </div>
  )
}