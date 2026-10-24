import { useEffect, useState } from 'react'
import { fetchApprovals, decideApproval } from './approvalsApi'

const statusStyles = {
  'Pending Review': 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  Approved: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  Rejected: 'border-red-500/30 bg-red-500/10 text-red-300',
  'Changes Requested': 'border-blue-500/30 bg-blue-500/10 text-blue-300',
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')
  const [comments, setComments] = useState({})
  const [busyId, setBusyId] = useState(null)
  const [notice, setNotice] = useState('')

  async function loadApprovals() {
    try {
      setError('')
      const data = await fetchApprovals()
      setApprovals(data)
    } catch (err) {
      setError(err.message || 'Could not load approvals.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApprovals()
  }, [])

  async function handleDecision(approval, status) {
    const reviewerComment = comments[approval.id] || ''

    if (
      status === 'Changes Requested' &&
      !reviewerComment.trim()
    ) {
      setError('Add a comment explaining the requested changes.')
      return
    }

    setBusyId(approval.id)
    setError('')
    setNotice('')

    try {
      const updated = await decideApproval(
        approval.id,
        status,
        reviewerComment
      )

      setApprovals((current) =>
        current.map((item) =>
          item.id === approval.id ? updated : item
        )
      )

      setNotice(`Submission ${status.toLowerCase()} successfully.`)
    } catch (err) {
      setError(err.message || 'Could not update this submission.')
    } finally {
      setBusyId(null)
    }
  }

  const filteredApprovals =
    filter === 'All'
      ? approvals
      : approvals.filter((item) => item.status === filter)

  const pendingCount = approvals.filter(
    (item) => item.status === 'Pending Review'
  ).length

  function formatDate(value) {
    if (!value) return '—'

    const date = value?.toDate
      ? value.toDate()
      : new Date(value)

    if (Number.isNaN(date.getTime())) return '—'

    return date.toLocaleString()
  }

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Approvals</h1>
          <p className="mt-1 text-sm text-slate-400">
            Review content submissions and record your decisions.
          </p>
        </div>

        <button
          onClick={loadApprovals}
          disabled={loading}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Total submissions</p>
          <p className="mt-2 text-3xl font-bold">{approvals.length}</p>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Pending review</p>
          <p className="mt-2 text-3xl font-bold text-amber-300">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Approved</p>
          <p className="mt-2 text-3xl font-bold text-emerald-300">
            {approvals.filter((item) => item.status === 'Approved').length}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          'All',
          'Pending Review',
          'Approved',
          'Rejected',
          'Changes Requested',
        ].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-lg border px-3 py-2 text-sm transition ${
              filter === status
                ? 'border-blue-500 bg-blue-600 text-white'
                : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {notice && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          {notice}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-8 text-center text-slate-400">
          Loading submissions...
        </div>
      ) : filteredApprovals.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-10 text-center">
          <h2 className="text-lg font-semibold">No submissions found</h2>
          <p className="mt-2 text-sm text-slate-400">
            Submit content through the Compliance Checker, or select another filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApprovals.map((approval) => {
            const isPending = approval.status === 'Pending Review'

            return (
              <section
                key={approval.id}
                className="space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-5"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {approval.title || 'Untitled submission'}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Brand: {approval.brandName || 'Unknown brand'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Submitted: {formatDate(approval.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${
                      statusStyles[approval.status] ||
                      'border-slate-600 text-slate-300'
                    }`}
                  >
                    {approval.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-950/70 p-3">
                    <p className="text-xs text-slate-400">
                      Compliance score
                    </p>
                    <p className="mt-1 text-xl font-semibold">
                      {typeof approval.score === 'number'
                        ? `${approval.score}/100`
                        : 'Not available'}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-950/70 p-3">
                    <p className="text-xs text-slate-400">
                      Last updated
                    </p>
                    <p className="mt-1 text-sm">
                      {formatDate(approval.updatedAt)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-slate-300">
                    Submitted content
                  </p>
                  <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-slate-800 bg-slate-950 p-4 font-sans text-sm leading-6 text-slate-300">
                    {approval.content}
                  </pre>
                </div>

                {approval.reviewerComment && (
                  <div className="rounded-lg border border-slate-700 p-3">
                    <p className="text-xs font-medium text-slate-400">
                      Previous reviewer comment
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">
                      {approval.reviewerComment}
                    </p>
                  </div>
                )}

                {isPending && (
                  <>
                    <div>
                      <label
                        htmlFor={`comment-${approval.id}`}
                        className="mb-2 block text-sm font-medium text-slate-300"
                      >
                        Reviewer comment
                      </label>
                      <textarea
                        id={`comment-${approval.id}`}
                        value={comments[approval.id] || ''}
                        onChange={(event) =>
                          setComments((current) => ({
                            ...current,
                            [approval.id]: event.target.value,
                          }))
                        }
                        placeholder="Add feedback or explain requested changes..."
                        rows={3}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() =>
                          handleDecision(approval, 'Approved')
                        }
                        disabled={busyId === approval.id}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                      >
                        {busyId === approval.id ? 'Saving...' : 'Approve'}
                      </button>

                      <button
                        onClick={() =>
                          handleDecision(approval, 'Changes Requested')
                        }
                        disabled={busyId === approval.id}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                      >
                        Request Changes
                      </button>

                      <button
                        onClick={() =>
                          handleDecision(approval, 'Rejected')
                        }
                        disabled={busyId === approval.id}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </>
                )}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}