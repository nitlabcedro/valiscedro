"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineHome,
  HiOutlineClipboardDocumentList,
  HiOutlineBeaker,
  HiOutlineChartBar,
  HiOutlineDocumentChartBar,
  HiOutlineUsers,
  HiOutlineUserCircle,
  HiOutlineBuildingOffice2,
  HiOutlineArrowRightOnRectangle,
  HiOutlineArrowsRightLeft,
} from "react-icons/hi2";
import styles from "./Sidebar.module.css";
import logo from "@/public/logoCedro.svg";
import logoIco from "@/public/logoCedroIco.png";
import Image from "next/image";
import { useAuth } from "@/components/AuthProvider/AuthProvider";
import { useRota, useSetor, useSetores } from "@/components/SetorProvider/SetorProvider";
import { cargoDe, podeAcessar } from "@/lib/acesso";
import { semSetor, visualDoSetor } from "@/lib/setores";
import { cargoLabel, iniciais } from "@/lib/format";
import { notificar } from "@/lib/notificar";

const navItems: { section: string; items: { label: string; href: string; icon: typeof HiOutlineHome }[] }[] = [
  {
    section: "Principal",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: HiOutlineHome },
      { label: "Rastreabilidade", href: "/rastreabilidade", icon: HiOutlineClipboardDocumentList },
      { label: "Validação", href: "/validacao", icon: HiOutlineBeaker },
      { label: "Controle de Validação", href: "/conclusao", icon: HiOutlineChartBar },
      { label: "Relatórios", href: "/relatorios", icon: HiOutlineDocumentChartBar },
    ],
  },
  {
    section: "Cadastros",
    items: [
      { label: "Cadastros Gerais", href: "/cadastros", icon: HiOutlineBuildingOffice2 },
      { label: "Usuários", href: "/usuarios", icon: HiOutlineUsers },
    ],
  },
  {
    section: "Conta",
    items: [
      { label: "Meu Perfil", href: "/perfil", icon: HiOutlineUserCircle },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const caminho = semSetor(pathname);
  const rota = useRota();
  const setor = useSetor();
  const outrosSetores = useSetores().filter((item) => item.slug !== setor.slug);
  const { icone: IconeSetor, cor: corSetor } = visualDoSetor(setor.slug);
  const { usuario, logout } = useAuth();
  const [saindo, setSaindo] = useState(false);
  const cargo = cargoDe(usuario?.cargo);

  async function handleSair() {
    setSaindo(true);
    await logout();
    notificar.info("Sessão encerrada.");
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Image src={logoIco} alt="Logo Cedro" className={styles.logoIcon} priority />
        <Image src={logo} alt="Logo Cedro" className={styles.logoFull} priority />
      </div>

      <div className={styles.setor} title={setor.nome}>
        <span className={styles.setorIcon} style={{ color: corSetor }}><IconeSetor /></span>
        <span className={styles.navText}>{setor.nome}</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map((group) => {
          const items = group.items.filter((item) => podeAcessar(cargo, item.href));
          if (items.length === 0) return null;
          return (
            <div key={group.section}>
              <div className={styles.navSection}>{group.section}</div>
              {items.map((item) => {
                const isActive = caminho === item.href || caminho.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={rota(item.href)}
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
        {/* Cada setor tem seu próprio token: trocar não encerra a sessão deste.
            O login do outro setor entra direto se já houver sessão lá. */}
        {outrosSetores.length > 0 && (
          <div className={styles.trocarSetor}>
            <div className={styles.navSection}>Trocar setor</div>
            {outrosSetores.map((item) => {
              const { icone: Icone } = visualDoSetor(item.slug);
              return (
                <Link key={item.slug} href={`/${item.slug}`} className={styles.navItem} title={`Ir para ${item.nome}`}>
                  <span className={styles.navIcon}><Icone /></span>
                  <span className={styles.navText}>{item.nome}</span>
                  <span className={`${styles.navIcon} ${styles.trocarSeta}`}><HiOutlineArrowsRightLeft /></span>
                </Link>
              );
            })}
          </div>
        )}
        <button type="button" className={`${styles.navItem} ${styles.logout}`} onClick={handleSair} disabled={saindo}>
          <span className={styles.navIcon}><HiOutlineArrowRightOnRectangle /></span>
          <span className={styles.navText}>Sair</span>
        </button>
      </div>
    </aside>
  );
}
