import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NOWLA – Lab",
  robots: { index: false, follow: false },
};

export default function NowlaLab() {
  return (
    <main style={{ padding: "4rem 2rem", maxWidth: 900 }}>
      <h1>NOWLA</h1>
      <p>
        Eksperimentell side for redesign, struktur og komponenter relatert til
        NOW-eventene.
      </p>
      <p>Status: aktiv lab 🧪</p>
    </main>
  );
}

