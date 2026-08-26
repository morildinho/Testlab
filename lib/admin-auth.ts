import { timingSafeEqual } from "node:crypto";

export type AuthFail = { ok: false; status: number; message: string };

/**
 * Skriveoperasjoner på seriene endrer den offentlige nettsiden, så de krever
 * passord. Er `SERIER_ADMIN_PASSWORD` ikke satt, avvises alt — heller låst
 * ute enn åpent for hvem som helst.
 */
export function checkAdmin(password: string | null): { ok: true } | AuthFail {
  const expected = process.env.SERIER_ADMIN_PASSWORD;

  if (!expected) {
    return {
      ok: false,
      status: 503,
      message:
        "SERIER_ADMIN_PASSWORD er ikke satt. Legg den inn som miljøvariabel i Vercel (og i .env.local lokalt) før du laster opp.",
    };
  }

  if (!password) return { ok: false, status: 401, message: "Mangler passord." };

  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, status: 401, message: "Feil passord." };
  }

  return { ok: true };
}

export function checkAdminRequest(request: Request) {
  return checkAdmin(request.headers.get("x-admin-password"));
}
