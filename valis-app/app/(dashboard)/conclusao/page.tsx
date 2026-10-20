"use client";

import { useState, type FormEvent } from "react";
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from "react-icons/hi2";
import s from "@/styles/shared.module.css";
import { apiGet, apiSend, mensagemErro } from "@/lib/api";
import { useList } from "@/lib/use-list";
import { useCatalogos } from "@/lib/use-catalogos";
import { dateInput, formatDate, numeroOuTexto, opcoesAnalito, rotuloStatus, textoValor } from "@/lib/format";
import { classeSituacao } from "@/lib/badges";
import Erro from "@/components/Erro";
import Pager from "@/components/Pager";
import CatalogSelect from "@/components/CatalogSelect";
import type { ControleValidacao } from "@/lib/types";

interface ResultadoForm {
  valorReferencia: string;
  erroPermitido: string;
  valorObtido: string;
}

interface FormControle {
  data: string;
  equipamentoId: string;
  analitoId: string;
  analitoNome: string;
  erroTotalPermitido: string;
  observacoes: string;
  resultados: [ResultadoForm, ResultadoForm, ResultadoForm];
}

function resultadoVazio(): ResultadoForm {
  return { valorReferencia: "", erroPermitido: "", valorObtido: "" };
}

function formVazio(): FormControle {
  return {
    data: "",
    equipamentoId: "",
    analitoId: "",
    analitoNome: "",
    erroTotalPermitido: "",
    observacoes: "",
    resultados: [resultadoVazio(), resultadoVazio(), resultadoVazio()],
  };
}

function doRegistro(item: ControleValidacao): FormControle {
  return {
    data: dateInput(item.data),
    equipamentoId: item.equipamentoId,
    analitoId: item.analitoId ?? "",
    analitoNome: item.analito ?? "",
    erroTotalPermitido: textoValor(item.erroTotalPermitido),
    observacoes: item.observacoes ?? "",
    resultados: [1, 2, 3].map((ordem) => {
      const resultado = item.resultados.find((atual) => atual.ordem === ordem);
      return {
        valorReferencia: textoValor(resultado?.valorReferencia),
        erroPermitido: textoValor(resultado?.erroPermitido),
        valorObtido: textoValor(resultado?.valorObtido),
      };
    }) as FormControle["resultados"],
  };
}

