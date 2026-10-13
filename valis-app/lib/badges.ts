import s from "@/styles/shared.module.css";

export function classeSituacao(situacao: string) {
  switch (situacao) {
    case "Aprovado":
    case "Fechado":
    case "aprovado":
      return s.badgeGreen;
    case "Rejeitado":
    case "Vencido":
    case "Com rejeição":
    case "rejeitado":
      return s.badgeRed;
    case "Em andamento":
    case "Próximo do vencimento":
      return s.badgeYellow;
    case "Aberto":
      return s.badgeBlue;
    case "Coordenador":
      return s.badgePurple;
    case "Bioquímico":
      return s.badgeBlue;
    case "Técnico":
      return s.badgeGreen;
    default:
      return s.badge;
  }
}
