import { calculateTotal, formatTotal, getScoreData } from '../lib/scoring'

export default function Sidebar({
  flattened,
  scores,
  selectedIndex,
  onSelect,
  onExportPdf,
  onExportJson,
  onExportCsv,
  onImportClick,
  onClearAll,
  isExporting,
  grandTotal,
  grandMax,
  isMobileMenuOpen,
  onCloseMobileMenu,
}) {
  return (
    <div
      className={`fixed inset-y-0 left-0 z-40 w-80 shrink-0 flex-col bg-slate-800 text-white transition-transform duration-300 ease-in-out lg:static lg:flex lg:w-96 lg:translate-x-0 ${
        isMobileMenuOpen ? 'flex translate-x-0' : '-translate-x-full'
      }`}
    >
      <button
        type="button"
        aria-label="Close menu"
        className="absolute top-4 right-4 text-gray-400 hover:text-white lg:hidden"
        onClick={onCloseMobileMenu}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="z-10 bg-slate-900 p-4 shadow-md">
        <h1 className="text-xl font-bold">Eval Dashboard</h1>
        <div className="mt-1 text-xs text-slate-400">
          Total Score:{' '}
          <span className="text-lg font-bold text-green-400">
            {formatTotal(grandTotal)}/{grandMax}
          </span>
        </div>
      </div>

      <div className="space-y-2 border-b border-slate-700 p-2">
        <button
          type="button"
          onClick={() => onExportPdf('current')}
          disabled={isExporting}
          className="w-full rounded bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {isExporting ? 'Exporting…' : '📄 Export Current'}
        </button>
        <button
          type="button"
          onClick={() => onExportPdf('full')}
          disabled={isExporting}
          className="w-full rounded bg-green-600 py-2 text-xs font-bold text-white hover:bg-green-500 disabled:opacity-50"
        >
          {isExporting ? 'Exporting…' : '📑 Export Full Report'}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onExportJson}
            className="rounded bg-slate-700 py-2 text-xs font-bold text-white hover:bg-slate-600"
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={onExportCsv}
            className="rounded bg-slate-700 py-2 text-xs font-bold text-white hover:bg-slate-600"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={onImportClick}
            className="rounded bg-slate-700 py-2 text-xs font-bold text-white hover:bg-slate-600"
          >
            Import JSON
          </button>
          <button
            type="button"
            onClick={onClearAll}
            className="rounded bg-red-700 py-2 text-xs font-bold text-white hover:bg-red-600"
          >
            Clear All Scores
          </button>
        </div>
        <p className="px-1 text-[11px] leading-snug text-slate-400">
          Scores are saved only in this browser. Export JSON/CSV before clearing them or switching
          devices.
        </p>
      </div>

      <nav aria-label="Evaluation slots" className="flex-1 overflow-y-auto">
        {flattened.map((item, idx) => {
          const isSelected = selectedIndex === idx
          const score = calculateTotal(getScoreData(scores, item.uniqueKey, item))
          return (
            <button
              key={item.uniqueKey}
              type="button"
              aria-current={isSelected ? 'true' : undefined}
              onClick={() => onSelect(idx)}
              className={`group flex w-full items-center justify-between border-b border-slate-700 p-3 text-left transition hover:bg-slate-700 ${
                isSelected ? 'border-l-4 border-l-white bg-blue-600' : 'border-l-4 border-l-transparent'
              }`}
            >
              <div className="pr-2">
                <div className="text-sm leading-tight font-bold">{item.displayName}</div>
                <div className="mt-1 text-xs text-slate-300">
                  {item.id} <span className="font-mono text-slate-400">| {item.sidebarMeta}</span>
                </div>
              </div>
              <div
                className={`shrink-0 rounded px-2 py-1 text-xs font-bold ${
                  isSelected ? 'bg-blue-800' : 'bg-slate-900 group-hover:bg-slate-800'
                }`}
              >
                {formatTotal(score)}/{item.maxPoints}
              </div>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
