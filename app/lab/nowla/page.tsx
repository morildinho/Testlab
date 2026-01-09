import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NOWLA – Lab",
  description: "Eksperimenter for NOW-event redesign og komponenter.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main style={{ padding: "4rem 2rem", maxWidth: 900, lineHeight: 1.6 }}>
      <h1>NOWLA</h1>
      <p>
        Dette er en labsid e for å teste redesign, struktur og komponenter for
        NOW-eventene (som i dag ligger i Squarespace).
      </p>

      <h2>Status</h2>
      <ul>
        <li>🧪 Aktiv lab</li>
        <li>🔒 Ikke indekser (noindex)</li>
        <li>🧱 Next.js route: /lab/nowla</li>
      </ul>

      <h2>Notater</h2>
      <p>—</p>
    </main>
  );
}
