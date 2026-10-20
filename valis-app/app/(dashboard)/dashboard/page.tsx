"use client";

import { useEffect, useState } from "react";
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
import s from "@/styles/shared.module.css";
import dynamic from "next/dynamic";
import { apiBlob, apiGet, mensagemErro } from "@/lib/api";
import { formatDate, formatQuando } from "@/lib/format";
import Erro from "@/components/Erro";
import type { DashboardDados } from "@/lib/types";

const DashboardChart = dynamic(() => import("@/components/DashboardChart/DashboardChart"), { ssr: false });

function getStatusClass(status: string) {
  switch (status) {
    case "Aberto": return styles.badgeOpen;
    case "Fechado":
    case "Aprovado": return styles.badgeClosed;
    case "Vencido":
    case "Rejeitado":
    case "Com rejeição": return styles.badgeExpired;
    case "Em andamento":
    case "Próximo do vencimento": return styles.badgeWarning;
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
  const [dados, setDados] = useState<DashboardDados | null>(null);
  const [erro, setErro] = useState("");
  const [exportando, setExportando] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  useEffect(() => {
    let cancelado = false;
    apiGet<DashboardDados>("/dashboard")
      .then((res) => {
        if (!cancelado) setDados(res.data);
      })
      .catch((erroCapturado: unknown) => {
        if (!cancelado) setErro(mensagemErro(erroCapturado));
      });
    return () => {
      cancelado = true;
    };
  }, []);

  async function exportarPdf() {
    setExportando(true);
    setErro("");
    try {
      const blob = await apiBlob("/dashboard/export");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "dashboard-valis.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    } finally {
      setExportando(false);
    }
  }

  const stats = [
    { label: "Rastreabilidades", value: dados ? String(dados.totais.rastreabilidades) : "—", change: "", icon: HiOutlineClipboardDocumentList, color: "Blue" },
    { label: "Validações", value: dados ? String(dados.totais.validacoes) : "—", change: "", icon: HiOutlineBeaker, color: "Green" },
    { label: "Usuários Ativos", value: dados ? String(dados.totais.usuariosAtivos) : "—", change: "", icon: HiOutlineUsers, color: "Yellow" },
    { label: "Lotes Vencidos", value: dados ? String(dados.totais.lotesVencidos) : "—", change: "", icon: HiOutlineExclamationTriangle, color: "Red" },
  ];

  const lotStatus = [
    { label: "Abertos", value: dados?.lotes.abertos ?? 0, icon: HiOutlineArchiveBox, bg: "rgba(59,130,246,0.12)", color: "#3b82f6" },
    { label: "Fechados", value: dados?.lotes.fechados ?? 0, icon: HiOutlineLockClosed, bg: "rgba(34,197,94,0.12)", color: "var(--accent-green)" },
    { label: "Vencidos", value: dados?.lotes.vencidos ?? 0, icon: HiOutlineExclamationTriangle, bg: "rgba(239,68,68,0.12)", color: "var(--accent-red)" },
    { label: "Próx. Vencimento", value: dados?.lotes.proximoVencimento ?? 0, icon: HiOutlineClock, bg: "rgba(234,179,8,0.12)", color: "var(--accent-yellow)" },
  ];

  const notifications = dados?.notificacoes ?? [];
  const recentActivity = dados?.atividades ?? [];

  const atividadesFiltradas = recentActivity.filter((a) => {
    if (filtroTipo && a.tipo !== filtroTipo) return false;
    if (filtro) {
      const termo = filtro.toLowerCase();
      return (
        a.id.toLowerCase().includes(termo) ||
        a.tipo.toLowerCase().includes(termo) ||
        a.usuario.toLowerCase().includes(termo) ||
        a.status.toLowerCase().includes(termo)
      );
    }
    return true;
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Dashboard</h1>
          <p>Visão geral do sistema laboratorial</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.btnPrimary} onClick={exportarPdf} disabled={exportando}>
            <HiOutlineArrowDownTray /> {exportando ? "Exportando..." : "Exportar PDF"}
          </button>
        </div>
      </div>

      <Erro texto={erro} />

      <div className={styles.statsGrid}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          const cardClass = `${styles.statCard} ${styles[`statCard${stat.color}` as keyof typeof styles]}`;
          const iconClass = `${styles.statIcon} ${styles[`statIcon${stat.color}` as keyof typeof styles]}`;
          const isUp = stat.change.startsWith("+");
          return (
            <div key={stat.label} className={cardClass}>
              <div className={styles.statHeader}>
                <div className={iconClass}><Icon /></div>
                {stat.change && (
                  <span className={isUp ? styles.statChangeUp : styles.statChangeDown}>
                    {stat.change}
                  </span>
                )}
              </div>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className={styles.lotStatusGrid}>
        {lotStatus.map((lote) => {
          const Icon = lote.icon;
          return (
            <div key={lote.label} className={styles.lotStatusCard}>
              <div className={styles.lotStatusIcon} style={{ background: lote.bg, color: lote.color }}>
                <Icon />
              </div>
              <div>
                <div className={styles.lotStatusValue}>{dados ? lote.value : "—"}</div>
                <div className={styles.lotStatusLabel}>{lote.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Registros — Últimos 7 dias</span>
          </div>
          <div className={styles.chartWrapper}>
            <DashboardChart dias={dados?.ultimos7Dias} />
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Notificações</span>
          </div>
          <div className={styles.notifList}>
            {notifications.length === 0 && (
              <div className={styles.notifTime}>Nenhuma notificação</div>
            )}
            {notifications.map((n, i) => (
              <div key={`${n.titulo}-${i}`} className={styles.notifItem}>
                <div className={`${styles.notifDot} ${getDotClass(n.tipo)}`} />
                <div className={styles.notifContent}>
                  <div className={styles.notifTitle}>{n.titulo}</div>
                  <div className={styles.notifTime}>{formatQuando(n.quando)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Atividades Recentes</span>
        </div>
        <div className={styles.filterBar}>
          <div className={s.searchBar} style={{ flex: 1, marginBottom: 0 }}>
            <HiOutlineMagnifyingGlass className={s.searchIcon} />
            <input placeholder="Pesquisar por ID, tipo, usuário..." value={filtro} onChange={(e) => setFiltro(e.target.value)} />
          </div>
          <select className={s.formSelect} style={{ maxWidth: 220 }} value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="">Todos os tipos</option>
            <option value="Rastreabilidade">Rastreabilidade</option>
            <option value="Validação">Validação</option>
            <option value="Controle de Validação">Controle de Validação</option>
          </select>
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
              {atividadesFiltradas.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "32px 16px" }}>
                    {recentActivity.length === 0 ? "Nenhuma atividade recente" : "Nenhum resultado para o filtro"}
                  </td>
                </tr>
              )}
              {atividadesFiltradas.map((atividade) => (
                <tr key={atividade.id}>
                  <td style={{ fontWeight: 600 }}>{atividade.id}</td>
                  <td>{atividade.tipo}</td>
                  <td>{atividade.usuario}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{formatDate(atividade.data)}</td>
                  <td><span className={getStatusClass(atividade.status)}>{atividade.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
