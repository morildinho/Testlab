import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Morildinho AI Lab",
  description: "En lekeplass for AI, design, vibe coding og eksperimenter.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no">
      <body
        style={{
          margin: 0,
          backgroundColor: "#000",
          color: "#fff",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
        }}
      >
        {children}
      </body>
    </html>
  );
}
