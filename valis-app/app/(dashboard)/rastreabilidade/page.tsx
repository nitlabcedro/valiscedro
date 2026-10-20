"use client";

import { useEffect, useRef, useState, type FormEvent, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineCheck,
  HiOutlineBookOpen,
  HiOutlineBeaker,
  HiOutlineBars3,
} from "react-icons/hi2";
import s from "@/styles/shared.module.css";
import { apiGet, apiSend, mensagemErro } from "@/lib/api";
import { useList } from "@/lib/use-list";
import { useCatalogos } from "@/lib/use-catalogos";
import { cargoLabel, exibirErroTotal, formatDate, situacaoLote } from "@/lib/format";
import { classeSituacao } from "@/lib/badges";
import Erro from "@/components/Erro";
import Pager from "@/components/Pager";
import CatalogSelect from "@/components/CatalogSelect";
import { useAuth } from "@/components/AuthProvider/AuthProvider";
import { cargoDe } from "@/lib/acesso";
import { TIPOS_MATERIAL, type RastreabilidadeDetalhe, type RastreabilidadeGrupo, type RastreabilidadeLista, type RastreabilidadeNoGrupo, type TipoMaterial } from "@/lib/types";

function rotulo(valor: unknown) {
  if (typeof valor === "string" || typeof valor === "number") return String(valor);
  if (valor && typeof valor === "object" && "nome" in valor) {
    const nome = (valor as { nome?: unknown }).nome;
    if (typeof nome === "string") return nome;
  }
  return "";
}

function lotesDoRegistro(valor: unknown): RastreabilidadeNoGrupo["lotes"] {
  if (!Array.isArray(valor)) return [];
  return valor.flatMap((lote) => {
    if (!lote || typeof lote !== "object") return [];
    const item = lote as Record<string, unknown>;
    return [{
      equipamento: rotulo(item.equipamento),
      numero: rotulo(item.numero) || "—",
      abertura: typeof item.abertura === "string" ? item.abertura : "",
      validade: typeof item.validade === "string" ? item.validade : "",
      fechamento: typeof item.fechamento === "string" ? item.fechamento : null,
    }];
  });
}

function ehGrupo(item: RastreabilidadeGrupo | RastreabilidadeLista): item is RastreabilidadeGrupo {
  return "rastreabilidades" in item && Array.isArray(item.rastreabilidades);
}

type AcaoMenu = {
  rotulo: string;
  icone: ReactNode;
  onClick: () => void;
  perigo?: boolean;
};

