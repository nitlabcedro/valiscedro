"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineEye,
} from "react-icons/hi2";
import s from "@/styles/shared.module.css";
import { apiGet, apiSend, mensagemErro } from "@/lib/api";
import { useList } from "@/lib/use-list";
import { useCatalogos } from "@/lib/use-catalogos";
import {
  dateInput,
  formatDate,
  idPorNome,
  numeroOuTexto,
  opcoesAnalito,
  rotuloStatus,
  textoValor,
  tripleOuUndefined,
  triplePreenchido,
  tripleVazio,
} from "@/lib/format";
import { classeSituacao } from "@/lib/badges";
import Erro from "@/components/Erro";
import Pager from "@/components/Pager";
import CatalogSelect from "@/components/CatalogSelect";
import { TIPOS_CRITERIO, type RastreabilidadeDetalhe, type TipoCriterio, type ValidacaoDetalhe, type ValidacaoLista } from "@/lib/types";

interface ResultadoForm {
  valorReferencia: string;
  erroPermitido: string;
  valorObtido: string;
}

interface FormValidacao {
  equipamentoId: string;
  reagente: string;
  fabricanteId: string;
  tipoCriterio: TipoCriterio | "";
  referencia: string;
  erroTotal: string;
  observacoes: string;
  numero: string;
  validade: string;
  fechamento: [string, string, string];
  preAnalise: [string, string, string];
  posAnalise: [string, string, string];
  situacao: string;
  controleData: string;
  analitoId: string;
  resultados: [ResultadoForm, ResultadoForm, ResultadoForm];
}

function resultadoVazio(): ResultadoForm {
  return { valorReferencia: "", erroPermitido: "", valorObtido: "" };
}

function formVazio(): FormValidacao {
  return {
    equipamentoId: "",
    reagente: "",
    fabricanteId: "",
    tipoCriterio: "",
    referencia: "",
    erroTotal: "",
    observacoes: "",
    numero: "",
    validade: "",
    fechamento: tripleVazio(),
    preAnalise: tripleVazio(),
    posAnalise: tripleVazio(),
    situacao: "Em andamento",
    controleData: "",
    analitoId: "",
    resultados: [resultadoVazio(), resultadoVazio(), resultadoVazio()],
  };
}

function celula(valor: string | null | undefined) {
  return valor ? valor : "—";
}

interface OrigemRastreio {
  codigo: string;
  nto: string;
  setor: string;
  tipoMaterial: string;
  analito: string;
  abertura: string;
  responsavel: string;
}

function comAnalito(
  atual: FormValidacao,
  analito: { id?: string; nome?: string; erroTotalPermitido?: string | number } | null | undefined,
) {
  if (!analito) return atual;
  const analitoId = analito.id || atual.analitoId;
  const reagente = analito.nome || atual.reagente;
  const erroTotal = atual.erroTotal || textoValor(analito.erroTotalPermitido);
  const resultados = atual.resultados.map((resultado) => ({
    ...resultado,
    erroPermitido: resultado.erroPermitido || erroTotal,
  })) as FormValidacao["resultados"];
  return { ...atual, analitoId, reagente, erroTotal, resultados };
}

function CampoLeitura({ label, value }: { label: string; value: string }) {
  return (
    <div className={s.formGroup}>
      <label className={s.formLabel}>{label}</label>
      <input className={s.formInput} value={value || "—"} readOnly />
    </div>
  );
}

