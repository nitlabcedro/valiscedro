"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineTrash,
  HiOutlineEye,
} from "react-icons/hi2";
import s from "@/styles/shared.module.css";
import { ApiError, apiGet, apiSend, mensagemErro } from "@/lib/api";
import { useList } from "@/lib/use-list";
import { useCatalogos } from "@/lib/use-catalogos";
import {
  dateInput,
  erroTotalValido,
  formatDate,
  idPorNome,
  numeroOuTexto,
  opcoesAnalito,
  rotuloStatus,
  textoValor,
} from "@/lib/format";
import { classeSituacao } from "@/lib/badges";
import Erro from "@/components/Erro";
import Pager from "@/components/Pager";
import CatalogSelect from "@/components/CatalogSelect";
import MenuAcoes from "@/components/MenuAcoes";
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
    controleData: "",
    analitoId: "",
    resultados: [resultadoVazio(), resultadoVazio(), resultadoVazio()],
  };
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
  analito: { id?: string; nome?: string; erroTotalPermitido?: string | number; referencial?: string | null } | null | undefined,
) {
  if (!analito) return atual;
  const analitoId = analito.id || atual.analitoId;
  const reagente = analito.nome || atual.reagente;
  const referencia = atual.referencia || (analito.referencial ?? "");
  const erroTotal = atual.erroTotal || textoValor(analito.erroTotalPermitido);
  const resultados = atual.resultados.map((resultado) => ({
    ...resultado,
    erroPermitido: resultado.erroPermitido || erroTotal,
  })) as FormValidacao["resultados"];
  return { ...atual, analitoId, reagente, referencia, erroTotal, resultados };
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
  const searchParams = useSearchParams();
  const rastreabilidadeId = searchParams.get("rastreabilidade");
  const validacaoAberta = searchParams.get("id");
  const list = useList<ValidacaoLista>("/validacoes");
  const catalogos = useCatalogos(["equipamentos", "fabricantes", "analitos"]);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState<FormValidacao>(formVazio);
  const [modal, setModal] = useState(false);
  const [nomes, setNomes] = useState({ equipamento: "", fabricante: "" });
  const [detalhe, setDetalhe] = useState<ValidacaoDetalhe | null>(null);
  const [origem, setOrigem] = useState<OrigemRastreio | null>(null);
  const [tentouSalvar, setTentouSalvar] = useState(false);
  const [statusPorId, setStatusPorId] = useState<Record<string, string>>({});
  // Código da validação reprovada que originou o formulário: bloqueia a identificação do lote.
  const [reprovada, setReprovada] = useState<string | null>(null);
  const [decidindo, setDecidindo] = useState(false);
  const faltando = (vazio: boolean) => (tentouSalvar && vazio) || undefined;
  const concordancia = form.tipoCriterio === "Concordância clínica";

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
        setModal(true);
      })
      .catch((erroCapturado) => {
        if (cancelado) return;
        setErro(mensagemErro(erroCapturado));
      });
    return () => {
      cancelado = true;
    };
  }, [rastreabilidadeId]);

  // A listagem não traz o status do controle; ele só vem no detalhe de cada validação.
  useEffect(() => {
    const semStatus = list.items.filter((item) => item.statusControle === undefined);
    if (semStatus.length === 0) return;
    const controller = new AbortController();
    Promise.all(
      semStatus.map((item) =>
        apiGet<ValidacaoDetalhe>(`/validacoes/${item.id}`, undefined, controller.signal)
          .then((res) => [item.id, res.data.controle?.status ?? ""] as const)
          .catch(() => [item.id, ""] as const),
      ),
    ).then((pares) => {
      if (!controller.signal.aborted) setStatusPorId((atual) => ({ ...atual, ...Object.fromEntries(pares) }));
    });
    return () => controller.abort();
  }, [list.items]);

  // Link "Ver validação" vindo do Controle de Validação abre os detalhes direto.
  useEffect(() => {
    if (!validacaoAberta) return;
    let cancelado = false;
    apiGet<ValidacaoDetalhe>(`/validacoes/${validacaoAberta}`)
      .then((res) => {
        if (!cancelado) setDetalhe(res.data);
      })
      .catch((erroCapturado) => {
        if (!cancelado) setErro(mensagemErro(erroCapturado));
      });
    return () => {
      cancelado = true;
    };
  }, [validacaoAberta]);

  function fecharModal() {
    setModal(false);
    setOrigem(null);
    setReprovada(null);
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
        analito ? { id: analito.id, nome: reprovada ? atual.reagente : analito.nome, erroTotalPermitido: analito.erroTotalPermitido, referencial: analito.referencial } : null,
      );
      if (
        proximo.equipamentoId === atual.equipamentoId
        && proximo.fabricanteId === atual.fabricanteId
        && proximo.analitoId === atual.analitoId
        && proximo.reagente === atual.reagente
        && proximo.referencia === atual.referencia
        && proximo.erroTotal === atual.erroTotal
        && proximo.resultados.every((item, indice) => item.erroPermitido === atual.resultados[indice].erroPermitido)
      ) return atual;
      return proximo;
    });
  }, [catalogos.analitos, catalogos.equipamentos, catalogos.fabricantes, modal, nomes, reprovada]);

  function escolherAnalito(analitoId: string) {
    if (reprovada) {
      setForm({ ...form, analitoId });
      return;
    }
    const analito = catalogos.analitos.find((item) => item.id === analitoId);
    const erro = textoValor(analito?.erroTotalPermitido);
    setForm({
      ...form,
      analitoId,
      reagente: analito?.nome ?? "",
      referencia: analito?.referencial ?? "",
      erroTotal: erro,
      resultados: form.resultados.map((resultado) => ({ ...resultado, erroPermitido: erro })) as FormValidacao["resultados"],
    });
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

  async function recarregarDetalhe(id: string) {
    try {
      const res = await apiGet<ValidacaoDetalhe>(`/validacoes/${id}`);
      setDetalhe(res.data);
    } catch {
      /* mantém o registro aberto; a API continua recusando alterações indevidas */
    }
  }

  function fecharDetalhe() {
    setDetalhe(null);
    setErro("");
  }

  async function decidir(situacao: "Aprovado" | "Rejeitado") {
    if (!detalhe) return;
    const aviso = situacao === "Aprovado"
      ? "Depois de aprovada, esta validação não poderá ser alterada nem excluída."
      : "Depois de reprovada, esta decisão não poderá ser desfeita. Para repetir a validação deste lote, use \"Nova validação\".";
    if (!window.confirm(aviso)) return;
    setDecidindo(true);
    setErro("");
    try {
      await apiSend("PATCH", `/validacoes/${detalhe.id}`, { lote: { situacao } });
      await recarregarDetalhe(detalhe.id);
      list.reload();
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
      // Outra pessoa pode ter decidido enquanto a tela estava aberta.
      if (erroCapturado instanceof ApiError && erroCapturado.status === 409) {
        await recarregarDetalhe(detalhe.id);
        list.reload();
      }
    } finally {
      setDecidindo(false);
    }
  }

  function novaDaReprovada(base: ValidacaoDetalhe) {
    const lote = base.lotes?.[base.lotes.length - 1];
    setErro("");
    setTentouSalvar(false);
    setOrigem(null);
    setNomes({ equipamento: base.equipamento, fabricante: base.fabricante });
    setReprovada(base.codigo);
    setForm(comAnalito({
      ...formVazio(),
      equipamentoId: base.equipamentoId ?? "",
      fabricanteId: base.fabricanteId ?? "",
      reagente: base.reagente,
      tipoCriterio: base.tipoCriterio as TipoCriterio,
      referencia: base.referencia ?? "",
      erroTotal: textoValor(base.erroTotal),
      numero: lote?.numero ?? "",
      validade: dateInput(lote?.validade),
    }, { id: base.controle?.analitoId }));
    setDetalhe(null);
    setModal(true);
  }

  function resultadosPayload() {
    return form.resultados
      .map((resultado, indice) => ({
        ordem: (indice + 1) as 1 | 2 | 3,
        valorReferencia: numeroOuTexto(resultado.valorReferencia),
        ...(concordancia ? {} : { erroPermitido: numeroOuTexto(resultado.erroPermitido) }),
        valorObtido: numeroOuTexto(resultado.valorObtido),
      }))
      .filter((_, indice) => {
        const r = form.resultados[indice];
        return r.valorReferencia.trim() && (concordancia || r.erroPermitido.trim()) && r.valorObtido.trim();
      });
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setTentouSalvar(true);
    if (!form.equipamentoId || !form.reagente.trim() || !form.fabricanteId || !form.tipoCriterio || !form.referencia.trim() || !form.erroTotal.trim()) {
      setErro("Preencha equipamento, analito, fabricante, critério, referência e erro total.");
      return;
    }
    if (!erroTotalValido(form.erroTotal)) {
      setErro("Erro total deve ser número ou percentual, como 10, 10,5 ou 10%.");
      return;
    }
    if (!form.numero.trim() || !form.validade) {
      setErro("Preencha o número e a validade do lote.");
      return;
    }
    const r1 = form.resultados[0];
    if (!form.controleData || !form.analitoId || !r1.valorReferencia.trim() || (!concordancia && !r1.erroPermitido.trim()) || !r1.valorObtido.trim()) {
      setErro("Preencha a data, o analito e o primeiro resultado.");
      return;
    }

    setSalvando(true);
    setErro("");
    try {
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
      fecharModal();
      list.reload();
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
      if (erroCapturado instanceof ApiError && erroCapturado.status === 409) list.reload();
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
      if (erroCapturado instanceof ApiError && erroCapturado.status === 409) list.reload();
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
          <button type="button" className={s.btnPrimary} onClick={() => { setErro(""); setForm(formVazio()); setNomes({ equipamento: "", fabricante: "" }); setOrigem(null); setReprovada(null); setModal(true); if (rastreabilidadeId) router.replace("/validacao"); }}>
            <HiOutlinePlus /> Nova Validação
          </button>
        </div>
      </div>

      <Erro texto={modal || detalhe ? "" : erro || list.erro || catalogos.erro} />

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
                <th>Status</th>
                <th>Criado Em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.loading && (
                <tr><td colSpan={10} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "32px 16px" }}>Carregando...</td></tr>
              )}
              {!list.loading && list.items.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "32px 16px" }}>Nenhuma validação encontrada</td></tr>
              )}
              {!list.loading && list.items.map((v) => {
                const statusControle = v.statusControle ?? statusPorId[v.id];
                return (
                <tr key={v.id}>
                  <td style={{ fontWeight: 600 }}>{v.codigo}</td>
                  <td>{v.equipamento}</td>
                  <td>{v.reagente}</td>
                  <td>{v.fabricante}</td>
                  <td><span className={s.badgePurple}>{v.tipoCriterio}</span></td>
                  <td>{textoValor(v.erroTotal)}</td>
                  <td><span className={classeSituacao(v.situacao)}>{v.situacao}</span></td>
                  <td>{statusControle ? <span className={classeSituacao(statusControle)}>{statusControle}</span> : "—"}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{formatDate(v.criadoEm)}</td>
                  <td>
                    <MenuAcoes
                      acoes={[
                        { rotulo: "Ver detalhes", icone: <HiOutlineEye />, onClick: () => verDetalhe(v.id) },
                        ...(v.situacao === "Aprovado" ? [] : [{ rotulo: "Excluir", icone: <HiOutlineTrash />, onClick: () => excluir(v.id), perigo: true }]),
                      ]}
                    />
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pager page={list.page} pageSize={list.pageSize} total={list.total} onPage={list.setPage} />
      </div>

      {modal && (
        <div className={s.modalOverlay} onClick={fecharModal}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={s.modalTitle}>Nova Validação</h2>
            <form onSubmit={salvar}>
              {reprovada && (
                <p style={{ fontSize: 13, margin: "0 0 16px", color: "var(--text-secondary)" }}>
                  Nova corrida do lote reprovado em {reprovada}. Equipamento, analito, fabricante e número do lote ficam bloqueados para manter o vínculo com a reprovação.
                </p>
              )}
              {origem && (
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
                <CatalogSelect label="Equipamento" value={form.equipamentoId} onChange={(equipamentoId) => setForm({ ...form, equipamentoId })} items={catalogos.equipamentos} invalid={faltando(!form.equipamentoId)} disabled={Boolean(reprovada)} />
                <CatalogSelect
                  label="Analito"
                  value={form.analitoId}
                  onChange={escolherAnalito}
                  items={opcoesAnalito(catalogos.analitos, form.analitoId ? { id: form.analitoId, nome: form.reagente, erroTotalPermitido: form.erroTotal } : null)}
                  invalid={faltando(!form.reagente.trim() || !form.analitoId)}
                  disabled={Boolean(reprovada && form.analitoId)}
                />
                <CatalogSelect label="Fabricante" value={form.fabricanteId} onChange={(fabricanteId) => setForm({ ...form, fabricanteId })} items={catalogos.fabricantes} invalid={faltando(!form.fabricanteId)} disabled={Boolean(reprovada)} />
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
                  <input className={s.formInput} value={form.erroTotal} readOnly placeholder="Selecione o analito" aria-invalid={faltando(!erroTotalValido(form.erroTotal))} />
                </div>
              </div>

              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "24px 0 16px", color: "var(--text-secondary)" }}>Lote</h3>
              <div className={s.formGrid}>
                <div className={s.formGroup}><label className={s.formLabel}>Número do Lote</label><input className={s.formInput} placeholder="Ex: VL-2024-XX" value={form.numero} readOnly={Boolean(reprovada)} aria-invalid={faltando(!form.numero.trim())} onChange={(e) => setForm({ ...form, numero: e.target.value })} /></div>
                <div className={s.formGroup}><label className={s.formLabel}>Data de Validade</label><input className={s.formInput} type="date" value={form.validade} aria-invalid={faltando(!form.validade)} onChange={(e) => setForm({ ...form, validade: e.target.value })} /></div>
              </div>

              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "24px 0 16px", color: "var(--text-secondary)" }}>Validação</h3>
              <div className={s.formGrid}>
                <div className={s.formGroup}><label className={s.formLabel}>Data</label><input className={s.formInput} type="date" value={form.controleData} aria-invalid={faltando(!form.controleData)} onChange={(e) => setForm({ ...form, controleData: e.target.value })} /></div>
              </div>
              {form.resultados.map((resultado, indice) => (
                <div key={`resultado-${indice}`}>
                  <h4 style={{ fontSize: 13, fontWeight: 600, margin: "20px 0 12px", color: "var(--text-secondary)" }}>Resultado {indice + 1}</h4>
                  <div className={s.formGrid}>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Valor de Referência</label>
                      {concordancia ? (
                        <select className={s.formSelect} value={resultado.valorReferencia} aria-invalid={indice === 0 ? faltando(!resultado.valorReferencia.trim()) : undefined} onChange={(e) => atualizarResultado(indice, "valorReferencia", e.target.value)}>
                          <option value="">Selecione...</option>
                          <option value="Reagente">Reagente</option>
                          <option value="Não Reagente">Não Reagente</option>
                        </select>
                      ) : (
                        <input className={s.formInput} placeholder="Valor" value={resultado.valorReferencia} aria-invalid={indice === 0 ? faltando(!resultado.valorReferencia.trim()) : undefined} onChange={(e) => atualizarResultado(indice, "valorReferencia", e.target.value)} />
                      )}
                    </div>
                    {!concordancia && (
                      <div className={s.formGroup}><label className={s.formLabel}>Erro Permitido</label><input className={s.formInput} value={resultado.erroPermitido} readOnly placeholder="Vem do erro total" aria-invalid={indice === 0 ? faltando(!resultado.erroPermitido.trim()) : undefined} /></div>
                    )}
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Valor Obtido</label>
                      {concordancia ? (
                        <select className={s.formSelect} value={resultado.valorObtido} aria-invalid={indice === 0 ? faltando(!resultado.valorObtido.trim()) : undefined} onChange={(e) => atualizarResultado(indice, "valorObtido", e.target.value)}>
                          <option value="">Selecione...</option>
                          <option value="Reagente">Reagente</option>
                          <option value="Não Reagente">Não Reagente</option>
                        </select>
                      ) : (
                        <input className={s.formInput} placeholder="Resultado" value={resultado.valorObtido} aria-invalid={indice === 0 ? faltando(!resultado.valorObtido.trim()) : undefined} onChange={(e) => atualizarResultado(indice, "valorObtido", e.target.value)} />
                      )}
                    </div>
                  </div>
                </div>
              ))}

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
        <div className={s.modalOverlay} onClick={fecharDetalhe}>
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

            <Erro texto={erro} />
            <div className={s.formActions}>
              <button type="button" className={s.btnSecondary} onClick={fecharDetalhe}>Fechar</button>
              {detalhe.situacao === "Em andamento" && (
                <>
                  <button type="button" className={s.btnDanger} disabled={decidindo} onClick={() => decidir("Rejeitado")}>Reprovar</button>
                  <button type="button" className={s.btnPrimary} disabled={decidindo} onClick={() => decidir("Aprovado")}>Aprovar</button>
                </>
              )}
              {detalhe.situacao === "Rejeitado" && (
                <button type="button" className={s.btnPrimary} onClick={() => novaDaReprovada(detalhe)}>
                  <HiOutlinePlus /> Nova validação
                </button>
              )}
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
