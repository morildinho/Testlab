# morildinho.no

Next.js-side (App Router) på Vercel. Repoet inneholder to uavhengige ting:

1. **morildinho.no** — den offentlige porteføljesiden, under `app/(site)/`.
2. **/lab** — eksperimenter, blant annet NOW Highlights som serves på
   `highlights.nowla.org` via `middleware.ts` + rewrites i `next.config.ts`.
   Disse har egen noindex og skal ikke røres av arbeid på nettsiden.

## Kom i gang

```bash
npm run dev
```

## Nettsiden

Designet kommer fra `design_handoff_morildinho` (Morildinho-Kino-v2).

| Rute | Fil |
| --- | --- |
| `/` | `app/(site)/page.tsx` |
| `/foto` | `app/(site)/foto/page.tsx` |
| `/foto/[serie]` | `app/(site)/foto/[serie]/page.tsx` |
| `/film` | `app/(site)/film/page.tsx` |
| `/om` | `app/(site)/om/page.tsx` |

- All CSS ligger i `app/(site)/site.css`, scopet under `.site` slik at
  `/lab` ikke påvirkes.
- Fonter (Syne, Work Sans, Space Mono) lastes med `next/font/google` i
  `app/layout.tsx` og eksponeres som CSS-variabler.
- Innhold og bilder kommer fra `lib/site.ts`.

## Bilder — plassholdere i dag, Vercel Blob senere

`lib/site.ts` peker i dag på plassholderbilder i `public/photos/`. Når de ekte
bildene skal inn:

1. Last opp til Blob med én mappe per serie: `serier/<serie-id>/01_.jpg`,
   `serier/<serie-id>/02_.jpg` … Filnavnet gir rekkefølgen.
2. Lagre bredde/høyde per bilde i en `metadata.json` i samme mappe.
   Skjelett-lastingen trenger `aspect-ratio` **før** bildet er lastet — uten
   det hopper layouten. `list()` fra `@vercel/blob` returnerer ikke
   bildedimensjoner, så de må lagres eksplisitt (samme mønster som
   `/lab/now2025/upload` allerede bruker for rekkefølge og beskrivelse).
3. Bytt ut `getSeries()` / `getSerie()` i `lib/site.ts` med Blob-kall. Resten
   av siden trenger ingen endringer.

Prefiksene `Gallery/` og `now/` i Blob tilhører gammelt innhold og /lab — bruk
`serier/` for nettsiden.
