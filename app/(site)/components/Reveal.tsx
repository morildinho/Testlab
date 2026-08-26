"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
};

/** Toner inn + løfter elementet når det scrolles inn i viewporten. */
export default function Reveal({ children, delay = 0, className = "", style }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let done = false;
    const show = () => {
      if (done) return;
      done = true;
      setOn(true);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        // `top < 0` fanger opp raske scroll-hopp der elementet passerte
        // viewporten mellom to frames og aldri rakk å bli "intersecting".
        if (e.isIntersecting || e.boundingClientRect.top < 0) show();
      },
      { threshold: 0.12 }
    );

    // IntersectionObserver fyrer ikke mens dokumentet er skjult (f.eks. en side
    // som lastes i en bakgrunnsfane). Uten dette blir innholdet liggende
    // usynlig til brukeren scroller.
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) show();
    };

    io.observe(el);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`rev${on ? " in" : ""}${className ? ` ${className}` : ""}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}
