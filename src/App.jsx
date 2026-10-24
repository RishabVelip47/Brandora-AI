import ComplianceChecker from './features/compliance/ComplianceChecker'
import ApprovalsPage from './features/approvals/ApprovalsPage'
import ContentReviews from './features/reviews/ContentReviews'
import { useEffect, useState } from 'react'
import {
  ShieldCheck, LayoutDashboard, BookOpen, FileCheck,
  ClipboardCheck, Settings, Plus, Search, Trash2,
  LoaderCircle, AlertCircle, X, Pencil, RefreshCw, Activity, TrendingUp, BarChart3, PieChart, History,
} from 'lucide-react'
import { getBrands, createBrand, updateBrand, deleteBrand } from './api'
import { fetchApprovals } from './features/approvals/approvalsApi'
import AuditTrail from './features/audit/AuditTrail'
const emptyForm = {
  name: '',
  industry: '',
  tone: '',
  preferredTerms: '',
  prohibitedPhrases: '',
  approvedClaims: '',
}

function toList(value) {
  return value.split('\n').map((item) => item.trim()).filter(Boolean)
}

function toText(value) {
  return Array.isArray(value) ? value.join('\n') : ''
}

const statusStyles = {
  'Pending Review': 'bg-amber-500/10 text-amber-300 ring-amber-500/20',
  Approved: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20',
  Rejected: 'bg-red-500/10 text-red-300 ring-red-500/20',
  'Changes Requested': 'bg-blue-500/10 text-blue-300 ring-blue-500/20',
  'Needs review': 'bg-amber-500/10 text-amber-300 ring-amber-500/20',
  Draft: 'bg-slate-500/10 text-slate-300 ring-slate-500/20',
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f1c]'

export default function App() {
  const [active, setActive] = useState('Dashboard')
  const [approvals, setApprovals] = useState([])
  const [approvalsLoading, setApprovalsLoading] = useState(true)
  const [brands, setBrands] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  

  async function loadBrands() {
    setLoading(true)
    setError('')
    try {
      const data = await getBrands()
      setBrands(data.brands)
    } catch (err) {
      setError(err.message || 'Could not load brands. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  async function loadDashboardApprovals() {
    setApprovalsLoading(true)
    try {
      const data = await fetchApprovals()
      setApprovals(data)
    } catch (err) {
      setError(err.message || 'Could not load dashboard submissions.')
    } finally {
      setApprovalsLoading(false)
    }
  }

  useEffect(() => {
    loadBrands()
    loadDashboardApprovals()
  }, [])

  function formatDashboardDate(value) {
    if (!value) return '—'
    const date = value?.toDate ? value.toDate() : new Date(value)
    return Number.isNaN(date.getTime())
      ? '—'
      : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function openNewBrand() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
    setError('')
    setNotice('')
  }

  function openEditBrand(brand) {
    setForm({
      name: brand.name || '',
      industry: brand.industry || '',
      tone: brand.tone || '',
      preferredTerms: toText(brand.preferredTerms),
      prohibitedPhrases: toText(brand.prohibitedPhrases),
      approvedClaims: toText(brand.approvedClaims),
    })
    setEditingId(brand.id)
    setShowForm(true)
    setError('')
    setNotice('')
  }

  async function handleSave(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')

    const payload = {
      name: form.name.trim(),
      industry: form.industry.trim(),
      tone: form.tone.trim(),
      preferredTerms: toList(form.preferredTerms),
      prohibitedPhrases: toList(form.prohibitedPhrases),
      approvedClaims: toList(form.approvedClaims),
    }

    try {
      if (editingId) {
        await updateBrand(editingId, payload)
        setNotice('Brand profile updated successfully.')
      } else {
        await createBrand(payload)
        setNotice('Brand profile created successfully.')
      }

      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      await loadBrands()
    } catch (err) {
      setError(err.message || 'Unable to save the brand profile.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(brand) {
    if (!window.confirm(`Delete "${brand.name}"? This cannot be undone.`)) return

    setError('')
    setNotice('')

    try {
      await deleteBrand(brand.id)
      setBrands((current) => current.filter((item) => item.id !== brand.id))
      setNotice('Brand profile deleted.')
    } catch (err) {
      setError(err.message || 'Unable to delete the brand.')
    }
  }

const menu = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Brand Knowledge', icon: BookOpen },
  { name: 'Compliance Checker', icon: ShieldCheck },
  { name: 'Content Reviews', icon: FileCheck },
  { name: 'Approvals', icon: ClipboardCheck },
    { name: 'Audit Trail', icon: History },
]

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(search.toLowerCase())
  )

  const inputClass =
    'mt-2 w-full rounded-lg border border-slate-700/80 bg-[#0a0f1c] px-3.5 py-2.5 text-sm text-slate-100 shadow-sm outline-none transition placeholder:text-slate-600 hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'

  const primaryBtn = `inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-950/50 transition-colors hover:bg-blue-500 active:bg-blue-700 ${focusRing}`

  const totalSubmissions = approvals.length

const pendingCount = approvals.filter(
  (item) => item.status === 'Pending Review'
).length

const approvedCount = approvals.filter(
  (item) => item.status === 'Approved'
).length

const rejectedCount = approvals.filter(
  (item) => item.status === 'Rejected'
).length

const changesRequestedCount = approvals.filter(
  (item) => item.status === 'Changes Requested'
).length

const decidedCount = approvedCount + rejectedCount

const approvalRate = decidedCount
  ? Math.round((approvedCount / decidedCount) * 100)
  : 0

const scoredSubmissions = approvals.filter(
  (item) => typeof item.score === 'number'
)

const averageScore = scoredSubmissions.length
  ? Math.round(
      scoredSubmissions.reduce((sum, item) => sum + item.score, 0) /
      scoredSubmissions.length
    )
  : null

const statusBreakdown = [
  { label: 'Pending Review', count: pendingCount, color: 'bg-amber-400' },
  { label: 'Approved', count: approvedCount, color: 'bg-emerald-400' },
  { label: 'Rejected', count: rejectedCount, color: 'bg-red-400' },
  {
    label: 'Changes Requested',
    count: changesRequestedCount,
    color: 'bg-blue-400',
  },
]

const scoreChartItems = [...scoredSubmissions]
  .sort((a, b) => new Date(b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt || 0) - new Date(a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt || 0))
  .slice(0, 6)
  .reverse()

const activityDays = Array.from({ length: 7 }, (_, index) => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - (6 - index))
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + 1)
  const count = approvals.filter((item) => {
    const rawDate = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt || 0)
    return !Number.isNaN(rawDate.getTime()) && rawDate >= date && rawDate < nextDate
  }).length
  return {
    label: date.toLocaleDateString(undefined, { weekday: 'short' }),
    dateLabel: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    count,
  }
})

