import {
  PROJECT_NAME,
  calculateGrandTotal,
  calculateTotal,
  formatTotal,
  getScoreData,
  grandMaxPoints,
} from '../lib/scoring'

function ScoreRow({ label, value, max }) {
  return (
    <tr>
      <td className="border p-2">{label}</td>
      <td className="border p-2 font-bold">{value}</td>
      <td className="border p-2 text-gray-500">{max}</td>
    </tr>
  )
}

export default function PrintReport({ type, currentItem, flattened, scores, dateText }) {
  if (type === 'current') {
    const data = getScoreData(scores, currentItem.uniqueKey, currentItem)
    return (
      <div className="border bg-white p-8">
        <h1 className="mb-2 text-2xl font-bold">Evaluation Scorecard</h1>
        <p className="mb-6 text-gray-500">
          Generated on: {dateText} | Evaluator: <strong>{data.evaluator || 'Not Listed'}</strong>
        </p>
        <div className="mb-6 rounded bg-gray-100 p-4">
          <h2 className="text-xl font-bold">
            {currentItem.id}: {currentItem.displayName}
          </h2>
          <p className="text-sm font-bold text-gray-500">{currentItem.duration}</p>
          <p className="mt-4">
            Applicant: <strong>{data.name || 'N/A'}</strong>
          </p>
          <p className="mt-2 text-2xl font-bold text-blue-600">
            Score: {formatTotal(calculateTotal(data))} / {currentItem.maxPoints}
          </p>
        </div>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Criteria</th>
              <th className="border p-2">Score</th>
              <th className="border p-2">Max</th>
            </tr>
          </thead>
          <tbody>
            <ScoreRow label="General Qualifications" value={data.gen} max={currentItem.breakdown.gen} />
            <ScoreRow label="Adequacy for Assignment" value={data.adeq} max={currentItem.breakdown.adeq} />
            <ScoreRow label="Regional Experience" value={data.reg} max={currentItem.breakdown.reg} />
          </tbody>
        </table>
        <div className="mt-6">
          <h3 className="mb-2 border-b pb-1 font-bold">Evaluator Notes</h3>
          <p className="min-h-[100px] border bg-gray-50 p-2 text-sm italic">
            {data.notes || 'No notes provided.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-8">
      <h1 className="mb-2 text-center text-3xl font-bold">Technical Evaluation Summary</h1>
      <p className="mb-8 text-center text-gray-500">{PROJECT_NAME} | {dateText}</p>
      <div className="mb-8 rounded border border-blue-200 bg-blue-50 p-4 text-center">
        <span className="text-lg font-semibold">Grand Total Score:</span>
        <span className="block text-3xl font-bold text-blue-700">
          {formatTotal(calculateGrandTotal(scores, flattened))} / {grandMaxPoints(flattened).toFixed(1)}
        </span>
      </div>
      {flattened.map((item, idx) => {
        const data = getScoreData(scores, item.uniqueKey, item)
        const isFirstOfKind = idx === 0 || flattened[idx - 1].id !== item.id
        return (
          <div key={item.uniqueKey}>
            {isFirstOfKind && (
              <div className="mt-8 mb-2 border-b-2 border-gray-800">
                <h2 className="text-xl font-bold">
                  {item.id}: {item.title}
                </h2>
              </div>
            )}
            <div className="mb-4 border-l-4 border-gray-300 bg-gray-50 p-3 pl-4">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-bold">
                  {item.displayName}: {data.name || '(No Name)'}
                </h3>
                <span className="text-lg font-bold">
                  {formatTotal(calculateTotal(data))} / {item.maxPoints}
                </span>
              </div>
              <div className="mb-2 font-mono text-xs text-gray-500">{item.duration}</div>
              <div className="mb-2 grid grid-cols-4 gap-4 text-sm text-gray-600">
                <div>
                  General: {data.gen}/{item.breakdown.gen}
                </div>
                <div>
                  Adequacy: {data.adeq}/{item.breakdown.adeq}
                </div>
                <div>
                  Regional: {data.reg}/{item.breakdown.reg}
                </div>
                <div>
                  <span className="text-xs text-gray-400">Eval: {data.evaluator || '-'}</span>
                </div>
              </div>
              {data.notes ? <p className="text-xs text-gray-500 italic">Note: {data.notes}</p> : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
