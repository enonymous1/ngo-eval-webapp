const CRITERIA = [
  {
    field: 'gen',
    label: 'General Qualifications',
    percent: '20%',
    maxLabel: 'gen',
    border: 'border-purple-500',
    badge: 'bg-purple-100 text-purple-800',
    valueClass: 'text-purple-600',
  },
  {
    field: 'adeq',
    label: 'Adequacy for Assignment',
    percent: '70%',
    maxLabel: 'adeq',
    border: 'border-blue-500',
    badge: 'bg-blue-100 text-blue-800',
    valueClass: 'text-blue-600',
  },
  {
    field: 'reg',
    label: 'Regional Experience',
    percent: '10%',
    maxLabel: 'reg',
    border: 'border-green-500',
    badge: 'bg-green-100 text-green-800',
    valueClass: 'text-green-600',
  },
]

export default function ScoreSliders({ item, score, onScoreChange }) {
  return (
    <div className="space-y-4">
      {CRITERIA.map((criterion, index) => {
        const max = item.breakdown[criterion.maxLabel]
        const inputId = `score-${criterion.field}`
        return (
          <div key={criterion.field} className={`rounded-lg border-l-4 bg-white p-6 shadow ${criterion.border}`}>
            <div className="mb-2 flex justify-between">
              <h3 className="font-bold text-gray-800">
                {index + 1}. {criterion.label} ({criterion.percent})
              </h3>
              <span className={`rounded px-2 py-1 font-mono text-sm ${criterion.badge}`}>Max: {max}</span>
            </div>
            <p className="mb-2 text-xs text-gray-500">{item.reqs[criterion.maxLabel]}</p>
            <label className="sr-only" htmlFor={inputId}>
              {criterion.label} score, 0 to {max}
            </label>
            <input
              id={inputId}
              type="range"
              min="0"
              max={max}
              step="0.1"
              value={score[criterion.field]}
              onChange={(e) => onScoreChange(criterion.field, Number(e.target.value))}
              className="slider-thumb h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
            />
            <div className={`mt-2 text-right font-bold ${criterion.valueClass}`}>
              {score[criterion.field]} pts
            </div>
          </div>
        )
      })}
    </div>
  )
}
