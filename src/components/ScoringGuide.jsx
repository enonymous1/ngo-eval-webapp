export default function ScoringGuide({ globalAdvice, item }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2 rounded-lg bg-slate-800 p-4 text-xs text-white shadow-sm">
        <h3 className="mb-2 border-b border-slate-600 pb-1 text-sm font-bold text-yellow-400">
          Global Scoring Logic
        </h3>
        <p>
          <strong>📅 {globalAdvice.dates}</strong>
        </p>
        <p>
          <strong>🌍 {globalAdvice.regional}</strong>
        </p>
        <p className="text-slate-400 italic">{globalAdvice.bolding}</p>
      </div>

      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 font-bold text-yellow-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          Scoring Guide &amp; Keywords
        </h3>
        <div className="space-y-4 text-sm text-gray-800">
          <div>
            <span className="block text-xs font-bold tracking-wider text-gray-600 uppercase">
              Education
            </span>
            {item.guide.edu}
          </div>
          <div>
            <span className="block text-xs font-bold tracking-wider text-gray-600 uppercase">
              Certification
            </span>
            {item.guide.cert}
          </div>
          <div>
            <span className="block text-xs font-bold tracking-wider text-gray-600 uppercase">
              Experience
            </span>
            {item.guide.exp}
          </div>
          <div className="border-t border-yellow-200 pt-2">
            <span className="mb-2 block text-xs font-bold tracking-wider text-red-600 uppercase">
              Must-Have Keywords
            </span>
            <div className="flex flex-wrap gap-2">
              {item.guide.keywords.map((keyword) => (
                <span key={keyword} className="highlight-keyword">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
