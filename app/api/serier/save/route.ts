import { NextResponse } from "next/server";
import { checkAdminRequest } from "@/lib/admin-auth";
import { emptyMeta, isValidSerieId, writeSerieMeta, type SerieMeta } from "@/lib/blob-serier";

export async function POST(request: Request) {
  const auth = checkAdminRequest(request);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const body = (await request.json()) as Partial<SerieMeta>;

    if (!isValidSerieId(body.id)) {
      return NextResponse.json(
        { error: "Ugyldig serie-id. Bruk små bokstaver, tall og bindestrek (f.eks. bergenfest-2025)." },
        { status: 400 }
      );
    }

    const base = emptyMeta(body.id);
    const meta: SerieMeta = {
      ...base,
      tittel: typeof body.tittel === "string" && body.tittel.trim() ? body.tittel.trim() : base.tittel,
      ar: typeof body.ar === "string" ? body.ar.trim() : base.ar,
      note: typeof body.note === "string" ? body.note.trim() : base.note,
      sort: Number.isFinite(body.sort) ? Number(body.sort) : base.sort,
      cover: typeof body.cover === "string" ? body.cover : null,
      order: Array.isArray(body.order) ? body.order.filter((x): x is string => typeof x === "string") : [],
      dims: body.dims && typeof body.dims === "object" ? body.dims : {},
    };

    await writeSerieMeta(meta);
    return NextResponse.json({ meta });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
