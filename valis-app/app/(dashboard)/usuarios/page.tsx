"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from "react-icons/hi2";
import s from "@/styles/shared.module.css";

type Cargo = "Técnico" | "Bioquímico" | "Coordenador";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: Cargo;
  criadoEm: string;
}

const mockUsers: Usuario[] = [
  { id: "USR-001", nome: "André Pestana", email: "andre.pestana@lab.com", cargo: "Coordenador", criadoEm: "2026-01-01" },
  { id: "USR-002", nome: "Maria Silva", email: "maria.silva@lab.com", cargo: "Bioquímico", criadoEm: "2026-01-15" },
  { id: "USR-003", nome: "Carlos Ribeiro", email: "carlos.ribeiro@lab.com", cargo: "Técnico", criadoEm: "2026-02-10" },
  { id: "USR-004", nome: "Ana Lima", email: "ana.lima@lab.com", cargo: "Técnico", criadoEm: "2026-03-01" },
  { id: "USR-005", nome: "Pedro Santos", email: "pedro.santos@lab.com", cargo: "Bioquímico", criadoEm: "2026-04-20" },
];

function getCargoBadge(cargo: Cargo) {
  switch (cargo) {
    case "Coordenador": return s.badgePurple;
    case "Bioquímico": return s.badgeBlue;
    case "Técnico": return s.badgeGreen;
  }
}

export default function UsuariosPage() {
  const [search, setSearch] = useState("");

  const filtered = mockUsers.filter(
    (u) =>
      u.nome.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.cargo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <h1>Usuários</h1>
          <p>Gerencie os usuários e permissões do sistema</p>
        </div>
        <div className={s.headerActions}>
          <Link href="/usuarios/novo" className={s.btnPrimary} style={{ textDecoration: "none" }}>
            <HiOutlinePlus /> Novo Usuário
          </Link>
        </div>
      </div>

      <div className={s.card}>
        <div className={s.searchBar}>
          <HiOutlineMagnifyingGlass className={s.searchIcon} />
          <input placeholder="Pesquisar por nome, e-mail ou cargo..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className={s.tableWrapper}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Cargo</th>
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
                  <td><span className={getCargoBadge(u.cargo)}>{u.cargo}</span></td>
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

    </div>
  );
}
