
import { useEffect, useState } from 'react'
import {
  fetchBrands,
  checkCompliance,
  submitForApproval,
} from './complianceApi'

export default function ComplianceChecker() {
  const [brands, setBrands] = useState([])
  const [brandId, setBrandId] = useState('')
  const [content, setContent] = useState('')
  const [report, setReport] = useState(null)
  const [loadingBrands, setLoadingBrands] = useState(true)
  const [checking, setChecking] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    async function loadBrands() {
      try {
        const savedBrands = await fetchBrands()
        setBrands(savedBrands)

        if (savedBrands.length > 0) {
          setBrandId(savedBrands[0].id)
        }
      } catch (err) {
        setError(err.message || 'Unable to load brands.')
      } finally {
        setLoadingBrands(false)
      }
    }

    loadBrands()
  }, [])

  async function handleCheck() {
    if (!brandId) {
      setError('Please create or select a brand first.')
      return
    }

    if (!content.trim()) {
      setError('Please enter some content to check.')
      return
    }

    setChecking(true)
    setError('')
    setSuccessMessage('')
    setReport(null)

    try {
      const result = await checkCompliance(brandId, content)
      setReport(result)
    } catch (err) {
      setError(err.message || 'Unable to check content.')
    } finally {
      setChecking(false)
    }
  }

  async function handleSubmitForApproval() {
    if (!report || !brandId || !content.trim()) {
      setError('Check your content before submitting it.')
      return
    }

    setSubmitting(true)
    setError('')
    setSuccessMessage('')

    try {
      const selectedBrand = brands.find(
        (brand) => brand.id === brandId
      )

      await submitForApproval({
        brandId,
        content,
        report,
        title: `${selectedBrand?.name || 'Brand'} content review`,
      })

      setSuccessMessage(
        'Content submitted successfully! It is now pending review.'
      )
    } catch (err) {
      setError(err.message || 'Unable to submit content.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleContentChange(value) {
    setContent(value)
    setReport(null)
    setSuccessMessage('')
    setError('')
  }

  async function handleCopyRevisedContent() {
    try {
      await navigator.clipboard.writeText(
        report.aiAnalysis.revisedContent
      )
      setSuccessMessage('Suggested content copied to clipboard.')
    } catch {
      setError('Unable to copy content. Please copy it manually.')
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 text-slate-100">
      <div className="border-b border-slate-800/80 pb-5">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-blue-400">Brand governance</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Compliance Checker</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Check marketing content against your selected brand guidelines before submitting it for human review.
        </p>
      </div>

      <section className="space-y-5 rounded-2xl border border-slate-800 bg-[#0d1424] p-4 shadow-lg shadow-black/10 sm:p-6">
        <div>
          <label
            htmlFor="brand-select"
            className="mb-2 block text-sm font-medium"
          >
            Select brand
          </label>

          <select
            id="brand-select"
            value={brandId}
            onChange={(event) => {
              setBrandId(event.target.value)
              setReport(null)
              setSuccessMessage('')
              setError('')
            }}
            disabled={loadingBrands || brands.length === 0}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-[#0a0f1c] px-3.5 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
          >
            {loadingBrands && (
              <option value="">Loading brands...</option>
            )}

            {!loadingBrands && brands.length === 0 && (
              <option value="">No brands available</option>
            )}

            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>

          {!loadingBrands && brands.length === 0 && (
            <p className="mt-2 text-sm text-amber-300">
              Create a brand in Brand Knowledge before checking content.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="marketing-content"
            className="mb-2 block text-sm font-medium"
          >
            Marketing content
          </label>

          <textarea
            id="marketing-content"
            value={content}
            onChange={(event) =>
              handleContentChange(event.target.value)
            }
            placeholder="Paste an advertisement, social media post, email, or other marketing content..."
            rows={8}
            className="mt-1 min-h-48 w-full resize-y rounded-lg border border-slate-700 bg-[#0a0f1c] p-3.5 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:min-h-56"
          />

          <p className="mt-2 text-xs text-slate-500">
            {content.length} characters
          </p>
        </div>

        <button
          onClick={handleCheck}
          disabled={
            checking ||
            submitting ||
            loadingBrands ||
            brands.length === 0
          }
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {checking ? 'Checking content...' : 'Check compliance'}
        </button>

        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}

        {successMessage && (
          <p role="status" className="text-sm text-emerald-400">
            {successMessage}
          </p>
        )}
      </section>

      {report && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <div className="rounded-xl border border-slate-800 bg-[#0d1424] p-4 sm:p-5">
              <p className="text-sm text-slate-400">
                Rule-based score
              </p>
              <p className="mt-2 text-3xl font-bold">
                {report.score}/100
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0d1424] p-4 sm:p-5">
              <p className="text-sm text-slate-400">Violations</p>
              <p className="mt-2 text-3xl font-bold text-red-400">
                {report.summary.violations}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0d1424] p-4 sm:p-5">
              <p className="text-sm text-slate-400">Suggestions</p>
              <p className="mt-2 text-3xl font-bold text-amber-300">
                {report.summary.suggestions}
              </p>
            </div>
          </div>

          <section className="rounded-xl border border-slate-800 bg-[#0d1424] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Findings</h2>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  report.summary.violations > 0
                    ? 'bg-red-500/15 text-red-300'
                    : 'bg-emerald-500/15 text-emerald-300'
                }`}
              >
                {report.summary.violations > 0
                  ? 'Changes recommended'
                  : 'No configured prohibited phrases found'}
              </span>
            </div>

            {report.findings.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">
                No findings from the configured phrase and terminology
                rules. This does not guarantee full brand compliance.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {report.findings.map((finding, index) => (
                  <div
                    key={`${finding.type}-${finding.phrase}-${index}`}
                    className="rounded-xl border border-slate-800 bg-[#0a0f1c]/60 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          finding.severity === 'high'
                            ? 'bg-red-500/15 text-red-300'
                            : 'bg-amber-500/15 text-amber-300'
                        }`}
                      >
                        {finding.severity === 'high'
                          ? 'Violation'
                          : 'Suggestion'}
                      </span>

                      <span className="text-sm font-medium">
                        {finding.phrase}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-300">
                      {finding.message}
                    </p>

                    <p className="mt-2 text-sm text-indigo-300">
                      Suggested action: {finding.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {report.aiWarning && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              {report.aiWarning}
            </div>
          )}

          {report.aiAnalysis && (
            <section className="space-y-5 rounded-2xl border border-blue-500/20 bg-[#0d1424] p-4 shadow-lg shadow-black/10 sm:p-6">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold">
                    AI Compliance Analysis
                  </h2>
                  {report.aiAnalysis.riskLevel && (
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        report.aiAnalysis.riskLevel === 'High'
                          ? 'border-red-500/30 bg-red-500/10 text-red-300'
                          : report.aiAnalysis.riskLevel === 'Medium'
                            ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      }`}
                    >
                      {report.aiAnalysis.riskLevel} risk
                    </span>
                  )}
                  {report.aiAnalysis.requiresHumanReview && (
                    <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
                      Human review required
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {report.aiAnalysis.overallAssessment}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  AI risk is advisory. It does not prove a claim is true or false and does not automatically approve content.
                </p>
              </div>

              {Array.isArray(report.aiAnalysis.highlightedClaims) &&
                report.aiAnalysis.highlightedClaims.length > 0 && (
                  <div>
                    <h3 className="mb-3 font-semibold">Claims highlighted by AI</h3>
                    <div className="space-y-3">
                      {report.aiAnalysis.highlightedClaims.map((item, index) => (
                        <article
                          key={`${item.text}-${index}`}
                          className={`rounded-xl border p-4 ${
                            item.severity === 'high'
                              ? 'border-red-500/30 bg-red-500/5'
                              : item.severity === 'medium'
                                ? 'border-amber-500/30 bg-amber-500/5'
                                : 'border-slate-700 bg-[#0a0f1c]/60'
                          }`}
                        >
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              {item.issue}
                            </span>
                            <span className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300">
                              {item.severity} severity
                            </span>
                          </div>
                          <blockquote className="border-l-2 border-amber-400 pl-3 text-sm font-medium leading-6 text-slate-100">
                            “{item.text}”
                          </blockquote>
                          <p className="mt-3 text-sm text-slate-300">{item.reason}</p>
                          <p className="mt-2 text-sm text-indigo-300">
                            Suggested fix: {item.suggestion}
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>
                )}

              <div>
                <h3 className="mb-3 font-semibold">
                  What needs attention?
                </h3>

                {report.aiAnalysis.explanations.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No additional AI observations were returned.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {report.aiAnalysis.explanations.map(
                      (item, index) => (
                        <article
                          key={`${item.issue}-${index}`}
                          className="rounded-xl border border-slate-800 bg-[#0a0f1c]/60 p-4"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">
                              {item.issue}
                            </span>
                            <span className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300">
                              {item.severity}
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-slate-400">
                            {item.reason}
                          </p>

                          <p className="mt-2 text-sm text-indigo-300">
                            Suggested action: {item.suggestion}
                          </p>
                        </article>
                      )
                    )}
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-2 font-semibold">
                  Suggested revised content
                </h3>

                <textarea
                  readOnly
                  value={report.aiAnalysis.revisedContent}
                  rows={6}
                  className="w-full rounded-xl border border-slate-800 bg-[#0a0f1c] p-3.5 text-sm leading-6 text-slate-200"
                />

                <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                  <div className="rounded-xl border border-slate-800 bg-[#0a0f1c]/70 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Original content
                    </p>
                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                      {content}
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                      AI suggested version
                    </p>
                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">
                      {report.aiAnalysis.revisedContent}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCopyRevisedContent}
                  className="mt-3 rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
                >
                  Copy suggested content
                </button>
              </div>

              {report.aiAnalysis.claimsForReview.length > 0 && (
                <div>
                  <h3 className="mb-2 font-semibold text-amber-300">
                    Claims requiring verification
                  </h3>

                  <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
                    {report.aiAnalysis.claimsForReview.map(
                      (claim, index) => (
                        <li key={`${claim.claim}-${index}`}>
                          <strong>{claim.claim}</strong>: {claim.reason}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              <p className="text-xs text-slate-500">
                {report.aiAnalysis.disclaimer}
              </p>
            </section>
          )}

          {report.limitations && (
            <p className="text-xs text-slate-500">
              {report.limitations.join(' ')}
            </p>
          )}

          <section className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-[#0d1424] p-4 sm:p-6">
            <h2 className="text-lg font-semibold">
              Ready for human review?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Submit this content to the Approvals queue for a human
              decision. The compliance score does not automatically
              approve content.
            </p>

            <button
              onClick={handleSubmitForApproval}
              disabled={submitting || checking}
              className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {submitting ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </section>
        </div>
      )}
    </div>
  )
}
