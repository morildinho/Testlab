import { NextResponse } from "next/server";
import { listSerier } from "@/lib/blob-serier";

export const dynamic = "force-dynamic";

/** Leser alle serier fra Blob. Åpen for lesing — innholdet er offentlig uansett. */
export async function GET() {
  try {
    const serier = await listSerier();
    return NextResponse.json({ serier });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
