"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import sharedStyles from "@/styles/shared.module.css";
import styles from "./login.module.css";
import { apiSend, mensagemErro } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider/AuthProvider";
import type { Usuario } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

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
      router.push("/dashboard");
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <Image
              src="/logoCedro.svg"
              alt="Logo Cedro"
              width={220}
              height={80}
              style={{ marginBottom: "0px", objectFit: "contain" }}
            />
          </div>
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
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className={sharedStyles.formGroup}>
            <label className={sharedStyles.formLabel} htmlFor="senha">Senha</label>
            <input
              id="senha"
              className={sharedStyles.formInput}
              type="password"
              placeholder="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
            />
            <Link href="/esqueci-senha" className={styles.forgotPassword}>
              Esqueceu a senha?
            </Link>
          </div>

          {erro && <p className={styles.formError}>{erro}</p>}

          <button type="submit" className={`${sharedStyles.btnPrimary} ${styles.loginBtn}`} disabled={enviando}>
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
