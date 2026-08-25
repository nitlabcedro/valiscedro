"use client";

import { useState } from "react";
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from "react-icons/hi2";
import s from "@/styles/shared.module.css";

interface Nivel {
  nome: string;
  referencia: string;
  erroPermitido: string;
  limMin: string;
  limMax: string;
  valorObtido: string;
  status: "aprovado" | "rejeitado";
}

interface ControleInterno {
  id: string;
  data: string;
  equipamento: string;
  analito: string;
  loteControle: string;
  observacoes: string;
  niveis: Nivel[];
  criadoPor: string;
}

const mockData: ControleInterno[] = [
  {
    id: "CIQ-0001",
    data: "2026-08-25",
    equipamento: "Analisador AU680",
    analito: "Glicose",
    loteControle: "CTRL-2024-G1",
    observacoes: "",
    niveis: [
      { nome: "Nível 1 (Baixo)", referencia: "70", erroPermitido: "10%", limMin: "63", limMax: "77", valorObtido: "68", status: "aprovado" },
      { nome: "Nível 2 (Normal)", referencia: "100", erroPermitido: "10%", limMin: "90", limMax: "110", valorObtido: "102", status: "aprovado" },
      { nome: "Nível 3 (Alto)", referencia: "300", erroPermitido: "10%", limMin: "270", limMax: "330", valorObtido: "298", status: "aprovado" },
    ],
    criadoPor: "André P.",
  },
  {
    id: "CIQ-0002",
    data: "2026-08-24",
    equipamento: "Sysmex XN-1000",
    analito: "Hemoglobina",
    loteControle: "CTRL-2024-H1",
    observacoes: "Nível 3 rejeitado — repetir dosagem",
    niveis: [
      { nome: "Nível 1 (Baixo)", referencia: "8.0", erroPermitido: "5%", limMin: "7.6", limMax: "8.4", valorObtido: "7.9", status: "aprovado" },
      { nome: "Nível 2 (Normal)", referencia: "13.5", erroPermitido: "5%", limMin: "12.8", limMax: "14.2", valorObtido: "13.4", status: "aprovado" },
      { nome: "Nível 3 (Alto)", referencia: "18.0", erroPermitido: "5%", limMin: "17.1", limMax: "18.9", valorObtido: "19.5", status: "rejeitado" },
    ],
    criadoPor: "Maria S.",
  },
  {
    id: "CIQ-0003",
    data: "2026-08-23",
    equipamento: "Architect i2000",
    analito: "TSH",
    loteControle: "CTRL-2024-T1",
    observacoes: "",
    niveis: [
      { nome: "Nível 1 (Baixo)", referencia: "0.5", erroPermitido: "15%", limMin: "0.43", limMax: "0.58", valorObtido: "0.48", status: "aprovado" },
      { nome: "Nível 2 (Normal)", referencia: "5.0", erroPermitido: "15%", limMin: "4.25", limMax: "5.75", valorObtido: "5.2", status: "aprovado" },
      { nome: "Nível 3 (Alto)", referencia: "25.0", erroPermitido: "15%", limMin: "21.25", limMax: "28.75", valorObtido: "24.8", status: "aprovado" },
    ],
    criadoPor: "Carlos R.",
  },
];

export default function ControleInternoPage() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filtered = mockData.filter(
    (c) =>
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.analito.toLowerCase().includes(search.toLowerCase()) ||
      c.equipamento.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <h1>Controle Interno da Qualidade</h1>
          <p>Registre e monitore os controles internos por nível</p>
        </div>
        <div className={s.headerActions}>
          <button className={s.btnPrimary} onClick={() => setShowModal(true)}>
            <HiOutlinePlus /> Novo Controle
          </button>
        </div>
      </div>

      <div className={s.card}>
        <div className={s.searchBar}>
          <HiOutlineMagnifyingGlass className={s.searchIcon} />
          <input placeholder="Pesquisar por ID, analito, equipamento..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {filtered.map((c) => {
          const allApproved = c.niveis.every((n) => n.status === "aprovado");
          return (
            <div key={c.id} className={s.card} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{c.id} — {c.analito}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                    {c.equipamento} · Lote {c.loteControle} · {c.data} · por {c.criadoPor}
                  </div>
                </div>
                <span className={allApproved ? s.badgeGreen : s.badgeRed}>
                  {allApproved ? "Aprovado" : "Com rejeição"}
                </span>
              </div>

              <div className={s.tableWrapper}>
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th>Nível</th>
                      <th>Referência</th>
                      <th>Erro Perm.</th>
                      <th>Lim. Mín</th>
                      <th>Lim. Máx</th>
                      <th>Valor Obtido</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.niveis.map((n) => (
                      <tr key={n.nome}>
                        <td style={{ fontWeight: 500 }}>{n.nome}</td>
                        <td>{n.referencia}</td>
                        <td>{n.erroPermitido}</td>
                        <td>{n.limMin}</td>
                        <td>{n.limMax}</td>
                        <td style={{ fontWeight: 600 }}>{n.valorObtido}</td>
                        <td>
                          <span className={n.status === "aprovado" ? s.badgeGreen : s.badgeRed} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            {n.status === "aprovado" ? <HiOutlineCheckCircle /> : <HiOutlineXCircle />}
                            {n.status === "aprovado" ? "Aprovado" : "Rejeitado"}
                          </span>
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
          );
        })}
      </div>

      {/* New Control Modal */}
      {showModal && (
        <div className={s.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={s.modalTitle}>Novo Controle Interno</h2>
            <div className={s.formGrid}>
              <div className={s.formGroup}><label className={s.formLabel}>Data</label><input className={s.formInput} type="date" /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Equipamento</label><select className={s.formSelect}><option>Selecione...</option><option>Analisador AU680</option><option>Sysmex XN-1000</option><option>Architect i2000</option></select></div>
              <div className={s.formGroup}><label className={s.formLabel}>Analito / Reagente</label><input className={s.formInput} placeholder="Ex: Glicose" /></div>
              <div className={s.formGroup}><label className={s.formLabel}>Lote do Controle</label><input className={s.formInput} placeholder="Ex: CTRL-2024-XX" /></div>
            </div>

            {["Nível 1 (Baixo)", "Nível 2 (Normal)", "Nível 3 (Alto)"].map((nivel) => (
              <div key={nivel}>
                <h3 style={{ fontSize: 13, fontWeight: 600, margin: "20px 0 12px", color: "var(--text-secondary)" }}>{nivel}</h3>
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
              <textarea className={s.formTextarea} placeholder="Observações..." />
            </div>

            <div className={s.formActions}>
              <button className={s.btnSecondary} onClick={() => setShowModal(false)}>Cancelar</button>
              <button className={s.btnPrimary} onClick={() => setShowModal(false)}>Salvar Controle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