function ValidacaoConteudo() {
  const router = useRouter();
  const rastreabilidadeId = useSearchParams().get("rastreabilidade");
  const list = useList<ValidacaoLista>("/validacoes");
  const catalogos = useCatalogos(["equipamentos", "fabricantes", "analitos"]);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState<FormValidacao>(formVazio);
  const [modal, setModal] = useState<null | { id?: string; codigo?: string }>(null);
  const [situacaoInicial, setSituacaoInicial] = useState("Em andamento");
  const [nomes, setNomes] = useState({ equipamento: "", fabricante: "" });
  const [detalhe, setDetalhe] = useState<ValidacaoDetalhe | null>(null);
  const [origem, setOrigem] = useState<OrigemRastreio | null>(null);
  const [tentouSalvar, setTentouSalvar] = useState(false);
  const faltando = (vazio: boolean) => (tentouSalvar && vazio) || undefined;

  useEffect(() => {
    if (!rastreabilidadeId) return;
    let cancelado = false;
    setErro("");
    apiGet<RastreabilidadeDetalhe>(`/rastreabilidades/${rastreabilidadeId}`)
      .then((res) => {
        if (cancelado) return;
        const registro = res.data;
        const lotes = registro.lotes ?? [];
        const lote = lotes.find((item) => !item.fechamento) ?? lotes[lotes.length - 1];
        setNomes({ equipamento: lote?.equipamento ?? "", fabricante: registro.fabricante });
        setSituacaoInicial("Em andamento");
        setForm(comAnalito({
          ...formVazio(),
          equipamentoId: lote?.equipamentoId ?? "",
          fabricanteId: registro.fabricanteId,
          numero: registro.numero || lote?.numero || "",
          validade: dateInput(registro.validade || lote?.validade),
        }, {
          id: registro.analitoId,
          nome: registro.analito,
          erroTotalPermitido: registro.erroTotalPermitido,
        }));
        setOrigem({
          codigo: registro.codigo,
          nto: registro.nto,
          setor: registro.setor,
          tipoMaterial: registro.tipoMaterial,
          analito: registro.analito ?? "",
          abertura: lote?.abertura ?? "",
          responsavel: lote?.responsavelAbertura ?? "",
        });
        setModal({});
      })
      .catch((erroCapturado) => {
        if (cancelado) return;
        setErro(mensagemErro(erroCapturado));
      });
    return () => {
      cancelado = true;
    };
  }, [rastreabilidadeId]);

  function fecharModal() {
    setModal(null);
    setOrigem(null);
    setTentouSalvar(false);
    if (rastreabilidadeId) router.replace("/validacao");
  }

  useEffect(() => {
    if (!modal) return;
    setForm((atual) => {
      const equipamentoId = atual.equipamentoId || idPorNome(catalogos.equipamentos, nomes.equipamento);
      const fabricanteId = atual.fabricanteId || idPorNome(catalogos.fabricantes, nomes.fabricante);
      const analitoId = atual.analitoId || idPorNome(catalogos.analitos, atual.reagente);
      const analito = catalogos.analitos.find((item) => item.id === analitoId);
      const proximo = comAnalito(
        { ...atual, equipamentoId, fabricanteId, analitoId },
        analito ? { id: analito.id, nome: analito.nome, erroTotalPermitido: analito.erroTotalPermitido } : null,
      );
      if (
        proximo.equipamentoId === atual.equipamentoId
        && proximo.fabricanteId === atual.fabricanteId
        && proximo.analitoId === atual.analitoId
        && proximo.reagente === atual.reagente
        && proximo.erroTotal === atual.erroTotal
        && proximo.resultados.every((item, indice) => item.erroPermitido === atual.resultados[indice].erroPermitido)
      ) return atual;
      return proximo;
    });
  }, [catalogos.analitos, catalogos.equipamentos, catalogos.fabricantes, modal, nomes]);

  function escolherAnalito(analitoId: string) {
    const analito = catalogos.analitos.find((item) => item.id === analitoId);
    const erro = textoValor(analito?.erroTotalPermitido);
    setForm({
      ...form,
      analitoId,
      reagente: analito?.nome ?? "",
      erroTotal: erro,
      resultados: form.resultados.map((resultado) => ({ ...resultado, erroPermitido: erro })) as FormValidacao["resultados"],
    });
  }

  function atualizarTriplo(campo: "fechamento" | "preAnalise" | "posAnalise", indice: number, valor: string) {
    const proximo = [...form[campo]] as [string, string, string];
    proximo[indice] = valor;
    setForm({ ...form, [campo]: proximo });
  }

  function atualizarResultado(indice: number, campo: keyof ResultadoForm, valor: string) {
    const resultados = form.resultados.map((item, i) => (i === indice ? { ...item, [campo]: valor } : item)) as FormValidacao["resultados"];
    setForm({ ...form, resultados });
  }

  async function verDetalhe(id: string) {
    setErro("");
    try {
      const res = await apiGet<ValidacaoDetalhe>(`/validacoes/${id}`);
      setDetalhe(res.data);
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    }
  }

  async function abrirEdicao(id: string) {
    setErro("");
    try {
      const res = await apiGet<ValidacaoDetalhe>(`/validacoes/${id}`);
      const registro = res.data;
      const lote = registro.lotes?.[0];
      setNomes({ equipamento: registro.equipamento, fabricante: registro.fabricante });
      setSituacaoInicial(lote?.situacao || registro.situacao || "Em andamento");
      setForm({
        ...formVazio(),
        equipamentoId: idPorNome(catalogos.equipamentos, registro.equipamento, registro.equipamentoId),
        reagente: registro.reagente,
        fabricanteId: idPorNome(catalogos.fabricantes, registro.fabricante, registro.fabricanteId),
        tipoCriterio: (registro.tipoCriterio as TipoCriterio) || "",
        referencia: registro.referencia ?? "",
        erroTotal: textoValor(registro.erroTotal),
        observacoes: registro.observacoes ?? "",
        numero: lote?.numero ?? "",
        validade: dateInput(lote?.validade),
        fechamento: triplePreenchido(lote?.fechamento),
        preAnalise: triplePreenchido(lote?.preAnalise),
        posAnalise: triplePreenchido(lote?.posAnalise),
        situacao: lote?.situacao || registro.situacao || "Em andamento",
        controleData: dateInput(registro.controle?.data),
        analitoId: registro.controle?.analitoId ?? "",
        resultados: [0, 1, 2].map((indice) => {
          const resultado = registro.controle?.resultados?.find((item) => item.ordem === indice + 1);
          return {
            valorReferencia: textoValor(resultado?.valorReferencia),
            erroPermitido: textoValor(resultado?.erroPermitido),
            valorObtido: textoValor(resultado?.valorObtido),
          };
        }) as FormValidacao["resultados"],
      });
      setModal({ id: registro.id, codigo: registro.codigo });
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    }
  }

  function resultadosPayload() {
    return form.resultados.map((resultado, indice) => ({
      ordem: (indice + 1) as 1 | 2 | 3,
      valorReferencia: numeroOuTexto(resultado.valorReferencia),
      erroPermitido: numeroOuTexto(resultado.erroPermitido),
      valorObtido: numeroOuTexto(resultado.valorObtido),
    }));
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setTentouSalvar(true);
    if (!form.equipamentoId || !form.reagente.trim() || !form.fabricanteId || !form.tipoCriterio || !form.referencia.trim() || !form.erroTotal.trim()) {
      setErro("Preencha equipamento, analito, fabricante, critério, referência e erro total.");
      return;
    }

    setSalvando(true);
    setErro("");
    try {
      if (!modal?.id) {
        if (!form.numero.trim() || !form.validade) {
          setErro("Preencha o número e a validade do lote.");
          setSalvando(false);
          return;
        }
        if (!form.controleData || !form.analitoId || form.resultados.some((item) => !item.valorReferencia.trim() || !item.erroPermitido.trim() || !item.valorObtido.trim())) {
          setErro("Preencha a data, o analito e os três resultados.");
          setSalvando(false);
          return;
        }
        await apiSend("POST", "/validacoes", {
          equipamentoId: form.equipamentoId,
          reagente: form.reagente.trim(),
          fabricanteId: form.fabricanteId,
          tipoCriterio: form.tipoCriterio,
          referencia: form.referencia.trim(),
          erroTotal: numeroOuTexto(form.erroTotal),
          ...(form.observacoes.trim() ? { observacoes: form.observacoes.trim() } : {}),
          lote: {
            numero: form.numero.trim(),
            validade: form.validade,
          },
          controle: {
            data: form.controleData,
            analitoId: form.analitoId,
            resultados: resultadosPayload(),
          },
        });
      } else {
        const lote: Record<string, unknown> = {};
        if (form.validade) lote.validade = form.validade;
        const fechamento = tripleOuUndefined(form.fechamento);
        const preAnalise = tripleOuUndefined(form.preAnalise);
        const posAnalise = tripleOuUndefined(form.posAnalise);
        if (fechamento) lote.fechamento = fechamento;
        if (preAnalise) lote.preAnalise = preAnalise;
        if (posAnalise) lote.posAnalise = posAnalise;
        if ((form.situacao === "Aprovado" || form.situacao === "Rejeitado") && form.situacao !== situacaoInicial) {
          lote.situacao = form.situacao;
        }
        await apiSend("PATCH", `/validacoes/${modal.id}`, {
          equipamentoId: form.equipamentoId,
          reagente: form.reagente.trim(),
          fabricanteId: form.fabricanteId,
          tipoCriterio: form.tipoCriterio,
          referencia: form.referencia.trim(),
          erroTotal: numeroOuTexto(form.erroTotal),
          ...(form.observacoes.trim() ? { observacoes: form.observacoes.trim() } : {}),
          ...(Object.keys(lote).length > 0 ? { lote } : {}),
        });
      }
      fecharModal();
      list.reload();
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: string) {
    if (!window.confirm("Excluir esta validação? O controle criado junto também será removido.")) return;
    setErro("");
    try {
      await apiSend("DELETE", `/validacoes/${id}`);
      list.reload();
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    }
  }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <h1>Validação de Lotes</h1>
          <p>Registre e acompanhe as validações de reagentes e analitos</p>
        </div>
        <div className={s.headerActions}>
          <button type="button" className={s.btnPrimary} onClick={() => { setErro(""); setForm(formVazio()); setNomes({ equipamento: "", fabricante: "" }); setOrigem(null); setModal({}); if (rastreabilidadeId) router.replace("/validacao"); }}>
            <HiOutlinePlus /> Nova Validação
          </button>
        </div>
      </div>

      <Erro texto={modal ? "" : erro || list.erro || catalogos.erro} />

      <div className={s.card}>
        <div className={s.searchBar}>
          <HiOutlineMagnifyingGlass className={s.searchIcon} />
          <input placeholder="Pesquisar por ID, equipamento, reagente..." value={list.q} onChange={(e) => list.setQ(e.target.value)} />
        </div>

        <div className={s.tableWrapper}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Equipamento</th>
                <th>Reagente</th>
                <th>Fabricante</th>
                <th>Critério</th>
                <th>Erro Total</th>
                <th>Situação</th>
                <th>Criado Em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.loading && (
                <tr><td colSpan={9} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "32px 16px" }}>Carregando...</td></tr>
              )}
              {!list.loading && list.items.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "32px 16px" }}>Nenhuma validação encontrada</td></tr>
              )}
              {!list.loading && list.items.map((v) => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 600 }}>{v.codigo}</td>
                  <td>{v.equipamento}</td>
                  <td>{v.reagente}</td>
                  <td>{v.fabricante}</td>
                  <td><span className={s.badgePurple}>{v.tipoCriterio}</span></td>
                  <td>{textoValor(v.erroTotal)}</td>
                  <td><span className={classeSituacao(v.situacao)}>{v.situacao}</span></td>
                  <td style={{ color: "var(--text-secondary)" }}>{formatDate(v.criadoEm)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button type="button" className={s.iconBtn} onClick={() => verDetalhe(v.id)} title="Ver detalhes"><HiOutlineEye /></button>
                      <button type="button" className={s.iconBtn} title="Editar" onClick={() => abrirEdicao(v.id)}><HiOutlinePencilSquare /></button>
                      <button type="button" className={s.iconBtn} title="Excluir" onClick={() => excluir(v.id)}><HiOutlineTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager page={list.page} pageSize={list.pageSize} total={list.total} onPage={list.setPage} />
      </div>

      {modal && (
        <div className={s.modalOverlay} onClick={fecharModal}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={s.modalTitle}>{modal.id ? `Editar ${modal.codigo}` : "Nova Validação"}</h2>
            <form onSubmit={salvar}>
              {origem && !modal.id && (
                <>
                  <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px", color: "var(--text-secondary)" }}>Rastreabilidade {origem.codigo}</h3>
                  <div className={s.formGrid}>
                    <CampoLeitura label="NTO" value={origem.nto} />
                    <CampoLeitura label="Setor" value={origem.setor} />
                    <CampoLeitura label="Material" value={origem.tipoMaterial} />
                    <CampoLeitura label="Analito" value={origem.analito} />
                    <CampoLeitura label="Data de abertura" value={origem.abertura ? formatDate(origem.abertura) : ""} />
                    <CampoLeitura label="Responsável pela abertura" value={origem.responsavel} />
                  </div>
                </>
              )}
              <div className={s.formGrid}>
                <CatalogSelect label="Equipamento" value={form.equipamentoId} onChange={(equipamentoId) => setForm({ ...form, equipamentoId })} items={catalogos.equipamentos} invalid={faltando(!form.equipamentoId)} />
                <CatalogSelect
                  label="Analito"
                  value={form.analitoId}
                  onChange={escolherAnalito}
                  items={opcoesAnalito(catalogos.analitos, form.analitoId ? { id: form.analitoId, nome: form.reagente, erroTotalPermitido: form.erroTotal } : null)}
                  invalid={faltando(!form.reagente.trim() || (!modal.id && !form.analitoId))}
                />
                <CatalogSelect label="Fabricante" value={form.fabricanteId} onChange={(fabricanteId) => setForm({ ...form, fabricanteId })} items={catalogos.fabricantes} invalid={faltando(!form.fabricanteId)} />
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Tipo de Critério</label>
                  <select className={s.formSelect} value={form.tipoCriterio} aria-invalid={faltando(!form.tipoCriterio)} onChange={(e) => setForm({ ...form, tipoCriterio: e.target.value as TipoCriterio })}>
                    <option value="">Selecione...</option>
                    {TIPOS_CRITERIO.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
                  </select>
                </div>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Referência</label>
                  <input className={s.formInput} placeholder="Ex: CLIA / RiliBAK" value={form.referencia} aria-invalid={faltando(!form.referencia.trim())} onChange={(e) => setForm({ ...form, referencia: e.target.value })} />
                </div>
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Erro Total Permitido</label>
                  <input className={s.formInput} value={form.erroTotal} readOnly placeholder="Selecione o analito" aria-invalid={faltando(!form.erroTotal.trim())} />
                </div>
              </div>

              {!modal.id && (
                <>
                  <h3 style={{ fontSize: 14, fontWeight: 600, margin: "24px 0 16px", color: "var(--text-secondary)" }}>Lote</h3>
                  <div className={s.formGrid}>
                    <div className={s.formGroup}><label className={s.formLabel}>Número do Lote</label><input className={s.formInput} placeholder="Ex: VL-2024-XX" value={form.numero} aria-invalid={faltando(!form.numero.trim())} onChange={(e) => setForm({ ...form, numero: e.target.value })} /></div>
                    <div className={s.formGroup}><label className={s.formLabel}>Data de Validade</label><input className={s.formInput} type="date" value={form.validade} aria-invalid={faltando(!form.validade)} onChange={(e) => setForm({ ...form, validade: e.target.value })} /></div>
                  </div>
                </>
              )}

              {modal.id && (
                <>
                  <h3 style={{ fontSize: 14, fontWeight: 600, margin: "24px 0 16px", color: "var(--text-secondary)" }}>Lote {form.numero}</h3>
                  <div className={s.formGrid}>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Data de Validade</label>
                      <input className={s.formInput} type="date" value={form.validade} onChange={(e) => setForm({ ...form, validade: e.target.value })} />
                    </div>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Situação</label>
                      <select className={s.formSelect} value={form.situacao} onChange={(e) => setForm({ ...form, situacao: e.target.value })}>
                        <option value="Em andamento">Em andamento</option>
                        <option value="Aprovado">Aprovado</option>
                        <option value="Rejeitado">Rejeitado</option>
                      </select>
                    </div>
                  </div>
                  {(["fechamento", "preAnalise", "posAnalise"] as const).map((campo) => (
                    <div key={campo}>
                      <h4 style={{ fontSize: 13, fontWeight: 600, margin: "20px 0 12px", color: "var(--text-secondary)" }}>
                        {campo === "fechamento" ? "Fechamento" : campo === "preAnalise" ? "Pré-análise" : "Pós-análise"}
                      </h4>
                      <div className={s.formGrid}>
                        {form[campo].map((valor, indice) => (
                          <div className={s.formGroup} key={`${campo}-${indice}`}>
                            <label className={s.formLabel}>R{indice + 1}</label>
                            <input className={s.formInput} value={valor} onChange={(e) => atualizarTriplo(campo, indice, e.target.value)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {!modal.id && (
                <>
                  <h3 style={{ fontSize: 14, fontWeight: 600, margin: "24px 0 16px", color: "var(--text-secondary)" }}>Validação</h3>
                  <div className={s.formGrid}>
                    <div className={s.formGroup}><label className={s.formLabel}>Data</label><input className={s.formInput} type="date" value={form.controleData} aria-invalid={faltando(!form.controleData)} onChange={(e) => setForm({ ...form, controleData: e.target.value })} /></div>
                  </div>
                  {form.resultados.map((resultado, indice) => (
                    <div key={`resultado-${indice}`}>
                      <h4 style={{ fontSize: 13, fontWeight: 600, margin: "20px 0 12px", color: "var(--text-secondary)" }}>Resultado {indice + 1}</h4>
                      <div className={s.formGrid}>
                        <div className={s.formGroup}><label className={s.formLabel}>Valor de Referência</label><input className={s.formInput} placeholder="Valor" value={resultado.valorReferencia} aria-invalid={faltando(!resultado.valorReferencia.trim())} onChange={(e) => atualizarResultado(indice, "valorReferencia", e.target.value)} /></div>
                        <div className={s.formGroup}><label className={s.formLabel}>Erro Permitido</label><input className={s.formInput} value={resultado.erroPermitido} readOnly placeholder="Vem do erro total" aria-invalid={faltando(!resultado.erroPermitido.trim())} /></div>
                        <div className={s.formGroup}><label className={s.formLabel}>Valor Obtido</label><input className={s.formInput} placeholder="Resultado" value={resultado.valorObtido} aria-invalid={faltando(!resultado.valorObtido.trim())} onChange={(e) => atualizarResultado(indice, "valorObtido", e.target.value)} /></div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              <div className={s.formGroup} style={{ marginTop: 20 }}>
                <label className={s.formLabel}>Observações</label>
                <textarea className={s.formTextarea} placeholder="Observações adicionais..." value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
              </div>

              <Erro texto={erro} />
              <div className={s.formActions}>
                <button type="button" className={s.btnSecondary} onClick={fecharModal}>Cancelar</button>
                <button type="submit" className={s.btnPrimary} disabled={salvando}>{salvando ? "Salvando..." : "Salvar Validação"}</button>
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
              <div className={s.formGroup}><span className={s.formLabel}>Equipamento</span><span>{detalhe.equipamento}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Reagente</span><span>{detalhe.reagente}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Fabricante</span><span>{detalhe.fabricante}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Critério</span><span>{detalhe.tipoCriterio}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Referência</span><span>{detalhe.referencia || "—"}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Erro Total</span><span>{textoValor(detalhe.erroTotal)}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Situação</span><span className={classeSituacao(detalhe.situacao)}>{detalhe.situacao}</span></div>
            </div>
            {detalhe.observacoes && (
              <div className={s.formGroup} style={{ marginTop: 16 }}>
                <span className={s.formLabel}>Observações</span>
                <span>{detalhe.observacoes}</span>
              </div>
            )}

            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "24px 0 12px", color: "var(--text-secondary)" }}>Resultados do Lote</h3>
            {detalhe.lotes?.length ? detalhe.lotes.map((lote) => (
              <div key={lote.numero} className={s.card} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontWeight: 600 }}>{lote.numero}</span>
                  <span className={classeSituacao(lote.situacao)}>{lote.situacao}</span>
                </div>
                <div className={s.tableWrapper}>
                  <table className={s.table}>
                    <thead>
                      <tr><th>Fase</th><th>R1</th><th>R2</th><th>R3</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>Abertura</td><td>{celula(lote.abertura?.[0])}</td><td>{celula(lote.abertura?.[1])}</td><td>{celula(lote.abertura?.[2])}</td></tr>
                      <tr><td>Fechamento</td><td>{celula(lote.fechamento?.[0])}</td><td>{celula(lote.fechamento?.[1])}</td><td>{celula(lote.fechamento?.[2])}</td></tr>
                      <tr><td>Pré-análise</td><td>{celula(lote.preAnalise?.[0])}</td><td>{celula(lote.preAnalise?.[1])}</td><td>{celula(lote.preAnalise?.[2])}</td></tr>
                      <tr><td>Pós-análise</td><td>{celula(lote.posAnalise?.[0])}</td><td>{celula(lote.posAnalise?.[1])}</td><td>{celula(lote.posAnalise?.[2])}</td></tr>
                    </tbody>
                  </table>
                </div>
                {lote.responsavelValidacao && (
                  <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-secondary)" }}>
                    Validado por <strong style={{ color: "var(--text-primary)" }}>{lote.responsavelValidacao}</strong> em {formatDate(lote.dataValidacao)}
                  </div>
                )}
              </div>
            )) : (
              <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Nenhum lote</span>
            )}

            {detalhe.controle && (
              <>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: "24px 0 12px", color: "var(--text-secondary)" }}>Validação</h3>
                <div className={s.formGrid}>
                  <div className={s.formGroup}><span className={s.formLabel}>Data</span><span>{formatDate(detalhe.controle.data)}</span></div>
                  {detalhe.controle.analito && (
                    <div className={s.formGroup}><span className={s.formLabel}>Analito</span><span>{detalhe.controle.analito}</span></div>
                  )}
                  {detalhe.controle.erroTotalPermitido && (
                    <div className={s.formGroup}><span className={s.formLabel}>Erro total permitido</span><span>{detalhe.controle.erroTotalPermitido}</span></div>
                  )}
                  {detalhe.controle.status && (
                    <div className={s.formGroup}><span className={s.formLabel}>Status</span><span>{detalhe.controle.status}</span></div>
                  )}
                </div>
                <div className={s.tableWrapper} style={{ marginTop: 12 }}>
                  <table className={s.table}>
                    <thead>
                      <tr>
                        <th>Resultado</th>
                        <th>Referência</th>
                        <th>Erro Perm.</th>
                        <th>Valor Obtido</th>
                        {detalhe.controle.resultados.some((item) => item.status) && <th>Status</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {detalhe.controle.resultados.map((resultado) => (
                        <tr key={resultado.ordem}>
                          <td>Resultado {resultado.ordem}</td>
                          <td>{textoValor(resultado.valorReferencia)}</td>
                          <td>{textoValor(resultado.erroPermitido)}</td>
                          <td>{textoValor(resultado.valorObtido)}</td>
                          {detalhe.controle?.resultados.some((item) => item.status) && (
                            <td>{resultado.status ? rotuloStatus(resultado.status) : "—"}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
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

export default function ValidacaoPage() {
  return (
    <Suspense fallback={<div className={s.page}>Carregando...</div>}>
      <ValidacaoConteudo />
    </Suspense>
  );
}
