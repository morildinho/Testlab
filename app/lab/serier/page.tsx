import SerierAdmin from "./serier-admin";

export const metadata = {
  title: "Serier – opplasting",
  robots: { index: false, follow: false },
};

export default function SerierPage() {
  return <SerierAdmin />;
}
