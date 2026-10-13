"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import sharedStyles from "@/styles/shared.module.css";
import styles from "../login.module.css";
import { apiSend, mensagemErro } from "@/lib/api";
import { emailValido } from "@/lib/format";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !emailValido(email)) {
      setErro("Informe um e-mail válido.");
      return;
    }
    setErro("");
    setEnviando(true);
    try {
      await apiSend("POST", "/auth/esqueci-senha", { email: email.trim() });
      setEnviado(true);
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
          <Image
            src="/logoCedro.svg"
            alt="Logo Cedro"
            width={220}
            height={80}
            style={{ marginBottom: "0px", objectFit: "contain" }}
          />
          <p>Informe o e-mail da sua conta</p>
        </div>

        {enviado ? (
          <p className={styles.footer} style={{ marginTop: 0 }}>
            Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.
          </p>
        ) : (
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
            {erro && <p className={styles.formError}>{erro}</p>}
            <button type="submit" className={`${sharedStyles.btnPrimary} ${styles.loginBtn}`} disabled={enviando}>
              {enviando ? "Enviando..." : "Enviar link"}
            </button>
          </form>
        )}

        <p className={styles.footer}>
          <Link href="/">Voltar ao login</Link>
        </p>
      </div>
    </div>
  );
}
