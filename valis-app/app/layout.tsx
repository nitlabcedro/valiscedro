import type { Metadata } from "next";
import Notificacoes from "@/components/Notificacoes";
import { roboto } from "@/lib/fonte";
import "./globals.css";

export const metadata: Metadata = {
  title: "Valis — Sistema Laboratorial",
  description: "Rastreabilidade, validação e controle de validação para laboratórios",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={roboto.variable}>
      <body>
        {children}
        <Notificacoes />
      </body>
    </html>
  );
}
