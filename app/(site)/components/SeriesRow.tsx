import Link from "next/link";
import type { Serie } from "@/lib/site";
import FadeImg from "./FadeImg";
import Reveal from "./Reveal";

export default function SeriesRow({ s, idx }: { s: Serie; idx: number }) {
  const flip = idx % 2 === 1;
  const antall = s.photos.length;

  const img = (
    <div className="rowImg">
      {s.cover ? (
        <FadeImg
          src={s.cover.src}
          alt={s.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div className="slot" style={{ height: "100%" }}>
          <span className="mono dim">
            oppdragsbilder
            <br />
            slippes inn her
          </span>
        </div>
      )}
    </div>
  );

  const txt = (
    <div className="rowTxt">
      <div className="mono dim">
        {s.nr} — {antall > 0 ? `${antall} bilder` : "kommer"}
      </div>
      <h2 className="rowTitle">{s.title}</h2>
      {s.note && (
        <p style={{ margin: 0, maxWidth: "34ch", fontSize: 16, lineHeight: 1.65, color: "rgba(237,236,234,.62)" }}>
          {s.note}
        </p>
      )}
      <div className="mono" style={{ marginTop: 8 }}>
        {antall > 0 ? "Se serien →" : "Snart →"}
      </div>
    </div>
  );

  const inner = flip ? (
    <>
      {txt}
      {img}
    </>
  ) : (
    <>
      {img}
      {txt}
    </>
  );

  return (
    <Reveal>
      {antall > 0 ? (
        <Link href={`/foto/${s.id}`} className="row">
          {inner}
        </Link>
      ) : (
        <div className="row">{inner}</div>
      )}
    </Reveal>
  );
}
