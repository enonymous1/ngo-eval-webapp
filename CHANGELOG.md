# Changelog

## 1.1.0 — 2026-10-28

GitHub Pages support, no app changes.

- Conditional Vite `base` from `PAGES_BASE` so the project site serves
  under `/ngo-eval-webapp/`; root deploys (Firebase, static hosts, local
  preview) are unchanged.
- `Deploy to GitHub Pages` workflow: `npm ci`, tests, Pages build, and
  deploy on every push to `main`. Enable once in Settings > Pages >
  Source: GitHub Actions.

## 1.0.0 — 2026-10-28

Initial public release: a reusable key-expert evaluation tool with fictional
sample data.

- Vite + React + Tailwind production build with pinned dependencies; no
  runtime CDN, no in-browser transpilation, no development builds.
- Role data in `src/data/roles.json` as fictional sample data for a generic
  program evaluation; breakdown sums validated by test (10 slots, 60 points).
- Split components: sidebar, sliders, scoring guide, and PDF report.
- Versioned, guarded `localStorage` persistence; corrupt saved data is
  ignored instead of crashing the app.
- PDF reports rendered as React (user-entered text is escaped); export
  failures reset the exporting state and show an error.
- JSON/CSV export, JSON import, and confirmed clear-all.
- Accessible labels on sliders, candidate, evaluator, and notes fields.
- Optional Firebase Hosting config at the repo root, serving `dist/`, with
  no project bound — bring your own Firebase project or any static host.
- 17 Vitest tests, GitHub Actions CI (test + build), MIT LICENSE.
