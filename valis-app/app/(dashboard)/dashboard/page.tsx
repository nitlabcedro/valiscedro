"use client";

import {
  HiOutlineClipboardDocumentList,
  HiOutlineBeaker,
  HiOutlineUsers,
  HiOutlineArchiveBox,
  HiOutlineLockClosed,
  HiOutlineExclamationTriangle,
  HiOutlineClock,
  HiOutlineArrowDownTray,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";
import styles from "./page.module.css";
import dynamic from 'next/dynamic';
const DashboardChart = dynamic(() => import('@/components/DashboardChart/DashboardChart'), { ssr: false });

const stats = [
  { label: "Rastreabilidades", value: "148", change: "+12%", icon: HiOutlineClipboardDocumentList, color: "Blue" },
  { label: "Validações", value: "63", change: "+8%", icon: HiOutlineBeaker, color: "Green" },
  { label: "Usuários Ativos", value: "12", change: "+2", icon: HiOutlineUsers, color: "Yellow" },
  { label: "Lotes Vencidos", value: "5", change: "-3", icon: HiOutlineExclamationTriangle, color: "Red" },
];

const lotStatus = [
  { label: "Abertos", value: 34, icon: HiOutlineArchiveBox, bg: "rgba(59,130,246,0.12)", color: "var(--accent-blue)" },
  { label: "Fechados", value: 89, icon: HiOutlineLockClosed, bg: "rgba(34,197,94,0.12)", color: "var(--accent-green)" },
  { label: "Vencidos", value: 5, icon: HiOutlineExclamationTriangle, bg: "rgba(239,68,68,0.12)", color: "var(--accent-red)" },
  { label: "Próx. Vencimento", value: 11, icon: HiOutlineClock, bg: "rgba(234,179,8,0.12)", color: "var(--accent-yellow)" },
];

const notifications = [
  { type: "danger", title: "Lote RTG-2024-0087 vencido há 3 dias", time: "Há 2 horas" },
  { type: "warning", title: "Lote VLD-2024-0142 vence em 5 dias", time: "Há 4 horas" },
  { type: "warning", title: "Lote RTG-2024-0091 vence em 7 dias", time: "Há 6 horas" },
  { type: "info", title: "Nova validação registrada por Maria S.", time: "Há 8 horas" },
  { type: "info", title: "Controle interno aprovado — Glicose N2", time: "Hoje, 09:15" },
];

const recentActivity = [
  { id: "RTG-0148", type: "Rastreabilidade", user: "André P.", date: "25/08/2026", status: "Aberto" },
  { id: "VLD-0063", type: "Validação", user: "Maria S.", date: "24/08/2026", status: "Fechado" },
  { id: "CIQ-0211", type: "Controle Interno", user: "Carlos R.", date: "24/08/2026", status: "Aprovado" },
  { id: "RTG-0147", type: "Rastreabilidade", user: "Ana L.", date: "23/08/2026", status: "Fechado" },
  { id: "VLD-0062", type: "Validação", user: "André P.", date: "23/08/2026", status: "Vencido" },
];

function getStatusClass(status: string) {
  switch (status) {
    case "Aberto": return styles.badgeOpen;
    case "Fechado":
    case "Aprovado": return styles.badgeClosed;
    case "Vencido": return styles.badgeExpired;
    default: return styles.badge;
  }
}

function getDotClass(type: string) {
  switch (type) {
    case "danger": return styles.notifDotDanger;
    case "warning": return styles.notifDotWarning;
    default: return styles.notifDotInfo;
  }
}

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Dashboard</h1>
          <p>Visão geral do sistema laboratorial</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary}>
            <HiOutlineMagnifyingGlass /> Pesquisar
          </button>
          <button className={styles.btnPrimary}>
            <HiOutlineArrowDownTray /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className={styles.statsGrid}>
        {stats.map((s) => {
          const Icon = s.icon;
          const cardClass = `${styles.statCard} ${styles[`statCard${s.color}` as keyof typeof styles]}`;
          const iconClass = `${styles.statIcon} ${styles[`statIcon${s.color}` as keyof typeof styles]}`;
          const isUp = s.change.startsWith("+");
          return (
            <div key={s.label} className={cardClass}>
              <div className={styles.statHeader}>
                <div className={iconClass}><Icon /></div>
                <span className={isUp ? styles.statChangeUp : styles.statChangeDown}>
                  {s.change}
                </span>
              </div>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Lot Status */}
      <div className={styles.lotStatusGrid}>
        {lotStatus.map((l) => {
          const Icon = l.icon;
          return (
            <div key={l.label} className={styles.lotStatusCard}>
              <div className={styles.lotStatusIcon} style={{ background: l.bg, color: l.color }}>
                <Icon />
              </div>
              <div>
                <div className={styles.lotStatusValue}>{l.value}</div>
                <div className={styles.lotStatusLabel}>{l.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart + Notifications */}
      <div className={styles.contentGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Registros — Últimos 7 dias</span>
            <span className={styles.cardAction}>Ver todos</span>
          </div>
          <div className={styles.chartWrapper}>
            <DashboardChart />
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Notificações</span>
            <span className={styles.cardAction}>Ver todas</span>
          </div>
          <div className={styles.notifList}>
            {notifications.map((n, i) => (
              <div key={i} className={styles.notifItem}>
                <div className={`${styles.notifDot} ${getDotClass(n.type)}`} />
                <div className={styles.notifContent}>
                  <div className={styles.notifTitle}>{n.title}</div>
                  <div className={styles.notifTime}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Atividades Recentes</span>
          <span className={styles.cardAction}>Ver histórico completo</span>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Usuário</th>
                <th>Data</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.id}</td>
                  <td>{a.type}</td>
                  <td>{a.user}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{a.date}</td>
                  <td><span className={getStatusClass(a.status)}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
