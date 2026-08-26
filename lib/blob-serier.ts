// Blob-laget for fotoseriene på morildinho.no.
//
// Struktur i Vercel Blob:
//   serier/<serie-id>/metadata.json
//   serier/<serie-id>/<filnavn>.jpg
//
// metadata.json holder tittel, år, beskrivelse, rekkefølge, forsidebilde og
// bredde/høyde per bilde. Dimensjonene MÅ ligge her: `list()` fra
// @vercel/blob returnerer ikke bildestørrelse, og skjelett-lastingen på
// serie-sidene trenger `aspect-ratio` før bildet er lastet for å unngå at
// layouten hopper.

import { list, put } from "@vercel/blob";

export const PREFIX = "serier/";
const IMAGE_RE = /\.(jpg|jpeg|png|webp|gif)$/i;

export type Dims = { w: number; h: number };

export type SerieMeta = {
  id: string;
  tittel: string;
  ar: string;
  note: string;
  /** Rekkefølgen serien vises i. Lavest først. */
  sort: number;
  /** Filnavn på forsidebildet. */
  cover: string | null;
  /** Filnavn i visningsrekkefølge. */
  order: string[];
  /** Bredde/høyde per filnavn. */
  dims: Record<string, Dims>;
};

export type BlobPhoto = {
  filename: string;
  url: string;
  w: number;
  h: number;
};

export type BlobSerie = {
  meta: SerieMeta;
  photos: BlobPhoto[];
};

export function emptyMeta(id: string): SerieMeta {
  return { id, tittel: id, ar: "", note: "", sort: 999, cover: null, order: [], dims: {} };
}

function metaPath(id: string) {
  return `${PREFIX}${id}/metadata.json`;
}

/** Tillater kun enkle slugs — brukes som mappenavn i Blob og i URL-en. */
export function isValidSerieId(id: unknown): id is string {
  return typeof id === "string" && /^[a-z0-9][a-z0-9-]{0,63}$/.test(id);
}

type RawBlob = { pathname: string; url: string };

async function listAll(prefix: string): Promise<RawBlob[]> {
  const out: RawBlob[] = [];
  let cursor: string | undefined;
  do {
    const res = await list({ prefix, cursor });
    for (const b of res.blobs) out.push({ pathname: b.pathname, url: b.url });
    cursor = res.cursor;
  } while (cursor);
  return out;
}

/**
 * Leser alle serier fra Blob. Returnerer tom liste hvis Blob er tom eller
 * utilgjengelig — kallstedet bestemmer hva som skjer da.
 */
export async function listSerier(): Promise<BlobSerie[]> {
  let blobs: RawBlob[];
  try {
    blobs = await listAll(PREFIX);
  } catch {
    return [];
  }

  const byId = new Map<string, { metaUrl?: string; files: RawBlob[] }>();

  for (const b of blobs) {
    const parts = b.pathname.split("/");
    if (parts.length < 3) continue;
    const id = parts[1];
    if (!isValidSerieId(id)) continue;

    const entry = byId.get(id) ?? { files: [] };
    if (b.pathname.endsWith("/metadata.json")) {
      entry.metaUrl = b.url;
    } else if (IMAGE_RE.test(b.pathname)) {
      entry.files.push(b);
    }
    byId.set(id, entry);
  }

  const serier = await Promise.all(
    Array.from(byId.entries()).map(async ([id, entry]) => {
      const meta = entry.metaUrl ? await fetchMeta(id, entry.metaUrl) : emptyMeta(id);

      const orderIndex = new Map(meta.order.map((fn, i) => [fn, i]));
      const photos: BlobPhoto[] = entry.files
        .map((f) => {
          const filename = f.pathname.split("/").pop() as string;
          const d = meta.dims[filename];
          return {
            filename,
            url: f.url,
            // 3:2 er en trygg default hvis dimensjonene mangler — bildet vises
            // riktig uansett (object-fit), det er bare skjelettet som kan bomme.
            w: d?.w ?? 3,
            h: d?.h ?? 2,
          };
        })
        .sort((a, b) => {
          const ai = orderIndex.get(a.filename);
          const bi = orderIndex.get(b.filename);
          if (ai !== undefined && bi !== undefined) return ai - bi;
          if (ai !== undefined) return -1;
          if (bi !== undefined) return 1;
          return a.filename.localeCompare(b.filename, "nb");
        });

      return { meta, photos };
    })
  );

  return serier.sort((a, b) => a.meta.sort - b.meta.sort || a.meta.id.localeCompare(b.meta.id, "nb"));
}

async function fetchMeta(id: string, url: string): Promise<SerieMeta> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return emptyMeta(id);
    const raw = (await res.json()) as Partial<SerieMeta>;
    return {
      id,
      tittel: typeof raw.tittel === "string" && raw.tittel ? raw.tittel : id,
      ar: typeof raw.ar === "string" ? raw.ar : "",
      note: typeof raw.note === "string" ? raw.note : "",
      sort: typeof raw.sort === "number" ? raw.sort : 999,
      cover: typeof raw.cover === "string" ? raw.cover : null,
      order: Array.isArray(raw.order) ? raw.order.filter((x): x is string => typeof x === "string") : [],
      dims: raw.dims && typeof raw.dims === "object" ? (raw.dims as Record<string, Dims>) : {},
    };
  } catch {
    return emptyMeta(id);
  }
}

export async function writeSerieMeta(meta: SerieMeta): Promise<void> {
  await put(metaPath(meta.id), JSON.stringify(meta, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
