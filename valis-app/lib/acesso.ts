import type { Cargo } from "@/lib/types";

const CARGOS_GESTAO: Cargo[] = ["Coordenador"];

const ROTAS: { prefixo: string; cargos: Cargo[] }[] = [
  { prefixo: "/rastreabilidade", cargos: ["Técnico"] },
  { prefixo: "/validacao", cargos: ["Bioquímico"] },
  { prefixo: "/conclusao", cargos: ["Bioquímico"] },
  { prefixo: "/dashboard", cargos: CARGOS_GESTAO },
  { prefixo: "/cadastros", cargos: CARGOS_GESTAO },
  { prefixo: "/usuarios", cargos: CARGOS_GESTAO },
  { prefixo: "/perfil", cargos: ["Técnico", "Bioquímico", "Coordenador"] },
];

export function cargoDe(cargo: string | undefined | null): Cargo | null {
  const normalizado = (cargo ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
  if (normalizado === "tecnico") return "Técnico";
  if (normalizado === "bioquimico") return "Bioquímico";
  if (normalizado === "coordenador" || normalizado === "administrador" || normalizado === "admin" || normalizado === "adm") {
    return "Coordenador";
  }
  return null;
}

export function podeAcessar(cargo: string | undefined | null, pathname: string) {
  const atual = cargoDe(cargo);
  if (!atual) return false;
  const regra = ROTAS.find((item) => pathname === item.prefixo || pathname.startsWith(`${item.prefixo}/`));
  if (!regra) return false;
  return regra.cargos.includes(atual);
}

export function rotaInicial(cargo: string | undefined | null) {
  const atual = cargoDe(cargo);
  if (atual === "Técnico") return "/rastreabilidade";
  if (atual === "Bioquímico") return "/validacao";
  return "/dashboard";
}
