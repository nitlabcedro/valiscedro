"use client";

import { useState } from "react";
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineEye,
} from "react-icons/hi2";
import s from "@/styles/shared.module.css";

interface LoteValidacao {
  numero: string;
  validade: string;
  abertura: [string, string, string];
  fechamento: [string, string, string];
  preAnalise: [string, string, string];
  posAnalise: [string, string, string];
  situacao: string;
  validado: boolean;
  respValidacao: string;
  dataValidacao: string;
}

interface Validacao {
  id: string;
  equipamento: string;
  reagente: string;
  fabricante: string;
  tipoCriterio: string;
  detalhes: string;
  referencia: string;
  erroTotal: string;
  observacoes: string;
  lotes: LoteValidacao[];
  criadoEm: string;
  criadoPor: string;
}

const mockData: Validacao[] = [
  {
    id: "VLD-0001",
    equipamento: "Analisador AU680",
    reagente: "Glicose",
    fabricante: "Beckman Coulter",
    tipoCriterio: "Especificação analítica",
    detalhes: "Critério baseado em variação biológica",
    referencia: "CLIA / RiliBAK",
    erroTotal: "10%",
    observacoes: "",
    lotes: [
      { numero: "VL-2024-01", validade: "2026-12-31", abertura: ["95", "97", "96"], fechamento: ["94", "96", "95"], preAnalise: ["93", "95", "94"], posAnalise: ["96", "97", "96"], situacao: "Aprovado", validado: true, respValidacao: "André P.", dataValidacao: "2026-08-20" },
    ],
    criadoEm: "2026-06-01",
    criadoPor: "André P.",
  },
  {
    id: "VLD-0002",
    equipamento: "Sysmex XN-1000",
    reagente: "Hemoglobina",
    fabricante: "Sysmex",
    tipoCriterio: "Concordância clínica",
    detalhes: "Comparação com método de referência",
    referencia: "ICSH",
    erroTotal: "5%",
    observacoes: "Atenção ao nível 3",
    lotes: [
      { numero: "VL-2024-02", validade: "2026-10-15", abertura: ["14.2", "14.5", "14.3"], fechamento: ["", "", ""], preAnalise: ["14.1", "14.4", "14.2"], posAnalise: ["", "", ""], situacao: "Em andamento", validado: false, respValidacao: "", dataValidacao: "" },
    ],
    criadoEm: "2026-07-10",
    criadoPor: "Maria S.",
  },
  {
    id: "VLD-0003",
    equipamento: "Architect i2000",
    reagente: "TSH",
    fabricante: "Abbott",
    tipoCriterio: "Outro critério",
    detalhes: "Critério interno do laboratório",
    referencia: "Protocolo interno",
    erroTotal: "15%",
    observacoes: "Validação rejeitada — repetir análise",
    lotes: [
      { numero: "VL-2024-03", validade: "2026-09-30", abertura: ["2.1", "2.3", "2.0"], fechamento: ["3.5", "3.8", "3.6"], preAnalise: ["2.2", "2.1", "2.3"], posAnalise: ["3.6", "3.9", "3.7"], situacao: "Rejeitado", validado: false, respValidacao: "Carlos R.", dataValidacao: "2026-08-22" },
    ],
    criadoEm: "2026-08-15",
    criadoPor: "Carlos R.",
  },
];

function getSituacaoBadge(sit: string) {
  switch (sit) {
    case "Aprovado": return s.badgeGreen;
    case "Rejeitado": return s.badgeRed;
    case "Em andamento": return s.badgeYellow;
    default: return s.badgeBlue;
  }
}

