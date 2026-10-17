import type { CatalogoItem } from "@/lib/types";

export function cargoLabel(cargo: string) {
  return cargo === "Coordenador" ? "Coordenador" : cargo;
}

export function buscaUsuario(q: string) {
  return q.replace(/administrador/gi, "Coordenador");
}

export function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  return partes.map((parte) => parte[0]).join("").slice(0, 2).toUpperCase();
}

export function formatDate(value: string | null | undefined) {
  if (value == null || value === "") return "—";
  const texto = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(texto)) {
    const [ano, mes, dia] = texto.slice(0, 10).split("-");
    return `${dia}/${mes}/${ano}`;
  }
  const data = new Date(texto);
  if (Number.isNaN(data.getTime())) return texto;
  return data.toLocaleDateString("pt-BR");
}

export function formatQuando(value: string) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(value) || value.includes("T")) return formatDate(value);
  return value;
}

export function formatDia(dia: string) {
  if (/^\d{4}-\d{2}-\d{2}/.test(dia)) {
    const [, mes, diaMes] = dia.slice(0, 10).split("-");
    return `${diaMes}/${mes}`;
  }
  return dia;
}

export function dateInput(value: string | null | undefined) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const data = new Date(value);
  if (Number.isNaN(data.getTime())) return "";
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function textoValor(value: string | number | null | undefined) {
  if (value == null) return "";
  return String(value);
}

export function numeroOuTexto(input: string): string | number {
  const texto = input.trim();
  if (!texto || texto.includes("%")) return texto;
  const normalizado = texto.replace(",", ".");
  if (/^-?\d+(\.\d+)?$/.test(normalizado)) return Number(normalizado);
  return texto;
}

export function situacaoLote(lote: { fechamento?: string | null; validade?: string | null }) {
  const fechamento = typeof lote?.fechamento === "string" ? lote.fechamento.trim() : "";
  if (fechamento) return "Fechado";
  const validadeTexto = typeof lote?.validade === "string" ? lote.validade.slice(0, 10) : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(validadeTexto)) return "Aberto";
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const validade = new Date(`${validadeTexto}T00:00:00`);
  const diffDias = Math.round((validade.getTime() - hoje.getTime()) / 86_400_000);
  if (diffDias < 0) return "Vencido";
  if (diffDias <= 7) return "Próximo do vencimento";
  return "Aberto";
}

export function rotuloStatus(status: string) {
  if (status === "aprovado") return "Aprovado";
  if (status === "rejeitado") return "Rejeitado";
  return status;
}

export function tripleVazio(): [string, string, string] {
  return ["", "", ""];
}

export function triplePreenchido(valor: [string, string, string] | null | undefined): [string, string, string] {
  return [valor?.[0] ?? "", valor?.[1] ?? "", valor?.[2] ?? ""];
}

export function tripleOuUndefined(valor: [string, string, string]): [string, string, string] | undefined {
  if (valor.every((item) => !item.trim())) return undefined;
  return [valor[0].trim(), valor[1].trim(), valor[2].trim()];
}

export function digitarErroTotal(valor: string) {
  const limpo = valor.replace(/%/g, "").replace(/\./g, ",").replace(/[^\d,]/g, "");
  const temVirgula = limpo.includes(",");
  const [inteiroBruto, ...resto] = limpo.split(",");
  let inteiro = inteiroBruto.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 3);
  if (!temVirgula) return inteiro;
  if (!inteiro) inteiro = "0";
  const decimal = resto.join("").replace(/\D/g, "").slice(0, 2);
  return `${inteiro},${decimal}`;
}

export function numeroErroTotal(valor: string | number | null | undefined) {
  if (valor == null || valor === "") return "";
  return digitarErroTotal(String(valor)).replace(/,$/, "");
}

export function erroTotalParaSalvar(valor: string) {
  const numero = numeroErroTotal(valor);
  if (!/^\d{1,3}(?:,\d{1,2})?$/.test(numero)) return "";
  return `${numero}%`;
}

export function exibirErroTotal(valor: string | number | null | undefined) {
  const numero = numeroErroTotal(valor);
  return numero ? `${numero}%` : "";
}

export function rotuloAnalito(item: { nome: string; erroTotalPermitido?: string | number }) {
  const erro = exibirErroTotal(item.erroTotalPermitido);
  return erro ? `${item.nome} (${erro})` : item.nome;
}

export function opcoesAnalito(
  items: CatalogoItem[],
  atual?: { id: string; nome: string; erroTotalPermitido?: string | number } | null,
) {
  const opcoes = items.map((item) => ({ ...item, nome: rotuloAnalito(item) }));
  if (atual?.id && atual.nome && !items.some((item) => item.id === atual.id)) {
    opcoes.unshift({
      id: atual.id,
      codigo: "",
      nome: rotuloAnalito(atual),
      criadoEm: "",
      criadoPor: "",
      erroTotalPermitido: atual.erroTotalPermitido,
    });
  }
  return opcoes;
}

export function emailValido(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function idPorNome(items: { id: string; nome: string }[], nome: string, id?: string) {
  if (id) return id;
  return items.find((item) => item.nome === nome)?.id ?? "";
}
