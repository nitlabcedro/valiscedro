"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineHome,
  HiOutlineClipboardDocumentList,
  HiOutlineBeaker,
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineUserCircle,
  HiOutlineBuildingOffice2,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import styles from "./Sidebar.module.css";
import logo from "@/public/logoCedro.svg";
import Image from "next/image";
import { useAuth } from "@/components/AuthProvider/AuthProvider";
import { cargoDe } from "@/lib/acesso";
import { cargoLabel, iniciais } from "@/lib/format";
import type { Cargo } from "@/lib/types";

const gestao: Cargo[] = ["Coordenador"];

const navItems: { section: string; items: { label: string; href: string; icon: typeof HiOutlineHome; cargos: Cargo[] }[] }[] = [
  {
    section: "Principal",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: HiOutlineHome, cargos: gestao },
      { label: "Rastreabilidade", href: "/rastreabilidade", icon: HiOutlineClipboardDocumentList, cargos: ["Técnico"] },
      { label: "Validação", href: "/validacao", icon: HiOutlineBeaker, cargos: ["Bioquímico"] },
      { label: "Controle de Validação", href: "/conclusao", icon: HiOutlineChartBar, cargos: ["Bioquímico"] },
    ],
  },
  {
    section: "Cadastros",
    items: [
      { label: "Cadastros Gerais", href: "/cadastros", icon: HiOutlineBuildingOffice2, cargos: gestao },
      { label: "Usuários", href: "/usuarios", icon: HiOutlineUsers, cargos: gestao },
    ],
  },
  {
    section: "Conta",
    items: [
      { label: "Meu Perfil", href: "/perfil", icon: HiOutlineUserCircle, cargos: ["Técnico", "Bioquímico", "Coordenador"] },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { usuario, logout } = useAuth();
  const [saindo, setSaindo] = useState(false);
  const cargo = cargoDe(usuario?.cargo);

  async function handleSair() {
    setSaindo(true);
    await logout();
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>V</div>
        <div className={styles.logoText}>
          <span className={styles.logoTitle}>
            <Image
              src={logo}
              alt="Logo Cedro"
              width={10}
              height={10}
              style={{ marginBottom: "0px", objectFit: "contain" }}
            />
          </span>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map((group) => {
          const items = group.items.filter((item) => cargo != null && item.cargos.includes(cargo));
          if (items.length === 0) return null;
          return (
            <div key={group.section}>
              <div className={styles.navSection}>{group.section}</div>
              {items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                  >
                    <span className={styles.navIcon}><Icon /></span>
                    <span className={styles.navText}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userCard}>
          <div className={styles.avatar}>{iniciais(usuario?.nome ?? "")}</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{usuario?.nome}</div>
            <div className={styles.userRole}>{usuario ? cargoLabel(usuario.cargo) : ""}</div>
          </div>
        </div>
        <button type="button" className={`${styles.navItem} ${styles.logout}`} onClick={handleSair} disabled={saindo}>
          <span className={styles.navIcon}><HiOutlineArrowRightOnRectangle /></span>
          <span className={styles.navText}>Sair</span>
        </button>
      </div>
    </aside>
  );
}