const activityMax = Math.max(1, ...activityDays.map((day) => day.count))
  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-100 antialiased md:flex">
      <aside className="w-full border-b border-slate-800/80 bg-[#0d1424] p-4 sm:p-5 md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r">
        <div className="mb-5 flex items-center gap-3 md:mb-8 md:border-b md:border-slate-800/80 md:pb-6">
          <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 p-2 text-white shadow-lg shadow-blue-900/40 ring-1 ring-white/10">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">Brandora AI</h1>
            <p className="text-xs text-slate-400">Intelligent Brand Governance</p>
          </div>
        </div>

        <p className="mb-2 hidden px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500 md:block">
          Workspace
        </p>

        <nav className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 md:mx-0 md:flex-col md:overflow-visible md:px-0 md:pb-0">
          {menu.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => {
                setActive(name)
                setShowForm(false)
                setError('')
              }}
              aria-current={active === name ? 'page' : undefined}
              className={`relative flex shrink-0 items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors md:w-full ${focusRing} ${
                active === name
                  ? 'bg-blue-500/10 text-blue-300 ring-1 ring-inset ring-blue-500/20'
                  : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
              }`}
            >
              {active === name && (
                <span className="absolute left-0 top-1/2 hidden h-5 w-1 -translate-y-1/2 rounded-r-full bg-blue-400 md:block" />
              )}
              <Icon size={18} className={active === name ? 'text-blue-400' : 'text-slate-500'} /> {name}
            </button>
          ))}
        </nav>

        <div className="mt-3 md:mt-auto md:border-t md:border-slate-800/80 md:pt-4">
          <button
            onClick={() => setActive('Settings')}
            aria-current={active === 'Settings' ? 'page' : undefined}
            className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors md:w-full ${focusRing} ${
              active === 'Settings'
                ? 'bg-blue-500/10 text-blue-300 ring-1 ring-inset ring-blue-500/20'
                : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
            }`}
          >
            <Settings size={18} className={active === 'Settings' ? 'text-blue-400' : 'text-slate-500'} /> Settings
          </button>

          <div className="mt-4 hidden rounded-xl border border-slate-700/60 bg-gradient-to-br from-blue-950/70 to-slate-900 p-4 md:block">
            <ShieldCheck className="mb-3 text-blue-400" size={20} />
            <p className="text-sm font-semibold">Every claim checked.</p>
            <p className="mt-1 text-xs text-slate-400">Every brand aligned.</p>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
        <div className="mx-auto w-full max-w-6xl">
          <header className="mb-8 flex flex-col items-stretch justify-between gap-4 border-b border-slate-800/80 pb-6 sm:flex-row sm:items-center">
            <div>
              <p className="mb-2 text-xs font-medium text-slate-500">Workspace <span className="mx-1 text-slate-700">/</span> <span className="text-slate-400">{active}</span></p>
              <h2 className="break-words text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {active === 'Dashboard' ? 'Good to see you' : active}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Keep your content consistent, accurate and on-brand.
              </p>
            </div>

            {active === 'Brand Knowledge' && !showForm && (
              <button onClick={openNewBrand} className={`w-full sm:w-auto ${primaryBtn}`}>
                <Plus size={18} /> Add brand
              </button>
            )}
          </header>

          {error && (
            <div role="alert" className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" /> {error}
            </div>
          )}

          {notice && (
            <div role="status" className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              {notice}
            </div>
          )}

          {active === 'Compliance Checker' ? (
            <ComplianceChecker />
          ) : active === 'Approvals' ? (
            <ApprovalsPage />
            
          ) : active === 'Audit Trail' ? (
  <AuditTrail />
)
          : active === 'Brand Knowledge' ? (
            
            <>
              {showForm && (
                <form onSubmit={handleSave} className="mb-6 space-y-5 rounded-xl border border-slate-800 bg-[#0d1424] p-5 shadow-lg shadow-black/20 md:p-7">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <h3 className="text-lg font-semibold tracking-tight">
                      {editingId ? 'Edit brand profile' : 'Create brand profile'}
                    </h3>
                    <button type="button" onClick={() => setShowForm(false)} className={`rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white ${focusRing}`} aria-label="Close form">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="text-sm font-medium text-slate-300">
                      Brand name *
                      <input className={inputClass} required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Acme Technologies" />
                    </label>
                    <label className="text-sm font-medium text-slate-300">
                      Industry
                      <input className={inputClass} value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="e.g. Technology" />
                    </label>
                  </div>

                  <label className="block text-sm font-medium text-slate-300">
                    Brand voice and tone
                    <textarea className={inputClass} rows={2} value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} placeholder="e.g. Professional, friendly, clear and trustworthy" />
                  </label>

                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="text-sm font-medium text-slate-300">
                      Preferred terms
                      <textarea className={inputClass} rows={4} value={form.preferredTerms} onChange={(e) => setForm({ ...form, preferredTerms: e.target.value })} placeholder={'AI-powered\nCustomer-first'} />
                      <span className="mt-1.5 block text-xs font-normal text-slate-500">One term per line.</span>
                    </label>
                    <label className="text-sm font-medium text-slate-300">
                      Prohibited phrases
                      <textarea className={inputClass} rows={4} value={form.prohibitedPhrases} onChange={(e) => setForm({ ...form, prohibitedPhrases: e.target.value })} placeholder={'Guaranteed results\nRisk-free'} />
                      <span className="mt-1.5 block text-xs font-normal text-slate-500">One phrase per line.</span>
                    </label>
                  </div>

                  <label className="block text-sm font-medium text-slate-300">
                    Approved claims
                    <textarea className={inputClass} rows={4} value={form.approvedClaims} onChange={(e) => setForm({ ...form, approvedClaims: e.target.value })} placeholder={'Our platform checks content against brand guidelines.\nOne approved claim per line.'} />
                    <span className="mt-1.5 block text-xs font-normal text-slate-500">Enter only claims that your organisation has verified and approved.</span>
                  </label>

                  <div className="flex flex-wrap gap-3 border-t border-slate-800 pt-5">
                    <button disabled={saving} className={`${primaryBtn} px-5 disabled:cursor-not-allowed disabled:opacity-50`}>
                      {saving && <LoaderCircle size={16} className="animate-spin" />}
                      {saving ? 'Saving...' : editingId ? 'Save changes' : 'Create brand'}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} className={`rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white ${focusRing}`}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <section className="overflow-hidden rounded-xl border border-slate-800 bg-[#0d1424] shadow-lg shadow-black/20">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 p-5">
                  <div>
                    <h3 className="font-semibold tracking-tight">Your brands</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {brands.length} brand profile{brands.length === 1 ? '' : 's'} configured
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-700/80 bg-[#0a0f1c] px-3 py-2 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                    <Search size={16} className="text-slate-500" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search brands" aria-label="Search brands" className="w-36 bg-transparent text-sm outline-none placeholder:text-slate-600" />
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center gap-2 p-8 text-sm text-slate-400">
                    <LoaderCircle size={18} className="animate-spin" /> Loading brands...
                  </div>
                ) : filteredBrands.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/70">
                      <BookOpen size={22} className="text-slate-500" />
                    </div>
                    <p className="font-medium">No brands found</p>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
                      Add a brand profile to begin building your trusted knowledge base.
                    </p>
                    {!showForm && (
                      <button onClick={openNewBrand} className={`mt-5 ${primaryBtn}`}>
                        Create your first brand
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {filteredBrands.map((brand) => (
                      <article key={brand.id} className="p-5 transition-colors hover:bg-slate-800/20 sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-start gap-3.5">
                            <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-400 ring-1 ring-inset ring-blue-500/20">
                              <ShieldCheck size={22} />
                            </div>
                            <div>
                              <h4 className="font-semibold tracking-tight">{brand.name}</h4>
                              <p className="mt-1 text-sm text-slate-400">{brand.industry || 'Industry not specified'}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => openEditBrand(brand)} className={`flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white ${focusRing}`}>
                              <Pencil size={14} /> Edit
                            </button>
                            <button onClick={() => handleDelete(brand)} className={`flex items-center gap-1.5 rounded-lg border border-red-500/25 px-3 py-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/10 ${focusRing}`}>
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>

                        {brand.tone && (
                          <p className="mt-4 rounded-lg border border-slate-800 bg-[#0a0f1c]/60 px-3.5 py-2.5 text-sm text-slate-300">
                            <span className="font-medium text-slate-500">Voice: </span>{brand.tone}
                          </p>
                        )}

                        <div className="mt-5 grid gap-5 md:grid-cols-3">
                          <RuleList title="Preferred terms" items={brand.preferredTerms} tone="blue" />
                          <RuleList title="Prohibited phrases" items={brand.prohibitedPhrases} tone="red" />
                          <RuleList title="Approved claims" items={brand.approvedClaims} tone="green" />
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : active === 'Dashboard' ? (
            <>
             
<section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
  <Stat
    title="Total submissions"
    value={approvalsLoading ? '—' : totalSubmissions}
    note="All content sent for review"
    icon={FileCheck}
  />

  <Stat
    title="Pending reviews"
    value={approvalsLoading ? '—' : pendingCount}
    note="Waiting for a decision"
    icon={Activity}
  />

  <Stat
    title="Approval rate"
    value={approvalsLoading ? '—' : `${approvalRate}%`}
    note="Of approved or rejected submissions"
    icon={TrendingUp}
  />

  <Stat
    title="Average compliance score"
    value={
      approvalsLoading
        ? '—'
        : averageScore === null
          ? 'N/A'
          : `${averageScore}/100`
    }
    note={`${scoredSubmissions.length} scored submissions`}
    icon={ShieldCheck}
  />
</section>

             

              <section className="mb-6 rounded-xl border border-slate-800 bg-[#0d1424] p-5 shadow-lg shadow-black/20 sm:p-6">
                <div className="mb-5">
                  <h3 className="font-semibold tracking-tight">Review pipeline</h3>
                  <p className="mt-1 text-sm text-slate-400">Current status of all content submissions</p>
                </div>

                {approvalsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <LoaderCircle size={18} className="animate-spin" /> Calculating review statistics...
                  </div>
                ) : totalSubmissions === 0 ? (
                  <p className="text-sm text-slate-400">Submit content for review to see your review pipeline.</p>
                ) : (
                  <div className="space-y-5">
                    {statusBreakdown.map((status) => {
                      const percentage = Math.round((status.count / totalSubmissions) * 100)
                      return (
                        <div key={status.label}>
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="text-sm text-slate-300">{status.label}</span>
                            <span className="text-sm tabular-nums text-slate-400">{status.count} ({percentage}%)</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                            <div className={`h-full rounded-full transition-all ${status.color}`} style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>

              <section className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-[#0d1424] p-5 shadow-lg shadow-black/20 sm:p-6">
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold tracking-tight">Submission status</h3>
                      <p className="mt-1 text-sm text-slate-400">How all submissions are distributed</p>
                    </div>
                    <PieChart size={19} className="text-blue-400" />
                  </div>
                  {approvalsLoading ? (
                    <div className="h-48 animate-pulse rounded-lg bg-slate-800/50" />
                  ) : totalSubmissions === 0 ? (
                    <div className="flex h-48 flex-col items-center justify-center text-center">
                      <PieChart size={28} className="mb-2 text-slate-600" />
                      <p className="text-sm text-slate-400">No submission data to chart yet.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
                      <StatusDonut values={[
                        { label: 'Pending Review', count: pendingCount, color: '#fbbf24' },
                        { label: 'Approved', count: approvedCount, color: '#34d399' },
                        { label: 'Rejected', count: rejectedCount, color: '#f87171' },
                        { label: 'Changes Requested', count: changesRequestedCount, color: '#60a5fa' },
                      ]} total={totalSubmissions} />
                      <div className="w-full space-y-3 sm:max-w-xs">
                        {[
                          { label: 'Pending Review', count: pendingCount, color: 'bg-amber-400' },
                          { label: 'Approved', count: approvedCount, color: 'bg-emerald-400' },
                          { label: 'Rejected', count: rejectedCount, color: 'bg-red-400' },
                          { label: 'Changes Requested', count: changesRequestedCount, color: 'bg-blue-400' },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                            <span className="flex items-center gap-2 text-slate-300"><span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />{item.label}</span>
                            <span className="font-semibold tabular-nums text-slate-100">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#0d1424] p-5 shadow-lg shadow-black/20 sm:p-6">
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold tracking-tight">Compliance scores</h3>
                      <p className="mt-1 text-sm text-slate-400">Latest scored submissions</p>
                    </div>
                    <BarChart3 size={19} className="text-emerald-400" />
                  </div>
                  {approvalsLoading ? (
                    <div className="h-48 animate-pulse rounded-lg bg-slate-800/50" />
                  ) : scoreChartItems.length === 0 ? (
                    <div className="flex h-48 flex-col items-center justify-center text-center">
                      <BarChart3 size={28} className="mb-2 text-slate-600" />
                      <p className="text-sm text-slate-400">Compliance scores will appear when scored submissions are available.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {scoreChartItems.map((item, index) => {
                        const score = Math.max(0, Math.min(100, item.score))
                        const label = item.title || item.brandName || `Submission ${index + 1}`
                        return (
                          <div key={item.id || `${label}-${index}`}>
                            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                              <span className="min-w-0 truncate text-slate-300" title={label}>{label}</span>
                              <span className="shrink-0 font-semibold tabular-nums text-slate-100">{score}/100</span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                              <div className={`h-full rounded-full transition-all ${score >= 80 ? 'bg-emerald-400' : score >= 60 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${score}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#0d1424] p-5 shadow-lg shadow-black/20 sm:col-span-2 sm:p-6">
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold tracking-tight">Submission activity</h3>
                      <p className="mt-1 text-sm text-slate-400">Submissions created over the last seven days</p>
                    </div>
                    <Activity size={19} className="text-blue-400" />
                  </div>
                  {approvalsLoading ? (
                    <div className="h-48 animate-pulse rounded-lg bg-slate-800/50" />
                  ) : (
                    <div className="grid h-48 grid-cols-7 items-end gap-2 sm:gap-4">
                      {activityDays.map((day) => (
                        <div key={day.dateLabel} className="flex h-full min-w-0 flex-col items-center justify-end gap-2">
                          <span className="text-xs tabular-nums text-slate-400">{day.count}</span>
                          <div className="flex h-32 w-full items-end justify-center rounded-t-md bg-slate-800/40">
                            <div className="w-full max-w-12 rounded-t-md bg-gradient-to-t from-blue-600 to-cyan-400 transition-all" style={{ height: `${day.count === 0 ? 3 : Math.max(8, (day.count / activityMax) * 100)}%` }} title={`${day.count} submission${day.count === 1 ? '' : 's'} on ${day.dateLabel}`} />
                          </div>
                          <span className="text-xs text-slate-500">{day.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="mt-3 text-xs text-slate-500">Based on submission creation dates in the loaded approval records.</p>
                </div>
              </section>

              <section className="overflow-hidden rounded-xl border border-slate-800 bg-[#0d1424] shadow-lg shadow-black/20">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 p-5 sm:p-6">
                  <div>
                    <h3 className="font-semibold tracking-tight">Recent submissions</h3>
                    <p className="mt-1 text-sm text-slate-400">Latest content sent for human review</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={loadDashboardApprovals}
                      disabled={approvalsLoading}
                      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                    >
                      <RefreshCw size={16} className={approvalsLoading ? 'animate-spin' : ''} />
                      Refresh
                    </button>
                    <button onClick={() => setActive('Approvals')} className={primaryBtn}>
                      View approvals <ClipboardCheck size={16} />
                    </button>
                  </div>
                </div>

                {approvalsLoading ? (
                  <div className="flex items-center gap-2 p-6 text-sm text-slate-400">
                    <LoaderCircle size={18} className="animate-spin" /> Loading submissions...
                  </div>
                ) : approvals.length === 0 ? (
                  <div className="p-10 text-center">
                    <FileCheck size={28} className="mx-auto mb-3 text-slate-600" />
                    <p className="font-medium">No submissions yet</p>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                      Run a compliance check and submit your content for approval. Your latest submissions will appear here.
                    </p>
                    <button onClick={() => setActive('Compliance Checker')} className={`mt-5 ${primaryBtn}`}>
                      Check content <ShieldCheck size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {[...approvals]
                      .sort((a, b) => new Date(b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt || 0) - new Date(a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt || 0))
                      .slice(0, 5)
                      .map((item) => (
                        <div key={item.id} className="flex flex-col gap-3 p-5 transition-colors hover:bg-slate-800/20 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                          <div className="min-w-0">
                            <p className="break-words font-medium text-slate-100">{item.title || 'Untitled submission'}</p>
                            <p className="mt-1 text-sm text-slate-400">{item.brandName || 'Unknown brand'} · {formatDashboardDate(item.createdAt)}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              Compliance score: {typeof item.score === 'number' ? `${item.score}/100` : 'Not available'}
                            </p>
                          </div>
                          <span className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[item.status] || 'bg-slate-800 text-slate-300 ring-slate-700'}`}>
                            {item.status || 'Unknown status'}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </section>
            </>
          ) :  active === 'Content Reviews' ? (
   <ContentReviews onNavigate={setActive} />
) : (
  <section className="rounded-xl border border-slate-800 bg-[#0d1424] p-6">
    <h3 className="font-semibold">{active}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-400">
      This section is not available yet.
    </p>
  </section>
)
    }    </div>
      </main>
    </div>
  )
}

function StatusDonut({ values, total }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="relative h-44 w-44 shrink-0" role="img" aria-label={`Submission status breakdown across ${total} submissions`}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#1e293b" strokeWidth="12" />
        {values.filter((item) => item.count > 0).map((item) => {
          const length = (item.count / total) * circumference
          const circle = (
            <circle
              key={item.label}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth="12"
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          )
          offset += length
          return circle
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tracking-tight text-white">{total}</span>
        <span className="text-xs text-slate-400">Submissions</span>
      </div>
    </div>
  )
}

function RuleList({ title, items, tone = 'blue' }) {
  const dot = {
    blue: 'bg-blue-400',
    red: 'bg-red-400',
    green: 'bg-emerald-400',
  }[tone]

  return (
    <div>
      <p className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {title}
      </p>
      {items?.length ? (
        <ul className="space-y-1.5">
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="break-words rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs leading-5 text-slate-300">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed border-slate-800 px-3 py-2 text-xs text-slate-600">Not configured</p>
      )}
    </div>
  )
}

function Stat({ title, value, note, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0d1424] p-5 shadow-lg shadow-black/20 transition-colors hover:border-slate-700">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <div className="rounded-lg bg-blue-500/10 p-2 ring-1 ring-inset ring-blue-500/20">
          <Icon size={17} className="text-blue-400" />
        </div>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{note}</p>
    </div>
  )
}