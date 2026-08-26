import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="mono dim">© {new Date().getFullYear()} ESPEN VIK MORILD · BERGEN</div>
      <div style={{ display: "flex", gap: 24 }} className="mono">
        <Link href="/foto">Foto</Link>
        <Link href="/film">Video</Link>
        <Link href="/om">Om</Link>
        <a href="https://www.firemedia.no" target="_blank" rel="noopener noreferrer">
          Fire Media ↗
        </a>
      </div>
    </footer>
  );
}
