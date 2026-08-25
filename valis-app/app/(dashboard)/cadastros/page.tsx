"use client";

import { useState } from "react";
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineCpuChip,
  HiOutlineBuildingOffice2,
  HiOutlineDocumentText,
  HiOutlineMapPin,
} from "react-icons/hi2";
import s from "@/styles/shared.module.css";

type CadastroType = "equipamentos" | "fabricantes" | "ntos" | "setores";

interface CadastroItem {
  id: string;
  nome: string;
  criadoEm: string;
  criadoPor: string;
}

const mockCadastros: Record<CadastroType, CadastroItem[]> = {
  equipamentos: [
    { id: "EQP-001", nome: "Analisador AU680", criadoEm: "2026-01-15", criadoPor: "André P." },
    { id: "EQP-002", nome: "Sysmex XN-1000", criadoEm: "2026-02-10", criadoPor: "Maria S." },
    { id: "EQP-003", nome: "Architect i2000", criadoEm: "2026-03-20", criadoPor: "Carlos R." },
    { id: "EQP-004", nome: "Cobas c501", criadoEm: "2026-04-05", criadoPor: "André P." },
  ],
  fabricantes: [
    { id: "FAB-001", nome: "Beckman Coulter", criadoEm: "2026-01-10", criadoPor: "André P." },
    { id: "FAB-002", nome: "Sysmex Corporation", criadoEm: "2026-01-10", criadoPor: "André P." },
    { id: "FAB-003", nome: "Abbott Diagnostics", criadoEm: "2026-01-10", criadoPor: "André P." },
    { id: "FAB-004", nome: "Roche Diagnostics", criadoEm: "2026-02-01", criadoPor: "Maria S." },
  ],
  ntos: [
    { id: "NTO-001", nome: "NTO-LAB-001", criadoEm: "2026-01-05", criadoPor: "André P." },
    { id: "NTO-002", nome: "NTO-LAB-002", criadoEm: "2026-01-05", criadoPor: "André P." },
    { id: "NTO-003", nome: "NTO-LAB-003", criadoEm: "2026-03-15", criadoPor: "Carlos R." },
  ],
  setores: [
    { id: "SET-001", nome: "Bioquímica", criadoEm: "2026-01-01", criadoPor: "André P." },
    { id: "SET-002", nome: "Hematologia", criadoEm: "2026-01-01", criadoPor: "André P." },
    { id: "SET-003", nome: "Imunologia", criadoEm: "2026-01-01", criadoPor: "André P." },
    { id: "SET-004", nome: "Microbiologia", criadoEm: "2026-02-20", criadoPor: "Maria S." },
  ],
};

const tabConfig: { key: CadastroType; label: string; icon: React.ComponentType }[] = [
  { key: "equipamentos", label: "Equipamentos", icon: HiOutlineCpuChip },
  { key: "fabricantes", label: "Fabricantes", icon: HiOutlineBuildingOffice2 },
  { key: "ntos", label: "NTOs", icon: HiOutlineDocumentText },
  { key: "setores", label: "Setores", icon: HiOutlineMapPin },
];

export default function CadastrosPage() {
  const [activeTab, setActiveTab] = useState<CadastroType>("equipamentos");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const items = mockCadastros[activeTab].filter((item) =>
    item.nome.toLowerCase().includes(search.toLowerCase()) ||
    item.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <h1>Cadastros Gerais</h1>
          <p>Gerencie equipamentos, fabricantes, NTOs e setores</p>
        </div>
        <div className={s.headerActions}>
          <button className={s.btnPrimary} onClick={() => setShowModal(true)}>
            <HiOutlinePlus /> Novo Cadastro
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={s.tabs}>
        {tabConfig.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? s.tabActive : s.tab}
            onClick={() => { setActiveTab(tab.key); setSearch(""); }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={s.card}>
        <div className={s.searchBar}>
          <HiOutlineMagnifyingGlass className={s.searchIcon} />
          <input placeholder={`Pesquisar ${tabConfig.find(t => t.key === activeTab)?.label.toLowerCase()}...`} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className={s.tableWrapper}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Criado Em</th>
                <th>Criado Por</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.id}</td>
                  <td>{item.nome}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{item.criadoEm}</td>
                  <td>{item.criadoPor}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
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

      {/* New Cadastro Modal */}
      {showModal && (
        <div className={s.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={s.modalTitle}>Novo {tabConfig.find(t => t.key === activeTab)?.label.slice(0, -1)}</h2>
            <div className={s.formGrid}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Nome</label>
                <input className={s.formInput} placeholder={`Nome do ${tabConfig.find(t => t.key === activeTab)?.label.slice(0, -1).toLowerCase()}`} />
              </div>
            </div>
            <div className={s.formActions}>
              <button className={s.btnSecondary} onClick={() => setShowModal(false)}>Cancelar</button>
              <button className={s.btnPrimary} onClick={() => setShowModal(false)}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
