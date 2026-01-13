export default async function Page({
  params,
}: {
  params: Promise<{ album: string }>;
}) {
  const { album } = await params;

  return (
    <main style={{ padding: "3rem 1.5rem" }}>
      <h1>Album: {album}</h1>
      <p>Hvis du ser dette, fungerer /lab/now2025/[album] ✅</p>
    </main>
  );
}

