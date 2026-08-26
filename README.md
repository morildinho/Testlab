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

## Bilder — Vercel Blob

Fotoseriene leses fra Blob. Er Blob tom, viser siden plassholderbildene i
`public/photos/` — den ser altså komplett ut før noe er lastet opp.

Struktur:

```
serier/<serie-id>/metadata.json
serier/<serie-id>/01_bilde.jpg
serier/<serie-id>/02_bilde.jpg
```

`metadata.json` holder tittel, år, beskrivelse, sortering, forsidebilde,
rekkefølge og **bredde/høyde per bilde**. Dimensjonene må ligge der:
`list()` fra `@vercel/blob` returnerer ikke bildestørrelse, og
skjelett-lastingen trenger `aspect-ratio` før bildet er lastet for at
layouten ikke skal hoppe. Opplastingssiden leser dem i nettleseren og
skriver dem inn automatisk.

Prefiksene `Gallery/` og `now/` i Blob tilhører gammelt innhold og `/lab` —
nettsiden bruker kun `serier/`.

### Opplasting: `/lab/serier`

Opprett serier, last opp bilder, sett rekkefølge og forsidebilde, slett.
Siden er noindex og ligger under `/lab`, som robots.txt allerede utelukker.

Krever miljøvariabelen `SERIER_ADMIN_PASSWORD` — både i Vercel og i
`.env.local` lokalt. Uten den avvises all skriving. Passordet gjelder både
API-rutene under `/api/serier/` og opplasting til `serier/`-prefikset i
`/api/blob/upload`; `/lab` sine `now/`-opplastinger er uendret.

Endringer slår gjennom på nettsiden innen ett minutt (`revalidate = 60`).
