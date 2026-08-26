"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

const items: [href: string, label: string][] = [
  ["/foto", "Foto"],
  ["/film", "Video"],
  ["/om", "Om"],
];

export default function Bar() {
  const pathname = usePathname();

  return (
    <div className="bar">
      <Link href="/" className="mono" style={{ letterSpacing: ".22em", fontWeight: 700 }}>
        {site.ordmerke}
      </Link>
      <nav className="mono">
        {items.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className={`navlink${pathname === href || pathname.startsWith(`${href}/`) ? " on" : ""}`}
          >
            {label}
          </Link>
        ))}
        <a
          href="https://www.firemedia.no"
          target="_blank"
          rel="noopener noreferrer"
          className="navlink"
          style={{ fontStyle: "italic", letterSpacing: ".1em" }}
        >
          Fire ↗
        </a>
      </nav>
    </div>
  );
}
