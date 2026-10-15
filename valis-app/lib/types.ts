export const CARGOS = ["Técnico", "Bioquímico", "Coordenador"] as const;
export type Cargo = (typeof CARGOS)[number];

export const TIPOS_MATERIAL = ["Reagente", "Controle", "Calibrador"] as const;
export type TipoMaterial = (typeof TIPOS_MATERIAL)[number];

export const TIPOS_CRITERIO = [
  "Especificação analítica",
  "Concordância clínica",
  "Outro critério",
] as const;
export type TipoCriterio = (typeof TIPOS_CRITERIO)[number];

export type CadastroTipo = "equipamentos" | "fabricantes" | "ntos" | "setores" | "analitos";

export interface Usuario {
  id: string;
  codigo: string;
  nome: string;
  email: string;
  cargo: Cargo;
}

export interface UsuarioLista extends Usuario {
  criadoEm: string;
}

export interface CatalogoItem {
  id: string;
  codigo: string;
  nome: string;
  criadoEm: string;
  criadoPor: string;
  erroTotalPermitido?: string | number;
}

export interface LoteRastreabilidade {
  id: string;
  numero: string;
  validade: string;
  abertura: string;
  responsavelAbertura: string;
  fechamento: string | null;
  responsavelFechamento: string | null;
}

export interface Assinatura {
  nome: string;
  cargo: string;
  usuario: string;
  data: string;
}

export interface RastreabilidadeLista {
  id: string;
  codigo: string;
  nto: string;
  setor: string;
  equipamento: string;
  tipoMaterial: string;
  fabricante: string;
  lotes: number;
  criadoEm: string;
  criadoPor: string;
}

export interface RastreabilidadeDetalhe {
  id: string;
  codigo: string;
  ntoId: string;
  nto: string;
  setorId: string;
  setor: string;
  equipamentoId: string;
  equipamento: string;
  tipoMaterial: TipoMaterial;
  fabricanteId: string;
  fabricante: string;
  criadoEm: string;
  criadoPor: string;
  lotes: LoteRastreabilidade[];
  assinatura: Assinatura | null;
}

export interface ResultadoControle {
  ordem: 1 | 2 | 3;
  valorReferencia: string | number;
  erroPermitido: string | number;
  valorObtido: string | number;
  status?: "aprovado" | "rejeitado";
}

export interface LoteValidacao {
  id?: string;
  numero: string;
  validade: string;
  abertura: [string, string, string] | null;
  fechamento: [string, string, string] | null;
  preAnalise: [string, string, string] | null;
  posAnalise: [string, string, string] | null;
  situacao: "Em andamento" | "Aprovado" | "Rejeitado" | string;
  validado?: boolean;
  responsavelValidacao?: string | null;
  dataValidacao?: string | null;
}

export interface ControleAninhado {
  data: string;
  analitoId?: string;
  analito?: string;
  erroTotalPermitido?: string | number;
  loteControle: string;
  resultados: ResultadoControle[];
  status?: "Aprovado" | "Com rejeição" | string;
}

export interface ValidacaoLista {
  id: string;
  codigo: string;
  equipamento: string;
  reagente: string;
  fabricante: string;
  tipoCriterio: string;
  erroTotal: string | number;
  situacao: "Em andamento" | "Aprovado" | "Rejeitado";
  criadoEm: string;
  criadoPor: string;
}

export interface ValidacaoDetalhe extends ValidacaoLista {
  equipamentoId?: string;
  fabricanteId?: string;
  referencia?: string;
  observacoes?: string | null;
  lotes: LoteValidacao[];
  controle?: ControleAninhado | null;
}

export interface ControleValidacao {
  id: string;
  codigo: string;
  data: string;
  equipamentoId: string;
  equipamento: string;
  analitoId: string;
  analito: string;
  erroTotalPermitido?: string | number;
  loteControle: string;
  observacoes?: string | null;
  criadoEm: string;
  criadoPor: string;
  validacaoId?: string | null;
  status: "Aprovado" | "Com rejeição";
  resultados: ResultadoControle[];
}

export interface DashboardDados {
  totais: {
    rastreabilidades: number;
    validacoes: number;
    usuariosAtivos: number;
    lotesVencidos: number;
  };
  lotes: {
    abertos: number;
    fechados: number;
    vencidos: number;
    proximoVencimento: number;
  };
  ultimos7Dias: {
    dia: string;
    rastreabilidade: number;
    validacao: number;
    controleValidacao: number;
  }[];
  notificacoes: {
    tipo: "danger" | "warning" | "info";
    titulo: string;
    quando: string;
  }[];
  atividades: {
    id: string;
    tipo: "Rastreabilidade" | "Validação" | "Controle de Validação";
    usuario: string;
    data: string;
    status: string;
  }[];
}
