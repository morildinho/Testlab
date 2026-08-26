// Innhold for morildinho.no.
//
// Bildene er foreløpig plassholdere som ligger i /public/photos. Når de ekte
// bildene er lastet opp til Vercel Blob byttes `getSeries()` ut med et
// Blob-kall — resten av siden rører vi ikke. Strukturen i Blob blir
// `serier/<serie-id>/01_.jpg` osv., der filnavnet gir rekkefølgen, og
// bredde/høyde leses fra en `metadata.json` per serie (skjelettene trenger
// forholdet før bildet er lastet).

export type Photo = {
  src: string;
  w: number;
  h: number;
};

export type Serie = {
  id: string;
  nr: string;
  title: string;
  meta: string;
  note: string;
  cover: Photo | null;
  photos: Photo[];
};

export type Video = {
  id: string;
  title: string;
  meta: string;
  note: string;
  yt: string;
};

const p = (file: string, w: number, h: number): Photo => ({
  src: `/photos/${file}`,
  w,
  h,
});

const photos = {
  p1: p("p1.jpg", 1400, 931),
  p2: p("p2.jpg", 933, 1400),
  p3: p("p3.jpg", 1400, 931),
  p4: p("p4.jpg", 1400, 933),
  p5: p("p5.jpg", 1400, 933),
  p6: p("p6.jpg", 1400, 788),
  p7: p("p7.jpg", 1400, 788),
  p8: p("p8.jpg", 1400, 1050),
  p9: p("p9.jpg", 1400, 788),
  p10: p("p10.jpg", 1050, 1400),
};

export const site = {
  navn: "Espen Morild",
  ordmerke: "MORILDINHO",
  tagline: "Fotograf, podcast- og videoprodusent i Bergen.",
  hero: photos.p1,
};

const series: Serie[] = [
  {
    id: "hjelle",
    nr: "01",
    title: "Hjelle",
    meta: "2024",
    note: "Legg inn en kort beskrivelse av serien her.",
    cover: photos.p1,
    photos: [photos.p1, photos.p3, photos.p4, photos.p9],
  },
  {
    id: "loen",
    nr: "02",
    title: "Loen",
    meta: "2024",
    note: "",
    cover: photos.p2,
    photos: [photos.p2, photos.p6, photos.p7],
  },
  {
    id: "bergenfest",
    nr: "03",
    title: "Bergenfest",
    meta: "2025",
    note: "",
    cover: photos.p8,
    photos: [photos.p8, photos.p5, photos.p10],
  },
];

const videos: Video[] = [
  { id: "v1", title: "Oppsig – Premierefest", meta: "", note: "", yt: "9udQOIb7-O0" },
  { id: "v2", title: "Bergenfest 2024 — Dag 2", meta: "", note: "", yt: "6W5WuWFyzXw" },
  { id: "v3", title: "Bergenfest 2024 — Dag 3", meta: "", note: "", yt: "nvyUsYVXDR0" },
];

export async function getSeries(): Promise<Serie[]> {
  return series;
}

export async function getSerie(id: string): Promise<Serie | undefined> {
  return series.find((s) => s.id === id);
}

/** Serier som faktisk har bilder — brukes til "Neste serie"-sløyfen. */
export async function getFilledSeries(): Promise<Serie[]> {
  return series.filter((s) => s.photos.length > 0);
}

export async function getVideos(): Promise<Video[]> {
  return videos;
}

export const om = {
  tittel: "Om Espen Vik Morild",
  lead: "Podcast- og videoprodusent med 25 års erfaring i digital kinoproduksjon og video/lydproduksjon.",
  intro:
    "Jeg er en Bergensbasert medieprodusent med lang fartstid i mediebransjen siden slutten av 90-tallet, og har gjennom årene vært innom alt fra kinoreklame, filmproduksjon og digital distribusjon til TV, podcast, video, livestreaming, arrangementer, nettsider og sosiale medier.",
  tjenester: [
    "Podcastproduksjon (full syklus: opptak, redigering, publisering)",
    "Videoredigering",
    "Lydopptak og redigering",
    "Live streaming",
    "Innhold for sosiale medier",
    "Fotografi",
  ],
  bakgrunn: [
    "Det startet med produksjon av trailere og kinoreklame til skjermer i lobbyer på kinoer i hele Norge, og senere mastring og distribusjon av digitale filmkopier til kinoer over hele Skandinavia etter hvert som filmindustrien gikk fra analog til digital. Underveis har jeg også jobbet med TV- og studioproduksjon, live streaming og ulike former for innholdsproduksjon. De siste årene har hovedvekten ligget på podcast, video og digitalt innhold.",
    "I dag jobber jeg som podcast- og videoprodusent hos Fire Media i Bergen. Tidligere drev jeg Mainstream AS, med fokus på podcast- og videoproduksjon, før jeg gikk videre som podcastprodusent i innholdsbyrået Apriil Innhold.",
    "Ifølge mine midt på treet regneferdigheter har jeg etter hvert passert 1000 produserte podcastepisoder. Til daglig jobber jeg blant annet i DaVinci Resolve, Adobe Premiere, Audition og Logic Pro, i tillegg til en rekke verktøy for foto, streaming og digital produksjon.",
    "Når jeg ikke jobber med lyd og bilde, lager jeg gjerne musikk på hobbybasis i kjellerstuen. Jeg bruker også stadig mer tid på AI og nye teknologier, og eksperimenterer med ulike AI-baserte arbeidsflyter. Noen av eksperimentene ender til og med opp som faktiske prosjekter.",
  ],
  verktoy: [
    {
      gruppe: "Programvare — foto/video",
      ting: [
        "Adobe Premiere",
        "Adobe Photoshop",
        "Adobe After Effects",
        "Adobe Lightroom",
        "Davinci Resolve",
        "Final Cut Pro",
      ],
    },
    {
      gruppe: "Programvare — lyd",
      ting: ["Logic Pro X", "Pro Tools", "Adobe Audition", "Maschine"],
    },
    {
      gruppe: "Streaming",
      ting: [
        "OBS Studio",
        "Switcher Studio",
        "MS Teams / Zoom etc.",
        "Vimeo",
        "Blackmagic ATEM videoswitchere",
      ],
    },
  ],
};
