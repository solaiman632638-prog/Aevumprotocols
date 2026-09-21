# Aevum Protocols

Goal-and-risk matcher, reconstitution worksheets, and optional Whoop / Google Fit
overlay for the NovaEvum peptide catalog.

Next.js 16 · TypeScript · Tailwind v4. No component library.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |

## Routes

```
/                      Home
/today                 Daily scores + recommendations (wearable or manual check-in)
/plan                  Intake: goals, risk, flags
/plan/results          Matched peptides + supplements + syringe math
/monitor               Whoop / Google Fit (demo feed without API keys)
/peptides              Library: every Pepipedia monograph (no doses)
/peptides/[slug]       Monograph + link to worksheet when stocked
/protocols             Register: 20 NovaEvum worksheets + 23 protocol-only compounds
/protocols/[slug]      Worksheet and/or full protocol + pre-filled calculator
/calculator            Standalone reconstitution math
/stacks                Combined pairings
/guides                Method pages
/disclaimer
```

Copy `.env.example` to `.env.local` and fill Whoop / Google OAuth clients when
you want live straps. Until then, Monitor uses a deterministic demo week.

Amounts on the sheets are NovaEvum vial math, not Pepipedia doses and not
medical advice. Compound science is paraphrased from
[Pepipedia](https://www.pepipedia.com/peptides).

`src/lib/data/library.json` holds all Pepipedia monographs (pulled from
their public `/api/getAllPeptides` and `/api/getPeptide` endpoints, 2026-09-21).
Status, evidence, and side-effect fields are theirs; summary, mechanism, and
safety text is paraphrased.
