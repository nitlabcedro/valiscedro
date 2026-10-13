"use client";

import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { formatDia } from "@/lib/format";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController
);

export interface DiaDashboard {
  dia: string;
  rastreabilidade: number;
  validacao: number;
  controleValidacao: number;
}

const VAZIO: DiaDashboard[] = [];

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
      align: "end" as const,
      labels: {
        color: "rgba(0,0,0,0.6)",
        boxWidth: 12,
        boxHeight: 12,
        borderRadius: 3,
        useBorderRadius: true,
        padding: 16,
        font: { size: 12, family: "Inter" },
      },
    },
    tooltip: {
      backgroundColor: "rgba(255,255,255,0.95)",
      titleColor: "#111827",
      bodyColor: "#4b5563",
      borderColor: "rgba(0,0,0,0.06)",
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      titleFont: { size: 13, weight: "bold" as const, family: "Inter" },
      bodyFont: { size: 12, family: "Inter" },
    },
  },
  scales: {
    x: {
      grid: { color: "rgba(0,0,0,0.04)" },
      ticks: { color: "rgba(0,0,0,0.4)", font: { size: 12, family: "Inter" } },
      border: { display: false },
    },
    y: {
      grid: { color: "rgba(0,0,0,0.04)" },
      ticks: { color: "rgba(0,0,0,0.4)", font: { size: 12, family: "Inter" } },
      border: { display: false },
      beginAtZero: true,
    },
  },
};

export default function DashboardChart({ dias = VAZIO }: { dias?: DiaDashboard[] }) {
  const data = useMemo(() => ({
    labels: dias.map((dia) => formatDia(dia.dia)),
    datasets: [
      {
        type: "bar" as const,
        label: "Rastreabilidade",
        data: dias.map((dia) => dia.rastreabilidade),
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderRadius: 6,
        barPercentage: 0.6,
        order: 2,
      },
      {
        type: "bar" as const,
        label: "Validação",
        data: dias.map((dia) => dia.validacao),
        backgroundColor: "rgba(139, 92, 246, 0.5)",
        borderRadius: 6,
        barPercentage: 0.6,
        order: 3,
      },
      {
        type: "line" as const,
        label: "Controle de Validação",
        data: dias.map((dia) => dia.controleValidacao),
        borderColor: "rgba(34, 197, 94, 0.8)",
        backgroundColor: "rgba(34, 197, 94, 0.05)",
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: "rgba(34, 197, 94, 1)",
        tension: 0.4,
        fill: true,
        order: 1,
      },
    ],
  }), [dias]);

  return <Chart type="bar" data={data} options={options} />;
}