export default function ValidacaoPage() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<Validacao | null>(null);

  const filtered = mockData.filter(
    (v) =>
      v.id.toLowerCase().includes(search.toLowerCase()) ||
      v.equipamento.toLowerCase().includes(search.toLowerCase()) ||
      v.reagente.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <h1>Validação de Lotes</h1>
          <p>Registre e acompanhe as validações de reagentes e analitos</p>
        </div>
        <div className={s.headerActions}>
          <button className={s.btnPrimary} onClick={() => setShowModal(true)}>
            <HiOutlinePlus /> Nova Validação
          </button>
        </div>
      </div>

      <div className={s.card}>
        <div className={s.searchBar}>
          <HiOutlineMagnifyingGlass className={s.searchIcon} />
          <input placeholder="Pesquisar por ID, equipamento, reagente..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
              {filtered.map((v) => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 600 }}>{v.id}</td>
                  <td>{v.equipamento}</td>
                  <td>{v.reagente}</td>
                  <td>{v.fabricante}</td>
                  <td><span className={s.badgePurple}>{v.tipoCriterio}</span></td>
                  <td>{v.erroTotal}</td>
                  <td><span className={getSituacaoBadge(v.lotes[0]?.situacao || "")}>{v.lotes[0]?.situacao}</span></td>
                  <td style={{ color: "var(--text-secondary)" }}>{v.criadoEm}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className={s.iconBtn} onClick={() => setShowDetail(v)} title="Ver detalhes"><HiOutlineEye /></button>
                      <button className={s.iconBtn} title="Editar"><HiOutlinePencilSquare /></button>
                      <button className={s.iconBtn} title="Excluir"><HiOutlineTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className={s.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={s.modalTitle}>Nova Validação</h2>
            <div className={s.formGrid}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Equipamento</label>
                <select className={s.formSelect}><option>Selecione...</option><option>Analisador AU680</option><option>Sysmex XN-1000</option><option>Architect i2000</option></select>
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Reagente / Analito</label>
                <input className={s.formInput} placeholder="Ex: Glicose" />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Fabricante</label>
                <select className={s.formSelect}><option>Selecione...</option><option>Beckman Coulter</option><option>Sysmex</option><option>Abbott</option></select>
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Tipo de Critério</label>
                <select className={s.formSelect}><option>Selecione...</option><option>Especificação analítica</option><option>Concordância clínica</option><option>Outro critério</option></select>
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Referência</label>
                <input className={s.formInput} placeholder="Ex: CLIA / RiliBAK" />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Erro Total Permitido</label>
                <input className={s.formInput} placeholder="Ex: 10%" />
              </div>
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "24px 0 16px", color: "var(--text-secondary)" }}>Lote</h3>
            <div className={s.formGrid}>
              <div className={s.formGroup}><label className={s.formLabel}>Número do Lote</label><input className={s.formInput} placeholder="Ex: VL-2024-XX" /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Data de Validade</label><input className={s.formInput} type="date" /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Abertura 1</label><input className={s.formInput} placeholder="Resultado" /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Abertura 2</label><input className={s.formInput} placeholder="Resultado" /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Abertura 3</label><input className={s.formInput} placeholder="Resultado" /></div>
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "24px 0 16px", color: "var(--text-secondary)" }}>Controle Interno</h3>
            <div className={s.formGrid}>
              <div className={s.formGroup}><label className={s.formLabel}>Data</label><input className={s.formInput} type="date" /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Lote do Controle</label><input className={s.formInput} placeholder="Ex: CTRL-2024-XX" /></div>
            </div>

            {["Nível 1 (Baixo)", "Nível 2 (Normal)", "Nível 3 (Alto)"].map((nivel) => (
              <div key={nivel}>
                <h4 style={{ fontSize: 13, fontWeight: 600, margin: "20px 0 12px", color: "var(--text-secondary)" }}>{nivel}</h4>
                <div className={s.formGrid}>
                  <div className={s.formGroup}><label className={s.formLabel}>Valor de Referência</label><input className={s.formInput} placeholder="Valor" /></div>
                  <div className={s.formGroup}><label className={s.formLabel}>Erro Permitido</label><input className={s.formInput} placeholder="Ex: 10%" /></div>
                  <div className={s.formGroup}><label className={s.formLabel}>Limite Mínimo</label><input className={s.formInput} placeholder="Min" /></div>
                  <div className={s.formGroup}><label className={s.formLabel}>Limite Máximo</label><input className={s.formInput} placeholder="Max" /></div>
                  <div className={s.formGroup}><label className={s.formLabel}>Valor Obtido</label><input className={s.formInput} placeholder="Resultado" /></div>
                </div>
              </div>
            ))}

            <div className={s.formGroup} style={{ marginTop: 20 }}>
              <label className={s.formLabel}>Observações</label>
              <textarea className={s.formTextarea} placeholder="Observações adicionais..." />
            </div>

            <div className={s.formActions}>
              <button className={s.btnSecondary} onClick={() => setShowModal(false)}>Cancelar</button>
              <button className={s.btnPrimary} onClick={() => setShowModal(false)}>Salvar Validação</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className={s.modalOverlay} onClick={() => setShowDetail(null)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={s.modalTitle}>Detalhes — {showDetail.id}</h2>
            <div className={s.formGrid}>
              <div className={s.formGroup}><span className={s.formLabel}>Equipamento</span><span>{showDetail.equipamento}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Reagente</span><span>{showDetail.reagente}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Fabricante</span><span>{showDetail.fabricante}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Critério</span><span>{showDetail.tipoCriterio}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Referência</span><span>{showDetail.referencia}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Erro Total</span><span>{showDetail.erroTotal}</span></div>
            </div>
            {showDetail.observacoes && (
              <div className={s.formGroup} style={{ marginTop: 16 }}>
                <span className={s.formLabel}>Observações</span>
                <span>{showDetail.observacoes}</span>
              </div>
            )}

            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "24px 0 12px", color: "var(--text-secondary)" }}>Resultados do Lote</h3>
            {showDetail.lotes.map((l) => (
              <div key={l.numero} className={s.card} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontWeight: 600 }}>{l.numero}</span>
                  <span className={getSituacaoBadge(l.situacao)}>{l.situacao}</span>
                </div>
                <div className={s.tableWrapper}>
                  <table className={s.table}>
                    <thead>
                      <tr><th>Fase</th><th>R1</th><th>R2</th><th>R3</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>Abertura</td><td>{l.abertura[0]}</td><td>{l.abertura[1]}</td><td>{l.abertura[2]}</td></tr>
                      <tr><td>Fechamento</td><td>{l.fechamento[0] || "—"}</td><td>{l.fechamento[1] || "—"}</td><td>{l.fechamento[2] || "—"}</td></tr>
                      <tr><td>Pré-análise</td><td>{l.preAnalise[0] || "—"}</td><td>{l.preAnalise[1] || "—"}</td><td>{l.preAnalise[2] || "—"}</td></tr>
                      <tr><td>Pós-análise</td><td>{l.posAnalise[0] || "—"}</td><td>{l.posAnalise[1] || "—"}</td><td>{l.posAnalise[2] || "—"}</td></tr>
                    </tbody>
                  </table>
                </div>
                {l.respValidacao && (
                  <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-secondary)" }}>
                    Validado por <strong style={{ color: "var(--text-primary)" }}>{l.respValidacao}</strong> em {l.dataValidacao}
                  </div>
                )}
              </div>
            ))}

            <div className={s.formActions}>
              <button className={s.btnSecondary} onClick={() => setShowDetail(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
