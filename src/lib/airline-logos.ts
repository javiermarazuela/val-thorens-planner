import aa from "@/assets/airlines/aa.png";
import ac from "@/assets/airlines/ac.png";
import af from "@/assets/airlines/af.png";
import ba from "@/assets/airlines/ba.png";
import dl from "@/assets/airlines/dl.png";
import ei from "@/assets/airlines/ei.png";
import ib from "@/assets/airlines/ib.png";
import kl from "@/assets/airlines/kl.png";
import lx from "@/assets/airlines/lx.png";
import tp from "@/assets/airlines/tp.png";
import u2 from "@/assets/airlines/u2.png";
import ua from "@/assets/airlines/ua.png";

// Add a file in src/assets/airlines and a line in each map below for every new
// airline. Anything without a logo shows a plain plane tile instead.
const logos = {
  aa: { src: aa, name: "American" },
  ac: { src: ac, name: "Air Canada" },
  af: { src: af, name: "Air France" },
  ba: { src: ba, name: "British Airways" },
  dl: { src: dl, name: "Delta" },
  ei: { src: ei, name: "Aer Lingus" },
  ib: { src: ib, name: "Iberia" },
  kl: { src: kl, name: "KLM" },
  lx: { src: lx, name: "Swiss" },
  tp: { src: tp, name: "TAP Air Portugal" },
  u2: { src: u2, name: "easyJet" },
  ua: { src: ua, name: "United" },
};

// By the airline's name, as the committee's list writes it ("United / Swiss"
// counts as United: the first one is who you book with).
const byName: Record<string, keyof typeof logos> = {
  "aer lingus": "ei",
  american: "aa",
  "air canada": "ac",
  "air france": "af",
  "british airways": "ba",
  delta: "dl",
  easyjet: "u2",
  iberia: "ib",
  klm: "kl",
  swiss: "lx",
  "tap air portugal": "tp",
  "tap portugal": "tp",
  united: "ua",
};

// By the two-letter code that starts a flight number (LX2802 -> Swiss). Used
// when we have no name, or one we don't know, such as an API lookup.
const byPrefix: Record<string, keyof typeof logos> = {
  AA: "aa",
  EI: "ei",
  AC: "ac",
  AF: "af",
  BA: "ba",
  DL: "dl",
  IB: "ib",
  KL: "kl",
  LX: "lx",
  TP: "tp",
  U2: "u2",
  UA: "ua",
};

export type LogoDirection = "arrival" | "departure";

/**
 * The flight code that touches Geneva in "LX17 + LX2802": the last leg coming
 * in, the first leg going out.
 */
export function genevaLegCode(number: string, direction: LogoDirection): string {
  const legs = number
    .split("+")
    .map((leg) => leg.trim())
    .filter(Boolean);
  return ((direction === "arrival" ? legs[legs.length - 1] : legs[0]) ?? "").toUpperCase();
}

export function airlineLogo(number: string, direction: LogoDirection, airline?: string) {
  const name = (airline ?? "").split("/")[0]!.trim().toLowerCase();
  const prefix = genevaLegCode(number, direction).slice(0, 2);
  // A name from the committee's list wins and is never second-guessed by the
  // code ("American" selling a BA flight must not show BA). The code is only
  // for flights we have no name for.
  const key = name ? byName[name] : byPrefix[prefix];
  return { known: !!(name || prefix), logo: key ? logos[key] : undefined };
}
