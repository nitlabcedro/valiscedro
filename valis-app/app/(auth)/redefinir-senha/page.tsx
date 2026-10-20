"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import sharedStyles from "@/styles/shared.module.css";
import styles from "../login.module.css";
import { ApiError, apiSend, mensagemErro } from "@/lib/api";
import { senhaCabe } from "@/lib/format";

function Formulario() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) {
      setErro("Link inválido. Solicite uma nova redefinição.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (!senhaCabe(senha)) {
      setErro("Senha excede o tamanho máximo.");
      return;
    }
    if (senha !== confirmacao) {
      setErro("A confirmação da senha não confere.");
      return;
    }
    setErro("");
    setEnviando(true);
    try {
      await apiSend("POST", "/auth/redefinir-senha", { token, senha });
      setEnviado(true);
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
            width={220}
            height={80}
            style={{ marginBottom: "0px", objectFit: "contain" }}
          />
          <p>Defina uma nova senha</p>
        </div>

        {!token && !enviado ? (
          <p className={styles.formError}>Link inválido. Solicite uma nova redefinição.</p>
        ) : enviado ? (
          <p className={styles.footer} style={{ marginTop: 0 }}>Senha redefinida. Você já pode entrar.</p>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={sharedStyles.formGroup}>
              <label className={sharedStyles.formLabel} htmlFor="senha">Nova senha</label>
              <input
                id="senha"
                className={sharedStyles.formInput}
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className={sharedStyles.formGroup}>
              <label className={sharedStyles.formLabel} htmlFor="confirmacao">Confirmar nova senha</label>
              <input
                id="confirmacao"
                className={sharedStyles.formInput}
                type="password"
                placeholder="••••••••"
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            {erro && <p className={styles.formError}>{erro}</p>}
            <button type="submit" className={styles.loginBtn} disabled={enviando || bloqueado}>
              {enviando ? "Salvando..." : "Redefinir senha"}
            </button>
          </form>
        )}

        <p className={styles.footer}>
          {enviado ? <Link href="/">Ir para o login</Link> : <Link href="/esqueci-senha">Solicitar novo link</Link>}
        </p>
      </div>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={<div className={styles.loginContainer}>Carregando...</div>}>
      <Formulario />
    </Suspense>
  );
}
