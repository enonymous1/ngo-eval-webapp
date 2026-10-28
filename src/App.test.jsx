import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

beforeEach(() => {
  window.localStorage.clear()
})

describe('App', () => {
  it('renders all ten evaluation slots and the 60-point grand total', () => {
    render(<App />)
    expect(screen.getByText('Eval Dashboard')).toBeInTheDocument()
    // Ten sidebar slot buttons, each showing a score badge like "0.0/10".
    expect(screen.getAllByText(/^0\.0\/(10|6|5)$/)).toHaveLength(10)
    expect(screen.getByText('0.0/60')).toBeInTheDocument()
    expect(screen.getByText('K-1: Project Manager')).toBeInTheDocument()
  })

  it('updates the score when a slider moves and persists it', () => {
    render(<App />)
    const slider = screen.getByLabelText('General Qualifications score, 0 to 2')
    fireEvent.change(slider, { target: { value: '1.5' } })
    expect(screen.getByText('1.5 pts')).toBeInTheDocument()
    const saved = JSON.parse(window.localStorage.getItem('ngo_scores_v1'))
    expect(saved['K-1-0'].gen).toBe(1.5)
  })

  it('escapes user text instead of interpreting it as HTML', () => {
    render(<App />)
    const nameInput = screen.getByLabelText('Candidate Name')
    fireEvent.change(nameInput, { target: { value: '<img src=x onerror=alert(1)>' } })
    // The literal text is shown in the input; no img element is created.
    expect(document.querySelector('img')).toBeNull()
    expect(nameInput.value).toBe('<img src=x onerror=alert(1)>')
  })

  it('restores saved scores on load', () => {
    window.localStorage.setItem(
      'ngo_scores_v1',
      JSON.stringify({ 'K-1-0': { name: 'Restored', gen: 2, adeq: 7, reg: 1 } }),
    )
    render(<App />)
    expect(screen.getByLabelText('Candidate Name').value).toBe('Restored')
    expect(screen.getByText('10.0 / 10.0')).toBeInTheDocument()
  })
})