function MenuAcoes({ acoes }: { acoes: AcaoMenu[] }) {
  const [aberto, setAberto] = useState(false);
  const [posicao, setPosicao] = useState({ top: 0, left: 0 });
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function aoClicar(evento: MouseEvent) {
      if (!raiz.current?.contains(evento.target as Node)) setAberto(false);
    }
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAberto(false);
    }
    function aoRolar() {
      setAberto(false);
    }
    document.addEventListener("mousedown", aoClicar);
    document.addEventListener("keydown", aoTeclar);
    window.addEventListener("scroll", aoRolar, true);
    return () => {
      document.removeEventListener("mousedown", aoClicar);
      document.removeEventListener("keydown", aoTeclar);
      window.removeEventListener("scroll", aoRolar, true);
    };
  }, [aberto]);

  function alternar(evento: ReactMouseEvent<HTMLButtonElement>) {
    const retangulo = evento.currentTarget.getBoundingClientRect();
    const largura = 188;
    const altura = acoes.length * 36 + 12;
    const abaixo = retangulo.bottom + 6 + altura <= window.innerHeight;
    setPosicao({
      top: abaixo ? retangulo.bottom + 6 : Math.max(8, retangulo.top - altura - 6),
      left: Math.max(8, Math.min(retangulo.right - largura, window.innerWidth - largura - 8)),
    });
    setAberto((atual) => !atual);
  }

  return (
    <div ref={raiz}>
      <button type="button" className={s.iconBtn} aria-label="Ações" aria-expanded={aberto} aria-haspopup="menu" onClick={alternar}>
        <HiOutlineBars3 size={18} />
      </button>
      {aberto && (
        <div className={s.acaoMenu} role="menu" style={{ top: posicao.top, left: posicao.left }}>
          {acoes.map((acao) => (
            <button
              key={acao.rotulo}
              type="button"
              role="menuitem"
              className={acao.perigo ? s.acaoItemPerigo : s.acaoItem}
              onClick={() => {
                setAberto(false);
                acao.onClick();
              }}
            >
              {acao.icone}
              {acao.rotulo}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function acoesDoRegistro(
  podeValidar: boolean,
  acoes: {
    validar: () => void;
    detalhe: () => void;
    editar: () => void;
    excluir: () => void;
    finalizar: () => void;
    abertura: () => void;
  },
): AcaoMenu[] {
  return [
    ...(podeValidar ? [{ rotulo: "Validar", icone: <HiOutlineBeaker />, onClick: acoes.validar }] : []),
    { rotulo: "Ver detalhes", icone: <HiOutlineEye />, onClick: acoes.detalhe },
    { rotulo: "Editar", icone: <HiOutlinePencilSquare />, onClick: acoes.editar },
    { rotulo: "Finalizar", icone: <HiOutlineCheck />, onClick: acoes.finalizar },
    { rotulo: "Abertura", icone: <HiOutlineBookOpen />, onClick: acoes.abertura },
    { rotulo: "Excluir", icone: <HiOutlineTrash />, onClick: acoes.excluir, perigo: true },
  ];
}

function GrupoAnalito({
  grupo,
  erro,
  podeValidar,
  onValidar,
  onDetalhe,
  onEditar,
  onExcluir,
  onFinalizar,
  onAbertura,
}: {
  grupo: RastreabilidadeGrupo;
  erro: string;
  podeValidar: boolean;
  onValidar: (id: string) => void;
  onDetalhe: (id: string) => void;
  onEditar: (id: string) => void;
  onExcluir: (id: string) => void;
  onFinalizar: (item: RastreabilidadeNoGrupo) => void;
  onAbertura: (item: RastreabilidadeNoGrupo) => void;
}) {
  return (
    <>
      <tr className={s.groupRow}>
        <td colSpan={8}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span className={s.badgeGreen}>{rotulo(grupo.analito) || "Sem analito"}</span>
            {erro ? <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Erro total {erro}</span> : null}
          </div>
        </td>
      </tr>
      {(grupo.rastreabilidades ?? []).map((r) => {
        const lotes = lotesDoRegistro(r.lotes);
        return (
        <tr
          key={r.id}
          onClick={podeValidar ? () => onValidar(r.id) : undefined}
          style={podeValidar ? { cursor: "pointer" } : undefined}
          title={podeValidar ? "Abrir validação" : undefined}
        >
          <td style={{ fontWeight: 600 }}>{rotulo(r.codigo)}</td>
          <td>{rotulo(r.nto)}</td>
          <td>{rotulo(r.setor)}</td>
          <td>{rotulo(r.tipoMaterial)}</td>
          <td>{rotulo(r.fabricante)}</td>
          <td>
            <div style={{ fontWeight: 600 }}>{rotulo(r.numero) || lotes[0]?.numero || "—"}</div>
            <div>{formatDate(r.validade || lotes[0]?.validade)}</div>
          </td>
          <td>
            {lotes.length === 0 && "—"}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {lotes.map((lote) => {
                const situacao = situacaoLote(lote);
                return (
                  <div key={`${r.id}-${lote.equipamento}-${lote.abertura}`}>
                    <span style={{ fontWeight: 600 }}>{lote.equipamento || "—"}</span>
                    {" · "}
                    {formatDate(lote.abertura)}
                    {" "}
                    <span className={classeSituacao(situacao)}>{situacao}</span>
                  </div>
                );
              })}
            </div>
          </td>
          <td onClick={(e) => e.stopPropagation()}>
            <MenuAcoes
              acoes={acoesDoRegistro(podeValidar, {
                validar: () => onValidar(r.id),
                detalhe: () => onDetalhe(r.id),
                editar: () => onEditar(r.id),
                excluir: () => onExcluir(r.id),
                finalizar: () => onFinalizar(r),
                abertura: () => onAbertura(r),
              })}
            />
          </td>
        </tr>
        );
      })}
    </>
  );
}

const formVazio = {
  ntoId: "",
  setorId: "",
  equipamentoId: "",
  tipoMaterial: "" as TipoMaterial | "",
  fabricanteId: "",
  analitoId: "",
  numero: "",
  validade: "",
  abertura: "",
  responsavelAbertura: "",
};

export default function RastreabilidadePage() {
  const router = useRouter();
  const { usuario } = useAuth();
  const cargo = cargoDe(usuario?.cargo);
  const podeValidar = cargo === "Bioquímico" || cargo === "Coordenador";
  const [filtroAnalito, setFiltroAnalito] = useState("");
  const list = useList<RastreabilidadeGrupo | RastreabilidadeLista>("/rastreabilidades", undefined, {
    agrupar: "analito",
    analitoId: filtroAnalito || undefined,
  });
  const catalogos = useCatalogos(["equipamentos", "fabricantes", "ntos", "setores", "analitos"]);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [criando, setCriando] = useState(false);
  const [form, setForm] = useState(formVazio);
  const [editando, setEditando] = useState<null | { id: string; codigo: string }>(null);
  const [detalhe, setDetalhe] = useState<RastreabilidadeDetalhe | null>(null);
  const [abertura, setAbertura] = useState<null | {
    id: string;
    codigo: string;
    numero: string;
    validade: string;
    equipamentoId: string;
    data: string;
    responsavel: string;
  }>(null);
  const [finalizar, setFinalizar] = useState<null | {
    id: string;
    codigo: string;
    loteId: string;
    lotes: RastreabilidadeDetalhe["lotes"];
    fechamento: string;
    responsavel: string;
  }>(null);

  function mensagem() {
    return erro || list.erro || catalogos.erro;
  }

  async function carregarDetalhe(id: string) {
    const res = await apiGet<RastreabilidadeDetalhe>(`/rastreabilidades/${id}`);
    return res.data;
  }

  function abrirValidacao(id: string) {
    router.push(`/validacao?rastreabilidade=${encodeURIComponent(id)}`);
  }

  async function verDetalhe(id: string) {
    setErro("");
    try {
      setDetalhe(await carregarDetalhe(id));
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    }
  }

  async function abrirEdicao(id: string) {
    setErro("");
    try {
      const registro = await carregarDetalhe(id);
      setForm({
        ...formVazio,
        ntoId: registro.ntoId,
        setorId: registro.setorId,
        tipoMaterial: registro.tipoMaterial,
        fabricanteId: registro.fabricanteId,
        analitoId: registro.analitoId ?? "",
        numero: registro.numero || registro.lotes.at(-1)?.numero || "",
        validade: registro.validade || registro.lotes.at(-1)?.validade || "",
      });
      setEditando({ id: registro.id, codigo: registro.codigo });
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    }
  }

  async function abrirFinalizar(item: Pick<RastreabilidadeNoGrupo, "id">) {
    setErro("");
    try {
      const registro = await carregarDetalhe(item.id);
      const abertos = registro.lotes.filter((lote) => !lote.fechamento);
      if (abertos.length === 0) {
        setErro("Não há abertura em aberto para finalizar.");
        return;
      }
      setFinalizar({
        id: registro.id,
        codigo: registro.codigo,
        loteId: abertos[0].id,
        lotes: abertos,
        fechamento: "",
        responsavel: usuario?.nome ?? "",
      });
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    }
  }

  async function salvarNovo(e: FormEvent) {
    e.preventDefault();
    if (!form.ntoId || !form.setorId || !form.equipamentoId || !form.tipoMaterial || !form.fabricanteId || !form.analitoId) {
      setErro("Preencha NTO, setor, equipamento, material, fabricante e analito.");
      return;
    }
    if (!form.numero.trim() || !form.validade || !form.abertura || !form.responsavelAbertura.trim()) {
      setErro("Preencha número, validade, abertura e responsável do lote.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      await apiSend("POST", "/rastreabilidades", {
        ntoId: form.ntoId,
        setorId: form.setorId,
        equipamentoId: form.equipamentoId,
        tipoMaterial: form.tipoMaterial,
        fabricanteId: form.fabricanteId,
        analitoId: form.analitoId,
        lote: {
          numero: form.numero.trim(),
          validade: form.validade,
          abertura: form.abertura,
          responsavelAbertura: form.responsavelAbertura.trim(),
        },
      });
      setCriando(false);
      setForm(formVazio);
      list.reload();
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    } finally {
      setSalvando(false);
    }
  }

  async function salvarEdicao(e: FormEvent) {
    e.preventDefault();
    if (!editando) return;
    if (!form.ntoId || !form.setorId || !form.tipoMaterial || !form.fabricanteId || !form.analitoId) {
      setErro("Preencha NTO, setor, material, fabricante e analito.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      await apiSend("PATCH", `/rastreabilidades/${editando.id}`, {
        ntoId: form.ntoId,
        setorId: form.setorId,
        tipoMaterial: form.tipoMaterial,
        fabricanteId: form.fabricanteId,
        analitoId: form.analitoId,
      });
      setEditando(null);
      list.reload();
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    } finally {
      setSalvando(false);
    }
  }

  async function abrirAbertura(id: string) {
    setErro("");
    try {
      const registro = await carregarDetalhe(id);
      const lote = registro.lotes.at(-1);
      const numero = registro.numero || lote?.numero || "";
      const validade = registro.validade || lote?.validade || "";
      if (!numero || !validade) {
        setErro("Este registro não tem lote e validade para uma nova abertura.");
        return;
      }
      setAbertura({
        id: registro.id,
        codigo: registro.codigo,
        numero,
        validade,
        equipamentoId: "",
        data: "",
        responsavel: usuario?.nome ?? "",
      });
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    }
  }

  async function salvarAbertura(e: FormEvent) {
    e.preventDefault();
    if (!abertura) return;
    if (!abertura.equipamentoId || !abertura.data || !abertura.responsavel.trim()) {
      setErro("Escolha o equipamento, a data de abertura e o responsável.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      await apiSend("POST", `/rastreabilidades/${abertura.id}/lotes`, {
        equipamentoId: abertura.equipamentoId,
        abertura: abertura.data,
        responsavelAbertura: abertura.responsavel.trim(),
      });
      setAbertura(null);
      list.reload();
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    } finally {
      setSalvando(false);
    }
  }

  async function salvarFinalizacao(e: FormEvent) {
    e.preventDefault();
    if (!finalizar) return;
    if (!finalizar.fechamento || !finalizar.responsavel.trim()) {
      setErro("Preencha a data de fechamento e o responsável.");
      return;
    }
    const aberturaLote = finalizar.lotes.find((lote) => lote.id === finalizar.loteId)?.abertura;
    if (aberturaLote && finalizar.fechamento < aberturaLote) {
      setErro("A data de fechamento não pode ser anterior à abertura.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      await apiSend("POST", `/rastreabilidades/${finalizar.id}/lotes/${finalizar.loteId}/finalizar`, {
        fechamento: finalizar.fechamento,
        responsavelFechamento: finalizar.responsavel.trim(),
      });
      setFinalizar(null);
      list.reload();
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: string) {
    if (!window.confirm("Excluir este registro de rastreabilidade?")) return;
    setErro("");
    try {
      await apiSend("DELETE", `/rastreabilidades/${id}`);
      list.reload();
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    }
  }

  const modalAberto = criando || editando || abertura || finalizar;

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <h1>Rastreabilidade</h1>
          <p>Gerencie a rastreabilidade de lotes do laboratório</p>
        </div>
        <div className={s.headerActions}>
          <button type="button" className={s.btnPrimary} onClick={() => {
            setErro("");
            setForm({ ...formVazio, responsavelAbertura: usuario?.nome ?? "" });
            setCriando(true);
          }}>
            <HiOutlinePlus /> Novo Registro
          </button>
        </div>
      </div>

      <Erro texto={modalAberto ? "" : mensagem()} />

      <div className={s.card}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
          <div className={s.searchBar} style={{ flex: 1, marginBottom: 0, minWidth: 240 }}>
            <HiOutlineMagnifyingGlass className={s.searchIcon} />
            <input
              placeholder="Pesquisar por ID, equipamento, setor, fabricante, analito..."
              value={list.q}
              onChange={(e) => list.setQ(e.target.value)}
            />
          </div>
          <select
            className={s.formSelect}
            style={{ width: 240 }}
            value={filtroAnalito}
            onChange={(e) => setFiltroAnalito(e.target.value)}
            aria-label="Filtrar por analito"
          >
            <option value="">Todos os analitos</option>
            {catalogos.analitos.map((item) => (
              <option key={item.id} value={item.id}>{item.nome}</option>
            ))}
          </select>
        </div>

        <div className={s.tableWrapper}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>NTO</th>
                <th>Setor</th>
                <th>Material</th>
                <th>Fabricante</th>
                <th>Lote</th>
                <th>Aberturas</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.loading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "32px 16px" }}>Carregando...</td>
                </tr>
              )}
              {!list.loading && list.items.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "32px 16px" }}>Nenhum registro encontrado</td>
                </tr>
              )}
              {!list.loading && list.items.map((item) => {
                if (!ehGrupo(item)) {
                  return (
                    <tr
                      key={item.id}
                      onClick={podeValidar ? () => abrirValidacao(item.id) : undefined}
                      style={podeValidar ? { cursor: "pointer" } : undefined}
                      title={podeValidar ? "Abrir validação" : undefined}
                    >
                      <td style={{ fontWeight: 600 }}>{item.codigo}</td>
                      <td>{item.nto}</td>
                      <td>{item.setor}</td>
                      <td>{item.tipoMaterial}</td>
                      <td>{item.fabricante}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.numero || "—"}</div>
                        <div>{formatDate(item.validade)}</div>
                      </td>
                      <td>
                        <div>{item.equipamento || "—"}</div>
                        {item.analito ? <span className={s.badgeGreen}>{item.analito}</span> : null}
                        {typeof item.lotes === "number" ? <span className={s.badgeBlue} style={{ marginLeft: 8 }}>{item.lotes}</span> : null}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <MenuAcoes
                          acoes={acoesDoRegistro(podeValidar, {
                            validar: () => abrirValidacao(item.id),
                            detalhe: () => verDetalhe(item.id),
                            editar: () => abrirEdicao(item.id),
                            excluir: () => excluir(item.id),
                            finalizar: () => abrirFinalizar(item),
                            abertura: () => abrirAbertura(item.id),
                          })}
                        />
                      </td>
                    </tr>
                  );
                }
                const erro = exibirErroTotal(item.erroTotalPermitido);
                return (
                  <GrupoAnalito
                    key={item.analitoId ?? `sem-analito-${item.analito}`}
                    grupo={item}
                    erro={erro}
                    podeValidar={podeValidar}
                    onValidar={abrirValidacao}
                    onDetalhe={verDetalhe}
                    onEditar={abrirEdicao}
                    onExcluir={excluir}
                    onFinalizar={abrirFinalizar}
                    onAbertura={(registro) => abrirAbertura(registro.id)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
        <Pager page={list.page} pageSize={list.pageSize} total={list.total} onPage={list.setPage} />
      </div>

      {(criando || editando) && (
        <div className={s.modalOverlay} onClick={() => { setCriando(false); setEditando(null); }}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={s.modalTitle}>{editando ? `Editar ${editando.codigo}` : "Nova Rastreabilidade"}</h2>
            <form onSubmit={editando ? salvarEdicao : salvarNovo}>
              <div className={s.formGrid}>
                <CatalogSelect label="NTO Associada" value={form.ntoId} onChange={(ntoId) => setForm({ ...form, ntoId })} items={catalogos.ntos} />
                <CatalogSelect label="Setor" value={form.setorId} onChange={(setorId) => setForm({ ...form, setorId })} items={catalogos.setores} />
                {criando && (
                  <CatalogSelect label="Equipamento" value={form.equipamentoId} onChange={(equipamentoId) => setForm({ ...form, equipamentoId })} items={catalogos.equipamentos} />
                )}
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Tipo de Material</label>
                  <select className={s.formSelect} value={form.tipoMaterial} onChange={(e) => setForm({ ...form, tipoMaterial: e.target.value as TipoMaterial })}>
                    <option value="">Selecione...</option>
                    {TIPOS_MATERIAL.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
                  </select>
                </div>
                <CatalogSelect label="Fabricante" value={form.fabricanteId} onChange={(fabricanteId) => setForm({ ...form, fabricanteId })} items={catalogos.fabricantes} />
                <CatalogSelect label="Analito" value={form.analitoId} onChange={(analitoId) => setForm({ ...form, analitoId })} items={catalogos.analitos} />
              </div>

              {editando && (
                <div className={s.formGrid} style={{ marginTop: 16 }}>
                  <div className={s.formGroup}>
                    <label className={s.formLabel}>Número do Lote</label>
                    <input className={s.formInput} value={form.numero} readOnly />
                  </div>
                  <div className={s.formGroup}>
                    <label className={s.formLabel}>Data de Validade</label>
                    <input className={s.formInput} value={formatDate(form.validade)} readOnly />
                  </div>
                </div>
              )}

              {criando && (
                <>
                  <h3 style={{ fontSize: 14, fontWeight: 600, margin: "24px 0 16px", color: "var(--text-secondary)" }}>Lote</h3>
                  <div className={s.formGrid}>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Número do Lote</label>
                      <input className={s.formInput} placeholder="Ex: LOT-2024-XX" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
                    </div>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Data de Validade</label>
                      <input className={s.formInput} type="date" value={form.validade} onChange={(e) => setForm({ ...form, validade: e.target.value })} />
                    </div>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Data de Abertura</label>
                      <input className={s.formInput} type="date" value={form.abertura} onChange={(e) => setForm({ ...form, abertura: e.target.value })} />
                    </div>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Responsável Abertura</label>
                      <input className={s.formInput} placeholder="Nome do responsável" value={form.responsavelAbertura} onChange={(e) => setForm({ ...form, responsavelAbertura: e.target.value })} />
                    </div>
                  </div>
                </>
              )}

              <Erro texto={erro} />
              <div className={s.formActions}>
                <button type="button" className={s.btnSecondary} onClick={() => { setCriando(false); setEditando(null); }}>Cancelar</button>
                <button type="submit" className={s.btnPrimary} disabled={salvando}>{salvando ? "Salvando..." : "Salvar Registro"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {abertura && (
        <div className={s.modalOverlay} onClick={() => setAbertura(null)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={s.modalTitle}>Abertura — {abertura.codigo}</h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
              Lote e validade permanecem iguais. Informe o equipamento e a nova data.
            </p>
            <form onSubmit={salvarAbertura}>
              <div className={s.formGrid}>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Número do Lote</label>
                  <input className={s.formInput} value={abertura.numero} readOnly />
                </div>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Data de Validade</label>
                  <input className={s.formInput} value={formatDate(abertura.validade)} readOnly />
                </div>
                <CatalogSelect
                  label="Equipamento"
                  value={abertura.equipamentoId}
                  onChange={(equipamentoId) => setAbertura({ ...abertura, equipamentoId })}
                  items={catalogos.equipamentos}
                />
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Data de Abertura</label>
                  <input className={s.formInput} type="date" value={abertura.data} onChange={(e) => setAbertura({ ...abertura, data: e.target.value })} />
                </div>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Responsável Abertura</label>
                  <input className={s.formInput} value={abertura.responsavel} onChange={(e) => setAbertura({ ...abertura, responsavel: e.target.value })} />
                </div>
              </div>
              <Erro texto={erro} />
              <div className={s.formActions}>
                <button type="button" className={s.btnSecondary} onClick={() => setAbertura(null)}>Cancelar</button>
                <button type="submit" className={s.btnPrimary} disabled={salvando}>{salvando ? "Salvando..." : "Registrar abertura"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {finalizar && (
        <div className={s.modalOverlay} onClick={() => setFinalizar(null)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={s.modalTitle}>Finalizar abertura — {finalizar.codigo}</h2>
            <form onSubmit={salvarFinalizacao}>
              <div className={s.formGrid}>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Abertura</label>
                  <select className={s.formSelect} value={finalizar.loteId} onChange={(e) => setFinalizar({ ...finalizar, loteId: e.target.value })}>
                    {finalizar.lotes.map((lote) => (
                      <option key={lote.id} value={lote.id}>{lote.equipamento || "Equipamento"} · {formatDate(lote.abertura)}</option>
                    ))}
                  </select>
                </div>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Data de Fechamento</label>
                  <input
                    className={s.formInput}
                    type="date"
                    min={finalizar.lotes.find((lote) => lote.id === finalizar.loteId)?.abertura || undefined}
                    value={finalizar.fechamento}
                    onChange={(e) => setFinalizar({ ...finalizar, fechamento: e.target.value })} />
                </div>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Responsável Fechamento</label>
                  <input className={s.formInput} value={finalizar.responsavel} onChange={(e) => setFinalizar({ ...finalizar, responsavel: e.target.value })} />
                </div>
              </div>
              <Erro texto={erro} />
              <div className={s.formActions}>
                <button type="button" className={s.btnSecondary} onClick={() => setFinalizar(null)}>Cancelar</button>
                <button type="submit" className={s.btnPrimary} disabled={salvando}>{salvando ? "Salvando..." : "Finalizar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detalhe && (
        <div className={s.modalOverlay} onClick={() => setDetalhe(null)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={s.modalTitle}>Detalhes — {detalhe.codigo}</h2>
            <div className={s.formGrid}>
              <div className={s.formGroup}><span className={s.formLabel}>NTO</span><span>{detalhe.nto}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Setor</span><span>{detalhe.setor}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Material</span><span>{detalhe.tipoMaterial}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Fabricante</span><span>{detalhe.fabricante}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Analito</span><span>{detalhe.analito || "—"}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Lote</span><span>{detalhe.numero || detalhe.lotes[0]?.numero || "—"}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Validade</span><span>{formatDate(detalhe.validade || detalhe.lotes[0]?.validade)}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Criado por</span><span>{detalhe.criadoPor}</span></div>
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "24px 0 12px", color: "var(--text-secondary)" }}>Aberturas ({detalhe.lotes.length})</h3>
            <div className={s.tableWrapper}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Equipamento</th>
                    <th>Abertura</th>
                    <th>Resp. Abertura</th>
                    <th>Fechamento</th>
                    <th>Resp. Fechamento</th>
                    <th>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {detalhe.lotes.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", color: "var(--text-secondary)" }}>Nenhuma abertura</td>
                    </tr>
                  )}
                  {detalhe.lotes.map((lote) => {
                    const situacao = situacaoLote(lote);
                    return (
                      <tr key={lote.id}>
                        <td style={{ fontWeight: 600 }}>{lote.equipamento || "—"}</td>
                        <td>{formatDate(lote.abertura)}</td>
                        <td>{lote.responsavelAbertura || "—"}</td>
                        <td>{lote.fechamento ? formatDate(lote.fechamento) : "—"}</td>
                        <td>{lote.responsavelFechamento || "—"}</td>
                        <td><span className={classeSituacao(situacao)}>{situacao}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "24px 0 12px", color: "var(--text-secondary)" }}>Assinatura</h3>
            {detalhe.assinatura ? (
              <div className={s.formGrid}>
                <div className={s.formGroup}><span className={s.formLabel}>Nome</span><span>{detalhe.assinatura.nome}</span></div>
                <div className={s.formGroup}><span className={s.formLabel}>Cargo</span><span>{cargoLabel(detalhe.assinatura.cargo)}</span></div>
                <div className={s.formGroup}><span className={s.formLabel}>Usuário</span><span>{detalhe.assinatura.usuario}</span></div>
                <div className={s.formGroup}><span className={s.formLabel}>Data</span><span>{formatDate(detalhe.assinatura.data)}</span></div>
              </div>
            ) : (
              <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Sem assinatura</span>
            )}

            <div className={s.formActions}>
              <button type="button" className={s.btnSecondary} onClick={() => setDetalhe(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
