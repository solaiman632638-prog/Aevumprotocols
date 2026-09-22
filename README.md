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
/today                 Daily check-in, scores, recommendations, and history
/account               Optional sign-in and sync; export and delete data
/privacy, /terms       Legal pages (review with a lawyer before relying on them)
/monitor               Devices: optional Whoop (live with keys) / Google Fit (demo)
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

## Accounts and sync (optional)

Everything works without accounts; data stays in the browser. To switch on
sign-in and cross-device sync:

1. Create a Supabase project (Vercel → Storage → Supabase sets the
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` variables).
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Supabase → Authentication → URL configuration: set the Site URL to the
   production domain and add `https://<domain>/account` as a redirect URL.
4. Redeploy.

## Live Whoop data

Set `WHOOP_CLIENT_ID` and `WHOOP_CLIENT_SECRET` from developer.whoop.com and
register `https://<domain>/api/wearables/whoop/callback` as the redirect URL.
Without them, Devices shows a demo feed.
