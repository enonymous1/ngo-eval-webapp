# NGO Key Experts Evaluation Tool

Score key-expert candidates against program requirements: seven roles
(K-1–K-7) flattened to ten evaluation slots, 60 points in total, with sliders
for General Qualifications (20%), Adequacy for Assignment (70%), and Regional
Experience (10%).

The sample data in this repo is fictional and generic, included only so the
tool can be tried out and reused. Replace it with your own program's roles
and requirements — see [Data](#data) below.

Scores and notes auto-save in the browser, so a refresh does not lose work.
Export a single scorecard or the full summary as PDF, or export/import all
scores as JSON or CSV. No candidate data ships with the app, and nothing is
sent to a server: the app has no backend, no accounts, and no analytics.

This is a generic evaluator aid. It is not affiliated with or endorsed by
any organization, government agency, or development bank.

## Live demo (GitHub Pages)

Try it at <https://enonymous1.github.io/ngo-eval-webapp/> — no install
needed. The demo shows the fictional sample data; scores you enter are
saved only in your own browser.

The site deploys automatically on every push to `main` via the
`Deploy to GitHub Pages` workflow. To enable it the first time, in the
repo go to Settings > Pages > Build and deployment, set Source to
GitHub Actions, and save. The workflow builds with
`PAGES_BASE=/ngo-eval-webapp/` so assets load under the project-site
subpath; other deploys are unaffected.

## Quick start

```sh
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

```sh
npm test        # 17 Vitest tests: scoring, flattening, storage, CSV, UI
npm run build   # production build in dist/
npm run preview # serve the production build locally
```

Node 20.19+ or 22.12+ is required (Vite 7).

## Features

- **Role navigation:** sidebar lists all ten slots, including the K-2 special
  case (first slot is the 18-month Lead, second is 6-month only) and the three
  Business Analyst slots. Each slot shows its live score against its max.
- **Scoring sliders:** 0.1 steps, clamped to each criterion's max, with the
  requirement shown under each slider.
- **Scoring guide:** education, certification, experience, and must-have
  keywords per role, plus the global scoring logic (date handling and
  regional experience).
- **Reference requirements:** the requirement text for the selected role.
- **Auto-save:** scores are stored under the versioned `ngo_scores_v1` key
  in `localStorage`. Corrupt saved data is ignored instead of crashing the
  app.
- **PDF export:** single scorecard or full 60-point summary, rendered from
  React (user-entered text is escaped, never interpolated into HTML).
  A failed export reports an error and resets instead of leaving the
  export buttons stuck.
- **JSON/CSV export and JSON import:** take scores off the machine, restore
  them later, or clear everything with a confirmation step first.

## Data

Role definitions, scoring breakdowns, guides, and requirement text live in
`src/data/roles.json`. The shipped file is fictional sample data for a
generic program evaluation. Breakdowns are validated by test: every role's
three criteria sum to its max points, and all ten slots sum to 60. Edit that
file (and keep the sums) to reuse the tool for a different evaluation — no
other code changes are needed for the data itself. The project name shown on
PDF reports is the `projectName` field at the top of the same file.

## Deploy (Firebase Hosting, optional)

`firebase.json` at the repo root configures Firebase Hosting to serve the
Vite `dist/` output. No Firebase project is bound in this repo — create
your own project and connect it before deploying:

```sh
npm install -g firebase-tools
firebase login
firebase use --add
npm run build
firebase deploy
```

Any static host that serves `dist/` works equally well.

## Project layout

```text
src/
  main.jsx               Entry point
  App.jsx                Layout, state, PDF/JSON/CSV actions
  index.css              Tailwind v4 + slider/scrollbar styles
  data/roles.json        Role definitions, guides, requirement text
  lib/scoring.js         Flattening, totals, storage, CSV export
  components/
    Sidebar.jsx          Slot list + export/clear actions
    ScoreSliders.jsx     The three scoring sliders
    ScoringGuide.jsx     Global advice + per-role cheat sheet
    PrintReport.jsx      PDF report, rendered as React
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
