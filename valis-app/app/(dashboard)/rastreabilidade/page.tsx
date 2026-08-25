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

interface Lote {
  numero: string;
  validade: string;
  abertura: string;
  respAbertura: string;
  fechamento: string;
  respFechamento: string;
}

interface Rastreabilidade {
  id: string;
  nto: string;
  setor: string;
  equipamento: string;
  tipoMaterial: string;
  fabricante: string;
  lotes: Lote[];
  assinatura: { nome: string; cargo: string; usuario: string; data: string };
  criadoEm: string;
  criadoPor: string;
}

const mockData: Rastreabilidade[] = [
  {
    id: "RTG-0001",
    nto: "NTO-LAB-001",
    setor: "Bioquímica",
    equipamento: "Analisador AU680",
    tipoMaterial: "Reagente",
    fabricante: "Beckman Coulter",
    lotes: [
      { numero: "LOT-2024-A1", validade: "2026-12-15", abertura: "2026-06-10", respAbertura: "André P.", fechamento: "", respFechamento: "" },
      { numero: "LOT-2024-A2", validade: "2026-11-20", abertura: "2026-07-01", respAbertura: "Maria S.", fechamento: "2026-08-20", respFechamento: "Maria S." },
    ],
    assinatura: { nome: "André Pestana", cargo: "Coordenador", usuario: "andre.pestana", data: "2026-08-25" },
    criadoEm: "2026-06-10",
    criadoPor: "André P.",
  },
  {
    id: "RTG-0002",
    nto: "NTO-LAB-002",
    setor: "Hematologia",
    equipamento: "Sysmex XN-1000",
    tipoMaterial: "Controle",
    fabricante: "Sysmex",
    lotes: [
      { numero: "LOT-2024-B1", validade: "2026-10-05", abertura: "2026-05-15", respAbertura: "Carlos R.", fechamento: "2026-08-01", respFechamento: "Carlos R." },
    ],
    assinatura: { nome: "Carlos Ribeiro", cargo: "Operador", usuario: "carlos.r", data: "2026-08-01" },
    criadoEm: "2026-05-15",
    criadoPor: "Carlos R.",
  },
  {
    id: "RTG-0003",
    nto: "NTO-LAB-003",
    setor: "Imunologia",
    equipamento: "Architect i2000",
    tipoMaterial: "Calibrador",
    fabricante: "Abbott",
    lotes: [
      { numero: "LOT-2024-C1", validade: "2026-09-30", abertura: "2026-08-01", respAbertura: "Ana L.", fechamento: "", respFechamento: "" },
    ],
    assinatura: { nome: "Ana Lima", cargo: "Operadora", usuario: "ana.lima", data: "2026-08-01" },
    criadoEm: "2026-08-01",
    criadoPor: "Ana L.",
  },
];

export default function RastreabilidadePage() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<Rastreabilidade | null>(null);

  const filtered = mockData.filter(
    (r) =>
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.equipamento.toLowerCase().includes(search.toLowerCase()) ||
      r.setor.toLowerCase().includes(search.toLowerCase()) ||
      r.fabricante.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <h1>Rastreabilidade</h1>
          <p>Gerencie a rastreabilidade de lotes do laboratório</p>
        </div>
        <div className={s.headerActions}>
          <button className={s.btnPrimary} onClick={() => setShowModal(true)}>
            <HiOutlinePlus /> Novo Registro
          </button>
        </div>
      </div>

      <div className={s.card}>
        <div className={s.searchBar}>
          <HiOutlineMagnifyingGlass className={s.searchIcon} />
          <input placeholder="Pesquisar por ID, equipamento, setor, fabricante..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.id}</td>
                  <td>{r.nto}</td>
                  <td><span className={s.badgePurple}>{r.setor}</span></td>
                  <td>{r.equipamento}</td>
                  <td>{r.tipoMaterial}</td>
                  <td>{r.fabricante}</td>
                  <td><span className={s.badgeBlue}>{r.lotes.length}</span></td>
                  <td style={{ color: "var(--text-secondary)" }}>{r.criadoEm}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className={s.iconBtn} onClick={() => setShowDetail(r)} title="Ver detalhes"><HiOutlineEye /></button>
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

      {/* New Record Modal */}
      {showModal && (
        <div className={s.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={s.modalTitle}>Nova Rastreabilidade</h2>
            <div className={s.formGrid}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>NTO Associada</label>
                <select className={s.formSelect}><option>Selecione...</option><option>NTO-LAB-001</option><option>NTO-LAB-002</option></select>
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Setor</label>
                <select className={s.formSelect}><option>Selecione...</option><option>Bioquímica</option><option>Hematologia</option><option>Imunologia</option></select>
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Equipamento</label>
                <select className={s.formSelect}><option>Selecione...</option><option>Analisador AU680</option><option>Sysmex XN-1000</option></select>
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Tipo de Material</label>
                <select className={s.formSelect}><option>Selecione...</option><option>Reagente</option><option>Controle</option><option>Calibrador</option></select>
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Fabricante</label>
                <select className={s.formSelect}><option>Selecione...</option><option>Beckman Coulter</option><option>Sysmex</option><option>Abbott</option></select>
              </div>
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "24px 0 16px", color: "var(--text-secondary)" }}>Lote</h3>
            <div className={s.formGrid}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Número do Lote</label>
                <input className={s.formInput} placeholder="Ex: LOT-2024-XX" />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Data de Validade</label>
                <input className={s.formInput} type="date" />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Data de Abertura</label>
                <input className={s.formInput} type="date" />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Responsável Abertura</label>
                <input className={s.formInput} placeholder="Nome do responsável" />
              </div>
            </div>

            <div className={s.formActions}>
              <button className={s.btnSecondary} onClick={() => setShowModal(false)}>Cancelar</button>
              <button className={s.btnPrimary} onClick={() => setShowModal(false)}>Salvar Registro</button>
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
              <div className={s.formGroup}><span className={s.formLabel}>NTO</span><span>{showDetail.nto}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Setor</span><span>{showDetail.setor}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Equipamento</span><span>{showDetail.equipamento}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Material</span><span>{showDetail.tipoMaterial}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Fabricante</span><span>{showDetail.fabricante}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Criado por</span><span>{showDetail.criadoPor}</span></div>
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "24px 0 12px", color: "var(--text-secondary)" }}>Lotes ({showDetail.lotes.length})</h3>
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
                  </tr>
                </thead>
                <tbody>
                  {showDetail.lotes.map((l) => (
                    <tr key={l.numero}>
                      <td style={{ fontWeight: 600 }}>{l.numero}</td>
                      <td>{l.validade}</td>
                      <td>{l.abertura}</td>
                      <td>{l.respAbertura}</td>
                      <td>{l.fechamento || "—"}</td>
                      <td>{l.respFechamento || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "24px 0 12px", color: "var(--text-secondary)" }}>Assinatura</h3>
            <div className={s.formGrid}>
              <div className={s.formGroup}><span className={s.formLabel}>Nome</span><span>{showDetail.assinatura.nome}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Cargo</span><span>{showDetail.assinatura.cargo}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Usuário</span><span>{showDetail.assinatura.usuario}</span></div>
              <div className={s.formGroup}><span className={s.formLabel}>Data</span><span>{showDetail.assinatura.data}</span></div>
            </div>

            <div className={s.formActions}>
              <button className={s.btnSecondary} onClick={() => setShowDetail(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
