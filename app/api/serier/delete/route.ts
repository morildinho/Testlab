import { NextResponse } from "next/server";
import { del, list } from "@vercel/blob";
import { checkAdminRequest } from "@/lib/admin-auth";
import { PREFIX, isValidSerieId } from "@/lib/blob-serier";

export async function POST(request: Request) {
  const auth = checkAdminRequest(request);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const { serie, filenames } = (await request.json()) as {
      serie?: string;
      /** Utelatt = slett hele serien, metadata inkludert. */
      filenames?: string[];
    };

    if (!isValidSerieId(serie)) {
      return NextResponse.json({ error: "Ugyldig serie-id." }, { status: 400 });
    }

    // Vi sletter aldri på URL fra klienten — bare på stier vi selv har bygget
    // under serier/<id>/, så et kall herfra ikke kan røre /lab sitt innhold.
    const prefix = `${PREFIX}${serie}/`;
    const existing: string[] = [];
    let cursor: string | undefined;
    do {
      const res = await list({ prefix, cursor });
      for (const b of res.blobs) existing.push(b.pathname);
      cursor = res.cursor;
    } while (cursor);

    const targets = filenames?.length
      ? existing.filter((p) => filenames.includes(p.slice(prefix.length)))
      : existing;

    if (targets.length === 0) {
      return NextResponse.json({ deleted: 0 });
    }

    await del(targets);
    return NextResponse.json({ deleted: targets.length });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
