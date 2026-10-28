import { useEffect, useMemo, useRef, useState } from 'react'
import PrintReport from './components/PrintReport'
import ScoreSliders from './components/ScoreSliders'
import ScoringGuide from './components/ScoringGuide'
import Sidebar from './components/Sidebar'
import {
  GLOBAL_ADVICE,
  STORAGE_KEY,
  buildCsvExport,
  calculateGrandTotal,
  calculateTotal,
  downloadTextFile,
  flattenRoles,
  formatTotal,
  getScoreData,
  grandMaxPoints,
  loadScores,
  parseImportedScores,
  saveScores,
} from './lib/scoring'

export default function App() {
  const flattened = useMemo(() => flattenRoles(), [])
  const grandMax = useMemo(() => grandMaxPoints(flattened), [flattened])

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scores, setScores] = useState(() => {
    if (typeof window === 'undefined') return {}
    return loadScores(window.localStorage, flattened)
  })
  const [isExporting, setIsExporting] = useState(false)
  const [pdfRequest, setPdfRequest] = useState(null)
  const [pdfError, setPdfError] = useState('')
  const [importError, setImportError] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const importInputRef = useRef(null)

  const currentItem = flattened[selectedIndex]
  const currentScore = getScoreData(scores, currentItem.uniqueKey, currentItem)
  const grandTotal = calculateGrandTotal(scores, flattened)

  useEffect(() => {
    saveScores(window.localStorage, scores)
  }, [scores])

  // PDF export runs from a React-rendered report (user text is escaped by
  // React), never from a hand-built HTML string. The report is rendered
  // off-screen only while an export is in flight, and the exporting flag
  // is always reset, including on failure.
  useEffect(() => {
    if (!pdfRequest) return undefined
    let cancelled = false
    ;(async () => {
      try {
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        const element = document.getElementById('print-content')
        if (!element) throw new Error('Print content was not rendered.')
        const { default: html2pdf } = await import('html2pdf.js')
        const opt = {
          margin: 0.5,
          filename:
            pdfRequest === 'current'
              ? `Scorecard-${currentItem.displayName.replace(/\s+/g, '_')}.pdf`
              : 'Full_Evaluation_Report.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        }
        await html2pdf().set(opt).from(element).save()
      } catch (error) {
        if (!cancelled) setPdfError(`PDF export failed: ${error.message}`)
      } finally {
        if (!cancelled) {
          setPdfRequest(null)
          setIsExporting(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [pdfRequest, currentItem])

  function handleScoreChange(field, value) {
    setScores((prev) => ({
      ...prev,
      [currentItem.uniqueKey]: { ...currentScore, [field]: value },
    }))
  }

  function requestPdf(type) {
    setPdfError('')
    setIsExporting(true)
    setPdfRequest(type)
  }

  function exportJson() {
    downloadTextFile(
      'ngo-scores.json',
      `${JSON.stringify(scores, null, 2)}\n`,
      'application/json',
    )
  }

  function exportCsv() {
    downloadTextFile(
      'ngo-scores.csv',
      buildCsvExport(scores, flattened, new Date().toLocaleDateString()),
      'text/csv',
    )
  }

  function handleClearAll() {
    if (!window.confirm('Clear all scores and notes for every slot? This cannot be undone. Export JSON/CSV first if you need a copy.')) {
      return
    }
    setScores({})
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Storage unavailable: in-memory state is already cleared.
    }
  }

  async function handleImportFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setImportError('')
    try {
      const text = await file.text()
      const imported = parseImportedScores(text, flattened)
      setScores((prev) => ({ ...prev, ...imported }))
    } catch (error) {
      setImportError(error.message)
    }
  }

  return (
    <div className="relative flex h-screen overflow-hidden">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        flattened={flattened}
        scores={scores}
        selectedIndex={selectedIndex}
        onSelect={(idx) => {
          setSelectedIndex(idx)
          setIsMobileMenuOpen(false)
        }}
        onExportPdf={requestPdf}
        onExportJson={exportJson}
        onExportCsv={exportCsv}
        onImportClick={() => importInputRef.current?.click()}
        onClearAll={handleClearAll}
        isExporting={isExporting}
        grandTotal={grandTotal}
        grandMax={grandMax}
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
      />

      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleImportFile}
      />

      <div className="flex w-full flex-1 flex-col overflow-y-auto bg-gray-50">
        <header className="flex items-start gap-3 border-b bg-white px-4 py-4 shadow lg:px-8 lg:py-6">
          <button
            type="button"
            aria-label="Open menu"
            className="mt-1 shrink-0 text-gray-600 hover:text-gray-900 focus:outline-none lg:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex flex-1 items-center justify-between">
            <div>
              <h2 className="text-xl leading-tight font-bold text-gray-800 lg:text-2xl">
                {currentItem.id}: {currentItem.displayName}
              </h2>
              <p className="mt-1 text-xs font-medium text-gray-500 lg:text-sm">{currentItem.duration}</p>
            </div>
            <div className="pl-2 text-right">
              <div className="text-xs font-semibold text-gray-500 lg:text-sm">Score</div>
              <div className="text-2xl font-bold text-blue-600 lg:text-3xl">
                {formatTotal(calculateTotal(currentScore))} / {currentItem.maxPoints.toFixed(1)}
              </div>
            </div>
          </div>
        </header>

        {(pdfError || importError) && (
          <div role="alert" className="mx-4 mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800 lg:mx-8">
            {pdfError || importError}
          </div>
        )}

        <main className="grid grid-cols-1 gap-8 p-4 lg:p-8 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow">
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="candidate-name">
                Candidate Name
              </label>
              <input
                id="candidate-name"
                type="text"
                className="w-full rounded border p-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter applicant name..."
                value={currentScore.name}
                onChange={(e) => handleScoreChange('name', e.target.value)}
              />
            </div>

            <ScoreSliders item={currentItem} score={currentScore} onScoreChange={handleScoreChange} />

            <div className="rounded-lg border border-gray-300 bg-gray-100 p-6">
              <h3 className="mb-4 border-b pb-2 font-bold text-gray-700">
                Official TOR Requirements (Reference)
              </h3>
              <ul className="list-disc space-y-2 pl-5 text-sm text-gray-600">
                {currentItem.torData.map((req) => (
                  <li key={req}>{req}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <ScoringGuide globalAdvice={GLOBAL_ADVICE} item={currentItem} />

            <div className="space-y-4 rounded-lg bg-white p-6 shadow">
              <div>
                <label className="mb-2 block font-bold text-gray-800" htmlFor="evaluator-name">
                  Evaluator Name
                </label>
                <input
                  id="evaluator-name"
                  type="text"
                  className="w-full rounded border bg-gray-50 p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Who is scoring?"
                  value={currentScore.evaluator}
                  onChange={(e) => handleScoreChange('evaluator', e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block font-bold text-gray-800" htmlFor="evaluator-notes">
                  Notes
                </label>
                <textarea
                  id="evaluator-notes"
                  className="h-32 w-full rounded border p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter justification for scores..."
                  value={currentScore.notes}
                  onChange={(e) => handleScoreChange('notes', e.target.value)}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {pdfRequest && (
        <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', top: 0, width: '816px' }}>
          <div id="print-content">
            <PrintReport
              type={pdfRequest}
              currentItem={currentItem}
              flattened={flattened}
              scores={scores}
              dateText={new Date().toLocaleDateString()}
            />
          </div>
        </div>
      )}
    </div>
  )
}
