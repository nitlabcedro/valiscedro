"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import s from "@/styles/shared.module.css";
import { useList } from "@/lib/use-list";
import { useCatalogos } from "@/lib/use-catalogos";
import { formatDate, rotuloStatus, textoValor } from "@/lib/format";
import { classeSituacao } from "@/lib/badges";
import Erro from "@/components/Erro";
import Pager from "@/components/Pager";
import { TIPOS_CRITERIO, type CadastroTipo, type ResultadoControle } from "@/lib/types";

type Aba = "controles" | "validacoes" | "rastreabilidades";

type Campo =
  | { chave: string; label: string; catalogo: CadastroTipo }
  | { chave: string; label: string; opcoes: readonly string[] };

interface ConfigAba {
  key: Aba;
  label: string;
  campos: Campo[];
}

interface RelatorioControle {
  id: string;
  codigo: string;
  data: string;
  analito: string;
  equipamento: string;
  status: string;
  resultados: ResultadoControle[];
}

interface RelatorioValidacao {
  id: string;
  codigo: string;
  reagente: string;
  equipamento: string;
  fabricante: string;
  tipoCriterio: string;
  situacao: string;
  lote?: string | null;
  analito?: string | null;
  statusControle?: string | null;
  responsavelValidacao?: string | null;
}

interface RelatorioRastreabilidade {
  id: string;
  codigo: string;
  numero?: string | null;
  validade?: string | null;
  analito?: string | null;
  setor: string;
  tipoMaterial: string;
  status?: string | null;
  equipamentos?: string[];
}

type Catalogos = ReturnType<typeof useCatalogos>;
type Filtros = Record<string, string>;

const ANALITO: Campo = { chave: "analitoId", label: "Analito", catalogo: "analitos" };
const EQUIPAMENTO: Campo = { chave: "equipamentoId", label: "Equipamento", catalogo: "equipamentos" };
const FABRICANTE: Campo = { chave: "fabricanteId", label: "Fabricante", catalogo: "fabricantes" };

const ABAS: ConfigAba[] = [
  {
    key: "controles",
    label: "Controles",
    campos: [
      ANALITO,
      EQUIPAMENTO,
      { chave: "status", label: "Status", opcoes: ["Aprovado", "Com rejeição"] },
    ],
  },
  {
    key: "validacoes",
    label: "Validações",
    campos: [
      ANALITO,
      EQUIPAMENTO,
      FABRICANTE,
      { chave: "situacao", label: "Situação", opcoes: ["Em andamento", "Aprovado", "Rejeitado"] },
      { chave: "tipoCriterio", label: "Tipo de Critério", opcoes: TIPOS_CRITERIO },
    ],
  },
  {
    key: "rastreabilidades",
    label: "Rastreabilidades",
    campos: [
      ANALITO,
      EQUIPAMENTO,
      FABRICANTE,
      { chave: "setorId", label: "Setor", catalogo: "setores" },
      { chave: "ntoId", label: "NTO", catalogo: "ntos" },
      { chave: "tipoMaterial", label: "Tipo de Material", opcoes: ["Reagente", "Controle", "Calibrador"] },
    ],
  },
];

function celula(valor: string | null | undefined) {
  return valor ? valor : "—";
}

function Badge({ valor }: { valor: string | null | undefined }) {
  if (!valor) return <>—</>;
  return <span className={classeSituacao(valor)}>{rotuloStatus(valor)}</span>;
}

function FiltroSelect({ campo, value, onChange, catalogos }: { campo: Campo; value: string; onChange: (valor: string) => void; catalogos: Catalogos }) {
  const opcoes = "catalogo" in campo
    ? catalogos[campo.catalogo].map((item) => ({ valor: item.id, texto: item.nome }))
    : campo.opcoes.map((opcao) => ({ valor: opcao, texto: opcao }));
  return (
    <div className={s.formGroup}>
      <label className={s.formLabel}>{campo.label}</label>
      <select className={s.formSelect} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Todos</option>
        {opcoes.map((opcao) => <option key={opcao.valor} value={opcao.valor}>{opcao.texto}</option>)}
      </select>
    </div>
  );
}

function Tabela({ colunas, loading, vazio, children }: { colunas: string[]; loading: boolean; vazio: boolean; children: ReactNode }) {
  const aviso = loading ? "Carregando..." : vazio ? "Nenhum registro encontrado" : "";
  return (
    <div className={s.tableWrapper}>
      <table className={s.table}>
        <thead>
          <tr>{colunas.map((coluna) => <th key={coluna}>{coluna}</th>)}</tr>
        </thead>
        <tbody>
          {aviso ? (
            <tr><td colSpan={colunas.length} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "32px 16px" }}>{aviso}</td></tr>
          ) : children}
        </tbody>
      </table>
    </div>
  );
}

function LinhasControles({ itens }: { itens: RelatorioControle[] }) {
  return itens.map((c) => (
    <tr key={c.id}>
      <td style={{ fontWeight: 600 }}>{c.codigo}</td>
      <td>{formatDate(c.data)}</td>
      <td>{celula(c.analito)}</td>
      <td>{celula(c.equipamento)}</td>
      <td><Badge valor={c.status} /></td>
      <td>
        {[...(c.resultados ?? [])].sort((a, b) => a.ordem - b.ordem).map((r) => (
          <div key={r.ordem} style={{ fontSize: 12, whiteSpace: "nowrap", lineHeight: 1.8 }}>
            R{r.ordem}: <strong>{textoValor(r.valorObtido)}</strong>
            <span style={{ color: "var(--text-secondary)" }}> (ref. {textoValor(r.valorReferencia)})</span>
            {r.status && <> <Badge valor={r.status} /></>}
          </div>
        ))}
      </td>
    </tr>
  ));
}

