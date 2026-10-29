"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import sharedStyles from "@/styles/shared.module.css";
import styles from "./login.module.css";
import { ApiError, apiSend, mensagemErro } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider/AuthProvider";
import { rotaInicial } from "@/lib/acesso";
import type { Usuario } from "@/lib/types";
import CampoSenha from "@/components/CampoSenha/CampoSenha";

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  // O bloqueio da API é por e-mail + IP, então trocar o e-mail libera o botão.
  const [bloqueado, setBloqueado] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !senha) {
      setErro("Preencha e-mail e senha.");
      return;
    }
    setErro("");
    setEnviando(true);
    try {
      const data = await apiSend<{ token: string; usuario: Usuario }>("POST", "/auth/login", {
        email: email.trim(),
        senha,
      });
      setSession(data.token, data.usuario);
      router.push(rotaInicial(data.usuario.cargo));
    } catch (erroCapturado) {
      if (erroCapturado instanceof ApiError && erroCapturado.status === 429) setBloqueado(true);
      setErro(mensagemErro(erroCapturado));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.brand}>
          <Image
            src="/logoCedro.svg"
            alt="Logo Cedro"
            width={200}
            height={72}
            style={{ objectFit: "contain" }}
          />
          <span className={styles.systemName}>Valis</span>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={sharedStyles.formGroup}>
            <label className={sharedStyles.formLabel} htmlFor="email">E-mail</label>
            <input
              id="email"
              className={sharedStyles.formInput}
              type="email"
              placeholder="nome@laboratorio.com.br"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setBloqueado(false);
              }}
              autoComplete="email"
            />
          </div>

          <div className={sharedStyles.formGroup}>
            <label className={sharedStyles.formLabel} htmlFor="senha">Senha</label>
            <CampoSenha
              id="senha"
              className={sharedStyles.formInput}
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
            />
            <Link href="/esqueci-senha" className={styles.forgotPassword}>
              Esqueceu a senha?
            </Link>
          </div>

          {erro && <p className={styles.formError}>{erro}</p>}

          <button type="submit" className={styles.loginBtn} disabled={enviando || bloqueado}>
            {enviando ? "Entrando..." : "Acessar"}
          </button>
        </form>

        <p className={styles.footer}>
          Não tem uma conta? <Link href="/cadastro">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
