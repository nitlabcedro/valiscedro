"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cargoDe } from "@/lib/acesso";
import { apiGet, apiSend, clearToken, getToken, mensagemErro, setToken } from "@/lib/api";
import type { Usuario } from "@/lib/types";

function sessaoUsuario(data: Usuario): Usuario {
  return {
    id: data.id,
    codigo: data.codigo,
    nome: data.nome,
    email: data.email,
    cargo: data.cargo,
  };
}

interface AuthContextValue {
  usuario: Usuario | null;
  ready: boolean;
  erroSessao: string;
  setSession: (token: string, usuario: Usuario) => void;
  updateUsuario: (usuario: Usuario) => void;
  logout: () => Promise<void>;
  sairLocal: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [ready, setReady] = useState(false);
  const [erroSessao, setErroSessao] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setReady(true);
      return;
    }

    let cancelado = false;
    apiGet<Usuario>("/auth/me")
      .then((res) => {
        if (!cancelado) setUsuario(sessaoUsuario(res.data));
      })
      .catch((erro: unknown) => {
        if (cancelado) return;
        setUsuario(null);
        if (getToken()) setErroSessao(mensagemErro(erro));
      })
      .finally(() => {
        if (!cancelado) setReady(true);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const setSession = useCallback((token: string, proximo: Usuario) => {
    setToken(token);
    setUsuario(sessaoUsuario(proximo));
    setErroSessao("");
    setReady(true);
  }, []);

  const updateUsuario = useCallback((proximo: Usuario) => {
    setUsuario(sessaoUsuario(proximo));
  }, []);

  const sairLocal = useCallback(() => {
    clearToken();
    setUsuario(null);
    setErroSessao("");
    router.replace("/");
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await apiSend("POST", "/auth/logout");
    } catch {
      /* a sessão local é encerrada mesmo se a API já invalidou o token */
    }
    clearToken();
    setUsuario(null);
    setErroSessao("");
    router.replace("/");
  }, [router]);

  const value = useMemo(
    () => ({ usuario, ready, erroSessao, setSession, updateUsuario, logout, sairLocal }),
    [usuario, ready, erroSessao, setSession, updateUsuario, logout, sairLocal]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return context;
}

export function isCoordenador(usuario: Usuario | null) {
  return cargoDe(usuario?.cargo) === "Coordenador";
}