function LinhasValidacoes({ itens }: { itens: RelatorioValidacao[] }) {
  return itens.map((v) => (
    <tr key={v.id}>
      <td style={{ fontWeight: 600 }}>{v.codigo}</td>
      <td>{celula(v.reagente)}</td>
      <td>{celula(v.equipamento)}</td>
      <td>{celula(v.fabricante)}</td>
      <td>{v.tipoCriterio ? <span className={s.badgePurple}>{v.tipoCriterio}</span> : "—"}</td>
      <td><Badge valor={v.situacao} /></td>
      <td>{celula(v.lote)}</td>
      <td>{celula(v.analito)}</td>
      <td><Badge valor={v.statusControle} /></td>
      <td>{celula(v.responsavelValidacao)}</td>
    </tr>
  ));
}

function LinhasRastreabilidades({ itens }: { itens: RelatorioRastreabilidade[] }) {
  return itens.map((r) => (
    <tr key={r.id}>
      <td style={{ fontWeight: 600 }}>{r.codigo}</td>
      <td>{celula(r.numero)}</td>
      <td>{formatDate(r.validade)}</td>
      <td>{celula(r.analito)}</td>
      <td>{celula(r.setor)}</td>
      <td>{celula(r.tipoMaterial)}</td>
      <td><Badge valor={r.status} /></td>
      <td>{r.equipamentos?.length ? r.equipamentos.join(", ") : "—"}</td>
    </tr>
  ));
}

const COLUNAS: Record<Aba, string[]> = {
  controles: ["Código", "Data", "Analito", "Equipamento", "Status", "Resultados"],
  validacoes: ["Código", "Reagente", "Equipamento", "Fabricante", "Critério", "Situação", "Lote", "Analito", "Status do Controle", "Responsável"],
  rastreabilidades: ["Código", "Lote", "Validade", "Analito", "Setor", "Material", "Status", "Equipamentos"],
};

function Relatorio({ config, catalogos }: { config: ConfigAba; catalogos: Catalogos }) {
  const [rascunho, setRascunho] = useState<Filtros>({});
  const [aplicados, setAplicados] = useState<Filtros>({});
  const query = Object.fromEntries(Object.entries(aplicados).filter(([, valor]) => valor));
  const list = useList<unknown>(`/relatorios/${config.key}`, undefined, query);

  function alterar(chave: string, valor: string) {
    setRascunho((atual) => ({ ...atual, [chave]: valor }));
  }

  function filtrar(e: FormEvent) {
    e.preventDefault();
    setAplicados(rascunho);
  }

  function limpar() {
    setRascunho({});
    setAplicados({});
  }

  const vazio = list.items.length === 0;

  return (
    <>
      <form className={s.card} style={{ marginBottom: 16 }} onSubmit={filtrar}>
        <div className={s.formGrid}>
          <div className={s.formGroup}>
            <label className={s.formLabel}>Data inicial</label>
            <input className={s.formInput} type="date" value={rascunho.dataInicio ?? ""} onChange={(e) => alterar("dataInicio", e.target.value)} />
          </div>
          <div className={s.formGroup}>
            <label className={s.formLabel}>Data final</label>
            <input className={s.formInput} type="date" value={rascunho.dataFim ?? ""} onChange={(e) => alterar("dataFim", e.target.value)} />
          </div>
          {config.campos.map((campo) => (
            <FiltroSelect key={campo.chave} campo={campo} value={rascunho[campo.chave] ?? ""} onChange={(valor) => alterar(campo.chave, valor)} catalogos={catalogos} />
          ))}
        </div>
        <div className={s.formActions}>
          <button type="button" className={s.btnSecondary} onClick={limpar}>Limpar</button>
          <button type="submit" className={s.btnPrimary}>Filtrar</button>
        </div>
      </form>

      <Erro texto={list.erro} />

      <div className={s.card}>
        <Tabela colunas={COLUNAS[config.key]} loading={list.loading} vazio={vazio}>
          {config.key === "controles" && <LinhasControles itens={list.items as RelatorioControle[]} />}
          {config.key === "validacoes" && <LinhasValidacoes itens={list.items as RelatorioValidacao[]} />}
          {config.key === "rastreabilidades" && <LinhasRastreabilidades itens={list.items as RelatorioRastreabilidade[]} />}
        </Tabela>
        <Pager page={list.page} pageSize={list.pageSize} total={list.total} onPage={list.setPage} />
      </div>
    </>
  );
}

export default function RelatoriosPage() {
  const [aba, setAba] = useState<Aba>("controles");
  const catalogos = useCatalogos(["analitos", "equipamentos", "fabricantes", "setores", "ntos"]);
  const config = ABAS.find((item) => item.key === aba) ?? ABAS[0];

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <h1>Relatórios</h1>
          <p>Consulte controles, validações e rastreabilidades com filtros</p>
        </div>
      </div>

      <div className={s.tabs}>
        {ABAS.map((item) => (
          <button key={item.key} type="button" className={aba === item.key ? s.tabActive : s.tab} onClick={() => setAba(item.key)}>
            {item.label}
          </button>
        ))}
      </div>

      <Erro texto={catalogos.erro} />

      <Relatorio key={aba} config={config} catalogos={catalogos} />
    </div>
  );
}
