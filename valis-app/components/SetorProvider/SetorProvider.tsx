"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { AuthProvider } from "@/components/AuthProvider/AuthProvider";
import { limparTokenAntigo, listarSetores, mensagemErro } from "@/lib/api";
import type { Setor } from "@/lib/setores";

const SetorContext = createContext<Setor | null>(null);

export function SetorProvider({ slug, children }: { slug: string; children: React.ReactNode }) {
  const [setor, setSetor] = useState<Setor | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    limparTokenAntigo();
    let cancelado = false;
    setSetor(null);
    setErro("");
    listarSetores()
      .then((lista) => {
        if (cancelado) return;
        const achado = lista.find((item) => item.slug === slug);
        if (achado) setSetor(achado);
        else setErro("Setor não encontrado.");
      })
      .catch((e: unknown) => {
        if (!cancelado) setErro(mensagemErro(e));
      });
    return () => {
      cancelado = true;
    };
  }, [slug]);

  if (erro) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, textAlign: "center" }}>
        <p style={{ color: "var(--accent-red)" }}>{erro}</p>
        <Link href="/" style={{ fontWeight: 600 }}>Escolher setor</Link>
      </div>
    );
  }

  if (!setor) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
        Carregando...
      </div>
    );
  }

  return (
    <SetorContext.Provider value={setor}>
      {/* key: trocar de setor recria a sessão do zero */}
      <AuthProvider key={setor.slug}>{children}</AuthProvider>
    </SetorContext.Provider>
  );
}

export function useSetor(): Setor {
  const setor = useContext(SetorContext);
  if (!setor) throw new Error("useSetor precisa estar dentro de SetorProvider");
  return setor;
}

// rota("/usuarios") -> "/imuno/usuarios"; rota("/") -> "/imuno" (login do setor)
export function useRota() {
  const { slug } = useSetor();
  return useCallback((caminho: string) => (caminho === "/" ? `/${slug}` : `/${slug}${caminho}`), [slug]);
}
