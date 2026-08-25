"use client";

import { useState } from "react";
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from "react-icons/hi2";
import s from "@/styles/shared.module.css";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: "Administrador" | "Coordenador" | "Operador";
  criadoEm: string;
}

const mockUsers: Usuario[] = [
  { id: "USR-001", nome: "André Pestana", email: "andre.pestana@lab.com", perfil: "Administrador", criadoEm: "2026-01-01" },
  { id: "USR-002", nome: "Maria Silva", email: "maria.silva@lab.com", perfil: "Coordenador", criadoEm: "2026-01-15" },
  { id: "USR-003", nome: "Carlos Ribeiro", email: "carlos.ribeiro@lab.com", perfil: "Operador", criadoEm: "2026-02-10" },
  { id: "USR-004", nome: "Ana Lima", email: "ana.lima@lab.com", perfil: "Operador", criadoEm: "2026-03-01" },
  { id: "USR-005", nome: "Pedro Santos", email: "pedro.santos@lab.com", perfil: "Coordenador", criadoEm: "2026-04-20" },
];

function getPerfilBadge(perfil: string) {
  switch (perfil) {
    case "Administrador": return s.badgeRed;
    case "Coordenador": return s.badgePurple;
    case "Operador": return s.badgeBlue;
    default: return s.badge;
  }
}

export default function UsuariosPage() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filtered = mockUsers.filter(
    (u) =>
      u.nome.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.perfil.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <h1>Usuários</h1>
          <p>Gerencie os usuários e permissões do sistema</p>
        </div>
        <div className={s.headerActions}>
          <button className={s.btnPrimary} onClick={() => setShowModal(true)}>
            <HiOutlinePlus /> Novo Usuário
          </button>
        </div>
      </div>

      <div className={s.card}>
        <div className={s.searchBar}>
          <HiOutlineMagnifyingGlass className={s.searchIcon} />
          <input placeholder="Pesquisar por nome, e-mail ou perfil..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className={s.tableWrapper}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Criado Em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.id}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "var(--gradient-blue)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#fff",
                        flexShrink: 0,
                      }}>
                        {u.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      {u.nome}
                    </div>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{u.email}</td>
                  <td><span className={getPerfilBadge(u.perfil)}>{u.perfil}</span></td>
                  <td style={{ color: "var(--text-secondary)" }}>{u.criadoEm}</td>
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

      {/* New User Modal */}
      {showModal && (
        <div className={s.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={s.modalTitle}>Novo Usuário</h2>
            <div className={s.formGrid}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Nome</label>
                <input className={s.formInput} placeholder="Nome completo" />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>E-mail</label>
                <input className={s.formInput} type="email" placeholder="email@lab.com" />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Senha</label>
                <input className={s.formInput} type="password" placeholder="••••••••" />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Perfil</label>
                <select className={s.formSelect}>
                  <option>Selecione...</option>
                  <option>Operador</option>
                  <option>Coordenador</option>
                  <option>Administrador</option>
                </select>
              </div>
            </div>
            <div className={s.formActions}>
              <button className={s.btnSecondary} onClick={() => setShowModal(false)}>Cancelar</button>
              <button className={s.btnPrimary} onClick={() => setShowModal(false)}>Criar Usuário</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