export default function ConclusaoPage() {
  const list = useList<ControleValidacao>("/controles-validacao");
  const catalogos = useCatalogos(["equipamentos", "analitos"]);
  const [form, setForm] = useState<FormControle>(formVazio);
  const [editId, setEditId] = useState<string | null>(null);
  const [codigo, setCodigo] = useState("");
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  function atualizarResultado(indice: number, campo: keyof ResultadoForm, valor: string) {
    const resultados = form.resultados.map((item, i) => (i === indice ? { ...item, [campo]: valor } : item)) as FormControle["resultados"];
    setForm({ ...form, resultados });
  }

  function abrirNovo() {
    setErro("");
    setEditId(null);
    setCodigo("");
    setForm(formVazio());
    setAberto(true);
  }

  async function abrirEdicao(id: string) {
    setErro("");
    try {
      const res = await apiGet<ControleValidacao>(`/controles-validacao/${id}`);
      setEditId(res.data.id);
      setCodigo(res.data.codigo);
      setForm(doRegistro(res.data));
      setAberto(true);
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    }
  }

  function payload() {
    return {
      data: form.data,
      equipamentoId: form.equipamentoId,
      analitoId: form.analitoId,
      ...(editId || form.observacoes.trim() ? { observacoes: form.observacoes.trim() } : {}),
      resultados: form.resultados.map((resultado, indice) => ({
        ordem: (indice + 1) as 1 | 2 | 3,
        valorReferencia: numeroOuTexto(resultado.valorReferencia),
        erroPermitido: numeroOuTexto(resultado.erroPermitido),
        valorObtido: numeroOuTexto(resultado.valorObtido),
      })),
    };
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!form.data || !form.equipamentoId || !form.analitoId) {
      setErro("Preencha data, equipamento e analito.");
      return;
    }
    if (form.resultados.some((item) => !item.valorReferencia.trim() || !item.erroPermitido.trim() || !item.valorObtido.trim())) {
      setErro("Preencha os três resultados.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      if (editId) {
        await apiSend("PATCH", `/controles-validacao/${editId}`, payload());
      } else {
        await apiSend("POST", "/controles-validacao", payload());
      }
      setAberto(false);
      list.reload();
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: string) {
    if (!window.confirm("Excluir este controle de validação?")) return;
    setErro("");
    try {
      await apiSend("DELETE", `/controles-validacao/${id}`);
      list.reload();
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    }
  }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <h1>Controle de Validação</h1>
          <p>Registre e monitore os controles de validação por resultado</p>
        </div>
        <div className={s.headerActions}>
          <button type="button" className={s.btnPrimary} onClick={abrirNovo}>
            <HiOutlinePlus /> Novo Controle
          </button>
        </div>
      </div>

      <Erro texto={aberto ? "" : erro || list.erro || catalogos.erro} />

      <div className={s.card}>
        <div className={s.searchBar}>
          <HiOutlineMagnifyingGlass className={s.searchIcon} />
          <input placeholder="Pesquisar por ID, analito, equipamento..." value={list.q} onChange={(e) => list.setQ(e.target.value)} />
        </div>

        {list.loading && (
          <div className={s.emptyState}>
            <div className={s.emptyText}>Carregando...</div>
          </div>
        )}

        {!list.loading && list.items.length === 0 && (
          <div className={s.emptyState}>
            <div className={s.emptyTitle}>Nenhum controle encontrado</div>
            <div className={s.emptyText}>Ainda não há controles de validação cadastrados.</div>
          </div>
        )}

        {!list.loading && list.items.map((c) => (
          <div key={c.id} className={s.card} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{c.codigo} — {c.analito}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                  {c.equipamento}
                  {c.erroTotalPermitido ? ` · Erro total ${c.erroTotalPermitido}` : ""} · {formatDate(c.data)} · por {c.criadoPor}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className={classeSituacao(c.status)}>{c.status}</span>
                <button type="button" className={s.iconBtn} title="Editar" onClick={() => abrirEdicao(c.id)}><HiOutlinePencilSquare /></button>
                <button type="button" className={s.iconBtn} title="Excluir" onClick={() => excluir(c.id)}><HiOutlineTrash /></button>
              </div>
            </div>

            <div className={s.tableWrapper}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Resultado</th>
                    <th>Referência</th>
                    <th>Erro Perm.</th>
                    <th>Valor Obtido</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...c.resultados].sort((a, b) => a.ordem - b.ordem).map((n) => (
                    <tr key={n.ordem}>
                      <td style={{ fontWeight: 500 }}>Resultado {n.ordem}</td>
                      <td>{textoValor(n.valorReferencia)}</td>
                      <td>{textoValor(n.erroPermitido)}</td>
                      <td style={{ fontWeight: 600 }}>{textoValor(n.valorObtido)}</td>
                      <td>
                        {n.status ? (
                          <span className={classeSituacao(n.status)} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            {n.status === "aprovado" ? <HiOutlineCheckCircle /> : <HiOutlineXCircle />}
                            {rotuloStatus(n.status)}
                          </span>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {c.observacoes && (
              <div style={{ marginTop: 12, fontSize: 12, color: "var(--accent-yellow)", fontWeight: 500 }}>
                ⚠ {c.observacoes}
              </div>
            )}
          </div>
        ))}
        <Pager page={list.page} pageSize={list.pageSize} total={list.total} onPage={list.setPage} />
      </div>

      {aberto && (
        <div className={s.modalOverlay} onClick={() => setAberto(false)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={s.modalTitle}>{editId ? `Editar ${codigo}` : "Novo Controle de Validação"}</h2>
            <form onSubmit={salvar}>
              <div className={s.formGrid}>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Data</label>
                  <input className={s.formInput} type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
                </div>
                <CatalogSelect label="Equipamento" value={form.equipamentoId} onChange={(equipamentoId) => setForm({ ...form, equipamentoId })} items={catalogos.equipamentos} />
                <CatalogSelect
                  label="Analito"
                  value={form.analitoId}
                  onChange={(analitoId) => {
                    const analito = catalogos.analitos.find((item) => item.id === analitoId);
                    const erro = textoValor(analito?.erroTotalPermitido);
                    setForm({
                      ...form,
                      analitoId,
                      analitoNome: analito?.nome ?? "",
                      erroTotalPermitido: erro,
                      resultados: form.resultados.map((resultado) => ({ ...resultado, erroPermitido: erro })) as FormControle["resultados"],
                    });
                  }}
                  items={opcoesAnalito(catalogos.analitos, { id: form.analitoId, nome: form.analitoNome, erroTotalPermitido: form.erroTotalPermitido })}
                />
              </div>

              {form.resultados.map((resultado, indice) => (
                <div key={`resultado-${indice}`}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, margin: "20px 0 12px", color: "var(--text-secondary)" }}>Resultado {indice + 1}</h3>
                  <div className={s.formGrid}>
                    <div className={s.formGroup}><label className={s.formLabel}>Valor de Referência</label><input className={s.formInput} placeholder="Valor" value={resultado.valorReferencia} onChange={(e) => atualizarResultado(indice, "valorReferencia", e.target.value)} /></div>
                    <div className={s.formGroup}><label className={s.formLabel}>Erro Permitido</label><input className={s.formInput} value={resultado.erroPermitido} readOnly placeholder="Vem do erro total" /></div>
                    <div className={s.formGroup}><label className={s.formLabel}>Valor Obtido</label><input className={s.formInput} placeholder="Resultado" value={resultado.valorObtido} onChange={(e) => atualizarResultado(indice, "valorObtido", e.target.value)} /></div>
                  </div>
                </div>
              ))}

              <div className={s.formGroup} style={{ marginTop: 20 }}>
                <label className={s.formLabel}>Observações</label>
                <textarea className={s.formTextarea} placeholder="Observações..." value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
              </div>

              <Erro texto={erro} />
              <div className={s.formActions}>
                <button type="button" className={s.btnSecondary} onClick={() => setAberto(false)}>Cancelar</button>
                <button type="submit" className={s.btnPrimary} disabled={salvando}>{salvando ? "Salvando..." : "Salvar Controle"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
