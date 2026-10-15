"use client";

import { useState, type FormEvent } from "react";
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
} from "react-icons/hi2";
import s from "@/styles/shared.module.css";
import { apiGet, apiSend, mensagemErro } from "@/lib/api";
import { useList } from "@/lib/use-list";
import { useCatalogos } from "@/lib/use-catalogos";
import { cargoLabel, formatDate, situacaoLote } from "@/lib/format";
import { classeSituacao } from "@/lib/badges";
import Erro from "@/components/Erro";
import Pager from "@/components/Pager";
import CatalogSelect from "@/components/CatalogSelect";
import { useAuth } from "@/components/AuthProvider/AuthProvider";
import { cargoDe } from "@/lib/acesso";
import { TIPOS_MATERIAL, type RastreabilidadeDetalhe, type RastreabilidadeLista, type TipoMaterial } from "@/lib/types";

const formVazio = {
  ntoId: "",
  setorId: "",
  equipamentoId: "",
  tipoMaterial: "" as TipoMaterial | "",
  fabricanteId: "",
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
  const list = useList<RastreabilidadeLista>("/rastreabilidades");
  const catalogos = useCatalogos(["equipamentos", "fabricantes", "ntos", "setores"]);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [criando, setCriando] = useState(false);
  const [form, setForm] = useState(formVazio);
  const [editando, setEditando] = useState<null | { id: string; codigo: string }>(null);
  const [detalhe, setDetalhe] = useState<RastreabilidadeDetalhe | null>(null);
  const [abertura, setAbertura] = useState<null | { id: string; codigo: string; numero: string; validade: string; data: string; responsavel: string }>(null);
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
        equipamentoId: registro.equipamentoId,
        tipoMaterial: registro.tipoMaterial,
        fabricanteId: registro.fabricanteId,
      });
      setEditando({ id: registro.id, codigo: registro.codigo });
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    }
  }

  async function abrirFinalizar(item: RastreabilidadeLista) {
    setErro("");
    try {
      const registro = await carregarDetalhe(item.id);
      const abertos = registro.lotes.filter((lote) => !lote.fechamento);
      if (abertos.length === 0) {
        setErro("Não há lote aberto para finalizar.");
        return;
      }
      setFinalizar({
        id: registro.id,
        codigo: registro.codigo,
        loteId: abertos[0].id,
        lotes: abertos,
        fechamento: "",
        responsavel: "",
      });
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    }
  }

  async function salvarNovo(e: FormEvent) {
    e.preventDefault();
    if (!form.ntoId || !form.setorId || !form.equipamentoId || !form.tipoMaterial || !form.fabricanteId) {
      setErro("Preencha NTO, setor, equipamento, material e fabricante.");
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
    if (!form.ntoId || !form.setorId || !form.equipamentoId || !form.tipoMaterial || !form.fabricanteId) {
      setErro("Preencha NTO, setor, equipamento, material e fabricante.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      await apiSend("PATCH", `/rastreabilidades/${editando.id}`, {
        ntoId: form.ntoId,
        setorId: form.setorId,
        equipamentoId: form.equipamentoId,
        tipoMaterial: form.tipoMaterial,
        fabricanteId: form.fabricanteId,
      });
      setEditando(null);
      list.reload();
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    } finally {
      setSalvando(false);
    }
  }

  async function salvarAbertura(e: FormEvent) {
    e.preventDefault();
    if (!abertura) return;
    if (!abertura.numero.trim() || !abertura.validade || !abertura.data || !abertura.responsavel.trim()) {
      setErro("Preencha número, validade, abertura e responsável.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      await apiSend("POST", `/rastreabilidades/${abertura.id}/lotes`, {
        numero: abertura.numero.trim(),
        validade: abertura.validade,
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
        <div className={s.searchBar}>
          <HiOutlineMagnifyingGlass className={s.searchIcon} />
          <input
            placeholder="Pesquisar por ID, equipamento, setor, fabricante..."
            value={list.q}
            onChange={(e) => list.setQ(e.target.value)}
          />
        </div>

        <div className={s.tableWrapper}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>NTO</th>
                <th>Setor</th>
                <th>Equipamento</th>
                <th>Material</th>
                <th>Fabricante</th>
                <th>Lotes</th>
                <th>Criado Em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.loading && (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "32px 16px" }}>Carregando...</td>
                </tr>
              )}
              {!list.loading && list.items.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "32px 16px" }}>Nenhum registro encontrado</td>
                </tr>
              )}
              {!list.loading && list.items.map((r) => (
                <tr
                  key={r.id}
                  onClick={podeValidar ? () => abrirValidacao(r.id) : undefined}
                  style={podeValidar ? { cursor: "pointer" } : undefined}
                  title={podeValidar ? "Abrir validação" : undefined}
                >
                  <td style={{ fontWeight: 600 }}>{r.codigo}</td>
                  <td>{r.nto}</td>
                  <td><span className={s.badgePurple}>{r.setor}</span></td>
                  <td>{r.equipamento}</td>
                  <td>{r.tipoMaterial}</td>
                  <td>{r.fabricante}</td>
                  <td><span className={s.badgeBlue}>{r.lotes}</span></td>
                  <td style={{ color: "var(--text-secondary)" }}>{formatDate(r.criadoEm)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {podeValidar && (
                        <button type="button" className={s.iconBtn} title="Validar" onClick={() => abrirValidacao(r.id)}><HiOutlineBeaker /></button>
                      )}
                      <button type="button" className={s.iconBtn} onClick={() => verDetalhe(r.id)} title="Ver detalhes"><HiOutlineEye /></button>
                      <button type="button" className={s.iconBtn} title="Editar" onClick={() => abrirEdicao(r.id)}><HiOutlinePencilSquare /></button>
                      <button type="button" className={s.iconBtn} title="Excluir" onClick={() => excluir(r.id)}><HiOutlineTrash /></button>
                      <button type="button" className={s.iconBtn} title="Finalizar" onClick={() => abrirFinalizar(r)}><HiOutlineCheck /></button>
                      <button type="button" className={s.iconBtn} title="Abertura" onClick={() => {
                        setErro("");
                        setAbertura({
                          id: r.id,
                          codigo: r.codigo,
                          numero: "",
                          validade: "",
                          data: "",
                          responsavel: usuario?.nome ?? "",
                        });
                      }}><HiOutlineBookOpen /></button>
                    </div>
                  </td>
                </tr>
              ))}
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
                <CatalogSelect label="Equipamento" value={form.equipamentoId} onChange={(equipamentoId) => setForm({ ...form, equipamentoId })} items={catalogos.equipamentos} />
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Tipo de Material</label>
                  <select className={s.formSelect} value={form.tipoMaterial} onChange={(e) => setForm({ ...form, tipoMaterial: e.target.value as TipoMaterial })}>
                    <option value="">Selecione...</option>
                    {TIPOS_MATERIAL.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
                  </select>
                </div>
                <CatalogSelect label="Fabricante" value={form.fabricanteId} onChange={(fabricanteId) => setForm({ ...form, fabricanteId })} items={catalogos.fabricantes} />
              </div>

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
            <form onSubmit={salvarAbertura}>
              <div className={s.formGrid}>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Número do Lote</label>
                  <input className={s.formInput} value={abertura.numero} onChange={(e) => setAbertura({ ...abertura, numero: e.target.value })} />
                </div>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Data de Validade</label>
                  <input className={s.formInput} type="date" value={abertura.validade} onChange={(e) => setAbertura({ ...abertura, validade: e.target.value })} />
                </div>
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
            <h2 className={s.modalTitle}>Finalizar lote — {finalizar.codigo}</h2>
            <form onSubmit={salvarFinalizacao}>
              <div className={s.formGrid}>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Lote</label>
                  <select className={s.formSelect} value={finalizar.loteId} onChange={(e) => setFinalizar({ ...finalizar, loteId: e.target.value })}>
                    {finalizar.lotes.map((lote) => (
                      <option key={lote.id} value={lote.id}>{lote.numero}</option>
                    ))}
                  </select>
                </div>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Data de Fechamento</label>
                  <input className={s.formInput} type="date" value={finalizar.fechamento} onChange={(e) => setFinalizar({ ...finalizar, fechamento: e.target.value })} />
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
              <div className={s.formGroup}><span className={s.formLabel}>Equipamento</span><span>{detalhe.equipamento}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Material</span><span>{detalhe.tipoMaterial}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Fabricante</span><span>{detalhe.fabricante}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Criado por</span><span>{detalhe.criadoPor}</span></div>
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "24px 0 12px", color: "var(--text-secondary)" }}>Lotes ({detalhe.lotes.length})</h3>
            <div className={s.tableWrapper}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Lote</th>
                    <th>Validade</th>
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
                      <td colSpan={7} style={{ textAlign: "center", color: "var(--text-secondary)" }}>Nenhum lote</td>
                    </tr>
                  )}
                  {detalhe.lotes.map((lote) => {
                    const situacao = situacaoLote(lote);
                    return (
                      <tr key={lote.id}>
                        <td style={{ fontWeight: 600 }}>{lote.numero}</td>
                        <td>{formatDate(lote.validade)}</td>
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
