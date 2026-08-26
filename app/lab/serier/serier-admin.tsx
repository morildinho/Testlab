"use client";

import { useCallback, useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";
import type { BlobSerie, SerieMeta } from "@/lib/blob-serier";

const PW_KEY = "serier-admin-pw";

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Bredde/høyde må leses her — Blob lagrer ikke bildedimensjoner. */
async function readDims(file: File): Promise<{ w: number; h: number }> {
  try {
    const bitmap = await createImageBitmap(file);
    const dims = { w: bitmap.width, h: bitmap.height };
    bitmap.close();
    return dims;
  } catch {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        resolve({ w: img.naturalWidth, h: img.naturalHeight });
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        resolve({ w: 3, h: 2 });
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });
  }
}

const box: React.CSSProperties = {
  padding: "9px 11px",
  border: "1px solid rgba(255,255,255,.18)",
  background: "rgba(0,0,0,.25)",
  color: "inherit",
  borderRadius: 8,
  font: "inherit",
};

const btn: React.CSSProperties = {
  ...box,
  cursor: "pointer",
  background: "rgba(255,255,255,.1)",
};

export default function SerierAdmin() {
  const [password, setPassword] = useState("");
  const [serier, setSerier] = useState<BlobSerie[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [nyId, setNyId] = useState("");

  useEffect(() => {
    setPassword(sessionStorage.getItem(PW_KEY) ?? "");
  }, []);

  useEffect(() => {
    if (password) sessionStorage.setItem(PW_KEY, password);
  }, [password]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/serier", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kunne ikke hente serier.");
      setSerier(data.serier as BlobSerie[]);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveMeta(meta: SerieMeta) {
    const res = await fetch("/api/serier/save", {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-password": password },
      body: JSON.stringify(meta),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Lagring feilet.");
  }

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setError(null);
    setStatus(null);
    try {
      await fn();
      await load();
      setStatus("Lagret.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function nySerie() {
    const id = slugify(nyId);
    if (!id) {
      setError("Gi serien en id, f.eks. bergenfest-2025.");
      return;
    }
    void run("ny", async () => {
      await saveMeta({
        id,
        tittel: nyId.trim() || id,
        ar: "",
        note: "",
        sort: serier.length + 1,
        cover: null,
        order: [],
        dims: {},
      });
      setNyId("");
    });
  }

  function addPhotos(serie: BlobSerie, files: FileList) {
    void run(`opp-${serie.meta.id}`, async () => {
      const order = serie.meta.order.length ? [...serie.meta.order] : serie.photos.map((p) => p.filename);
      const dims = { ...serie.meta.dims };
      let n = order.length;

      for (const file of Array.from(files)) {
        const d = await readDims(file);
        n += 1;
        const filename = `${String(n).padStart(2, "0")}_${slugify(file.name)}`;
        setStatus(`Laster opp ${filename} …`);

        await upload(`serier/${serie.meta.id}/${filename}`, file, {
          access: "public",
          handleUploadUrl: "/api/blob/upload",
          multipart: true,
          contentType: file.type,
          clientPayload: JSON.stringify({ password }),
        });

        order.push(filename);
        dims[filename] = d;
      }

      await saveMeta({ ...serie.meta, order, dims, cover: serie.meta.cover ?? order[0] ?? null });
    });
  }

  function move(serie: BlobSerie, filename: string, dir: -1 | 1) {
    const order = serie.photos.map((p) => p.filename);
    const i = order.indexOf(filename);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    void run(`flytt-${serie.meta.id}`, () => saveMeta({ ...serie.meta, order }));
  }

  function slettBilde(serie: BlobSerie, filename: string) {
    if (!confirm(`Slette ${filename}?`)) return;
    void run(`slett-${filename}`, async () => {
      const res = await fetch("/api/serier/delete", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ serie: serie.meta.id, filenames: [filename] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sletting feilet.");

      const order = serie.photos.map((p) => p.filename).filter((f) => f !== filename);
      const dims = { ...serie.meta.dims };
      delete dims[filename];
      await saveMeta({
        ...serie.meta,
        order,
        dims,
        cover: serie.meta.cover === filename ? (order[0] ?? null) : serie.meta.cover,
      });
    });
  }

  function slettSerie(serie: BlobSerie) {
    if (!confirm(`Slette hele serien "${serie.meta.tittel}" med ${serie.photos.length} bilder?`)) return;
    void run(`slett-${serie.meta.id}`, async () => {
      const res = await fetch("/api/serier/delete", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ serie: serie.meta.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sletting feilet.");
    });
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.5rem 6rem", lineHeight: 1.5 }}>
      <h1 style={{ margin: "0 0 6px" }}>Serier — opplasting</h1>
      <p style={{ opacity: 0.7, marginTop: 0 }}>
        Bildene her er innholdet på morildinho.no. De lagres i Vercel Blob under{" "}
        <code>serier/&lt;id&gt;/</code>. Endringer vises på nettsiden innen ett minutt.
      </p>

      <label style={{ display: "grid", gap: 6, maxWidth: 360, marginTop: 24 }}>
        <span>Passord</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="SERIER_ADMIN_PASSWORD"
          style={box}
        />
      </label>

      {error && (
        <p style={{ color: "tomato", border: "1px solid tomato", padding: "10px 12px", borderRadius: 8 }}>{error}</p>
      )}
      {status && <p style={{ opacity: 0.75 }}>{status}</p>}

      <section style={{ margin: "34px 0", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end" }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Ny serie</span>
          <input
            value={nyId}
            onChange={(e) => setNyId(e.target.value)}
            placeholder="Bergenfest 2025"
            style={{ ...box, minWidth: 260 }}
          />
        </label>
        <button onClick={nySerie} disabled={busy !== null} style={btn}>
          Opprett
        </button>
        {nyId && <span style={{ opacity: 0.6 }}>id: {slugify(nyId)}</span>}
      </section>

      {loading && <p>Laster …</p>}

      {serier.map((s) => (
        <section
          key={s.meta.id}
          style={{ border: "1px solid rgba(255,255,255,.14)", borderRadius: 12, padding: 20, marginBottom: 22 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0 }}>
              {s.meta.tittel} <span style={{ opacity: 0.45, fontWeight: 400 }}>/{s.meta.id}</span>
            </h2>
            <button onClick={() => slettSerie(s)} disabled={busy !== null} style={{ ...btn, color: "tomato" }}>
              Slett serien
            </button>
          </div>

          <SerieFelter serie={s} busy={busy !== null} onSave={(meta) => void run(`meta-${s.meta.id}`, () => saveMeta(meta))} />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))",
              gap: 14,
              marginTop: 20,
            }}
          >
            {s.photos.map((p, i) => (
              <div key={p.filename} style={{ border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, padding: 8 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt={p.filename}
                  style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 4, display: "block" }}
                />
                <div style={{ fontSize: 12, opacity: 0.6, margin: "6px 0", wordBreak: "break-all" }}>
                  {i + 1}. {p.filename} · {p.w}×{p.h}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button onClick={() => move(s, p.filename, -1)} disabled={busy !== null || i === 0} style={btn}>
                    ↑
                  </button>
                  <button
                    onClick={() => move(s, p.filename, 1)}
                    disabled={busy !== null || i === s.photos.length - 1}
                    style={btn}
                  >
                    ↓
                  </button>
                  <button
                    onClick={() =>
                      void run(`cover-${s.meta.id}`, () => saveMeta({ ...s.meta, cover: p.filename }))
                    }
                    disabled={busy !== null || s.meta.cover === p.filename}
                    style={btn}
                  >
                    {s.meta.cover === p.filename ? "Forside ✓" : "Forside"}
                  </button>
                  <button onClick={() => slettBilde(s, p.filename)} disabled={busy !== null} style={{ ...btn, color: "tomato" }}>
                    Slett
                  </button>
                </div>
              </div>
            ))}
          </div>

          <label style={{ display: "grid", gap: 6, marginTop: 18, maxWidth: 460 }}>
            <span>Legg til bilder (velges i den rekkefølgen du vil ha dem)</span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={busy !== null}
              onChange={(e) => {
                if (e.target.files?.length) addPhotos(s, e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </section>
      ))}

      {!loading && serier.length === 0 && (
        <p style={{ opacity: 0.7 }}>Ingen serier i Blob ennå. Nettsiden viser plassholderbildene til du oppretter en.</p>
      )}
    </main>
  );
}

function SerieFelter({
  serie,
  busy,
  onSave,
}: {
  serie: BlobSerie;
  busy: boolean;
  onSave: (meta: SerieMeta) => void;
}) {
  const [tittel, setTittel] = useState(serie.meta.tittel);
  const [ar, setAr] = useState(serie.meta.ar);
  const [note, setNote] = useState(serie.meta.note);
  const [sort, setSort] = useState(String(serie.meta.sort));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12, marginTop: 16 }}>
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 13, opacity: 0.7 }}>Tittel</span>
        <input value={tittel} onChange={(e) => setTittel(e.target.value)} style={box} />
      </label>
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 13, opacity: 0.7 }}>År</span>
        <input value={ar} onChange={(e) => setAr(e.target.value)} placeholder="2025" style={box} />
      </label>
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 13, opacity: 0.7 }}>Sortering (lavest først)</span>
        <input value={sort} onChange={(e) => setSort(e.target.value)} inputMode="numeric" style={box} />
      </label>
      <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}>
        <span style={{ fontSize: 13, opacity: 0.7 }}>Beskrivelse (valgfri — tom tekst vises ikke)</span>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} style={{ ...box, resize: "vertical" }} />
      </label>
      <div style={{ gridColumn: "1 / -1" }}>
        <button
          onClick={() =>
            onSave({ ...serie.meta, tittel, ar, note, sort: Number(sort) || 999, order: serie.photos.map((p) => p.filename) })
          }
          disabled={busy}
          style={btn}
        >
          Lagre serieinfo
        </button>
      </div>
    </div>
  );
}
