"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import sharedStyles from "@/styles/shared.module.css";
import styles from "../login.module.css";
import { apiSend, mensagemErro } from "@/lib/api";
import { emailValido, senhaCabe } from "@/lib/format";

export default function CadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !senha) {
      setErro("Preencha nome, e-mail e senha.");
      return;
    }
    if (!emailValido(email)) {
      setErro("Informe um e-mail válido.");
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
    setErro("");
    setEnviando(true);
    try {
      await apiSend("POST", "/auth/cadastro", {
        nome: nome.trim(),
        email: email.trim(),
        senha,
      });
      router.push("/");
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
          <p>Crie sua conta para acessar o sistema</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Outros cargos são liberados pela coordenação.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={sharedStyles.formGroup}>
            <label className={sharedStyles.formLabel} htmlFor="nome">Nome</label>
            <input
              id="nome"
              className={sharedStyles.formInput}
              placeholder="Nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoComplete="name"
            />
          </div>

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
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {erro && <p className={styles.formError}>{erro}</p>}

          <button type="submit" className={`${sharedStyles.btnPrimary} ${styles.loginBtn}`} disabled={enviando}>
            {enviando ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className={styles.footer}>
          Já tem uma conta? <Link href="/">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
