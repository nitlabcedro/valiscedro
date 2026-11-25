"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider/AuthProvider";
import { useRota } from "@/components/SetorProvider/SetorProvider";
import { podeAcessar, rotaInicial } from "@/lib/acesso";
import { semSetor } from "@/lib/setores";

export default function SessionGate({ children }: { children: React.ReactNode }) {
  const { ready, usuario, erroSessao, sairLocal } = useAuth();
  const router = useRouter();
  const rota = useRota();
  const pathname = usePathname();
  // As permissões (lib/acesso.ts) são definidas sem o setor no caminho.
  const caminho = semSetor(pathname);
  const permitido = !usuario || podeAcessar(usuario.cargo, caminho);

  useEffect(() => {
    if (ready && !usuario && !erroSessao) router.replace(rota("/"));
  }, [ready, usuario, erroSessao, router, rota]);

  useEffect(() => {
    if (ready && usuario && !podeAcessar(usuario.cargo, caminho)) {
      router.replace(rota(rotaInicial(usuario.cargo)));
    }
  }, [ready, usuario, caminho, router, rota]);

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

  if (!ready || !usuario || !permitido) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
        Carregando...
      </div>
    );
  }

  return <>{children}</>;
}
