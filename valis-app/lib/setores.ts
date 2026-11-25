import type { IconType } from "react-icons";
import { PiDrop, PiFlask, PiMicroscope } from "react-icons/pi";

export type Setor = { slug: string; nome: string };

// A API diz quais setores existem; o front só define a aparência de cada um.
const VISUAL: Record<string, { icone: IconType; cor: string }> = {
  imuno: { icone: PiFlask, cor: "#1d4ed8" },
  hemato: { icone: PiDrop, cor: "#b91c1c" },
  cito: { icone: PiMicroscope, cor: "#6d28d9" },
};

export function visualDoSetor(slug: string) {
  return VISUAL[slug] ?? { icone: PiFlask, cor: "var(--accent-blue)" };
}

// "/imuno/usuarios/novo" -> "/usuarios/novo"
export function semSetor(pathname: string): string {
  return `/${pathname.split("/").slice(2).join("/")}`;
}
