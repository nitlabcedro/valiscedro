"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AuthProvider } from "@/components/AuthProvider/AuthProvider";
import { limparTokenAntigo, listarSetores, mensagemErro } from "@/lib/api";
import type { Setor } from "@/lib/setores";

const SetorContext = createContext<{ setor: Setor; setores: Setor[] } | null>(null);

// A lista é buscada uma vez por carregamento da página: trocar de setor não mostra "Carregando..." de novo.
let listaCarregada: Setor[] | null = null;
let carregando: Promise<Setor[]> | null = null;

function carregarSetores() {
  carregando ??= listarSetores()
    .then((lista) => (listaCarregada = lista))
    .catch((erro: unknown) => {
      carregando = null; // permite tentar de novo
      throw erro;
    });
  return carregando;
}

export function SetorProvider({ slug, children }: { slug: string; children: React.ReactNode }) {
  const [setores, setSetores] = useState<Setor[] | null>(listaCarregada);
  const [erro, setErro] = useState("");

  useEffect(() => {
    limparTokenAntigo();
    if (setores) return;
    let cancelado = false;
    carregarSetores()
      .then((lista) => {
        if (!cancelado) setSetores(lista);
      })
      .catch((e: unknown) => {
        if (!cancelado) setErro(mensagemErro(e));
      });
    return () => {
      cancelado = true;
    };
  }, [setores]);

  const setor = setores?.find((item) => item.slug === slug);
  const valor = useMemo(() => (setores && setor ? { setor, setores } : null), [setor, setores]);
  const mensagem = erro || (setores && !setor ? "Setor não encontrado." : "");

  if (mensagem) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, textAlign: "center" }}>
        <p style={{ color: "var(--accent-red)" }}>{mensagem}</p>
        <Link href="/" style={{ fontWeight: 600 }}>Ir para o login</Link>
      </div>
    );
  }

  if (!valor) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
        Carregando...
      </div>
    );
  }

  return (
    <SetorContext.Provider value={valor}>
      {/* key: trocar de setor recria a sessão do zero */}
      <AuthProvider key={valor.setor.slug}>{children}</AuthProvider>
    </SetorContext.Provider>
  );
}

function useSetorContext() {
  const context = useContext(SetorContext);
  if (!context) throw new Error("useSetor precisa estar dentro de SetorProvider");
  return context;
}

// O setor da URL atual.
export function useSetor(): Setor {
  return useSetorContext().setor;
}

// Todos os setores que a API informou.
export function useSetores(): Setor[] {
  return useSetorContext().setores;
}

// rota("/usuarios") -> "/imuno/usuarios"; rota("/") -> "/imuno" (login do setor)
export function useRota() {
  const { slug } = useSetor();
  return useCallback((caminho: string) => (caminho === "/" ? `/${slug}` : `/${slug}${caminho}`), [slug]);
}
