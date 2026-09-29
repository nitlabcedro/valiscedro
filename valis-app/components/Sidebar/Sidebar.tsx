"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineHome,
  HiOutlineClipboardDocumentList,
  HiOutlineBeaker,
  HiOutlineChartBar,
  HiOutlineCog6Tooth,
  HiOutlineUsers,
  HiOutlineUserCircle,
  HiOutlineBuildingOffice2,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import styles from "./Sidebar.module.css";
import logo from "@/public/logoCedro.svg";
import Image from "next/image";

const navItems = [
  {
    section: "Principal",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: HiOutlineHome },
      { label: "Rastreabilidade", href: "/rastreabilidade", icon: HiOutlineClipboardDocumentList, badge: 3 },
      { label: "Validação", href: "/validacao", icon: HiOutlineBeaker },
      { label: "Controle Interno", href: "/controle-interno", icon: HiOutlineChartBar },
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

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>V</div>
        <div className={styles.logoText}>
          <span className={styles.logoTitle}>
            <Image src={logo} 
            alt="Logo Cedro" 
            width={10} 
            height={10} 
            style={{ marginBottom: "0px", objectFit: "contain" }}
            />
            </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {navItems.map((group) => (
          <div key={group.section}>
            <div className={styles.navSection}>{group.section}</div>
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                >
                  <span className={styles.navIcon}><Icon /></span>
                  <span className={styles.navText}>{item.label}</span>
                  {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className={styles.footer}>
        <div className={styles.userCard}>
          <div className={styles.avatar}>AP</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>André Pestana</div>
            <div className={styles.userRole}>Administrador</div>
          </div>
        </div>
        <Link href="/" className={`${styles.navItem} ${styles.logout}`}>
          <span className={styles.navIcon}><HiOutlineArrowRightOnRectangle /></span>
          <span className={styles.navText}>Sair</span>
        </Link>
      </div>
    </aside>
  );
}
