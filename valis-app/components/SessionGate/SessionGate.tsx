"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider/AuthProvider";

export default function SessionGate({ children }: { children: React.ReactNode }) {
  const { ready, usuario, erroSessao, sairLocal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !usuario && !erroSessao) router.replace("/");
  }, [ready, usuario, erroSessao, router]);

  if (erroSessao) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: "var(--accent-red)", padding: 24, textAlign: "center" }}>
        <p>{erroSessao}</p>
        <button type="button" onClick={sairLocal} style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          Voltar ao login
        </button>
      </div>
    );
  }

  if (!ready || !usuario) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
        Carregando...
      </div>
    );
  }

  return <>{children}</>;
}
