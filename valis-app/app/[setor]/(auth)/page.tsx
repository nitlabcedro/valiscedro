"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HiOutlineArrowRightEndOnRectangle, HiOutlineExclamationTriangle } from "react-icons/hi2";
import sharedStyles from "@/styles/shared.module.css";
import styles from "./login.module.css";
import { ApiError, apiSend, mensagemErro } from "@/lib/api";
import { notificar } from "@/lib/notificar";
import { useAuth } from "@/components/AuthProvider/AuthProvider";
import { useRota, useSetor, useSetores } from "@/components/SetorProvider/SetorProvider";
import { rotaInicial } from "@/lib/acesso";
import { visualDoSetor } from "@/lib/setores";
import type { Usuario } from "@/lib/types";
import CampoSenha from "@/components/CampoSenha/CampoSenha";

export default function LoginPage() {
  const router = useRouter();
  const { setSession, ready, usuario } = useAuth();
  const setor = useSetor();
  const setores = useSetores();
  const rota = useRota();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  // O bloqueio da API é por e-mail + IP, então trocar o e-mail libera o botão.
  const [bloqueado, setBloqueado] = useState(false);

  // Já tem sessão neste setor (ou acabou de entrar): vai direto para a tela inicial do cargo.
  useEffect(() => {
    if (ready && usuario) router.replace(rota(rotaInicial(usuario.cargo)));
  }, [ready, usuario, router, rota]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !senha) {
      notificar.erro("Preencha e-mail e senha.");
      return;
    }
    setEnviando(true);
    try {
      const data = await apiSend<{ token: string; usuario: Usuario }>("POST", "/auth/login", {
        email: email.trim(),
        senha,
      });
      setSession(data.token, data.usuario);
      notificar.sucesso(`Olá, ${data.usuario.nome.split(" ")[0]}. Login realizado.`);
      // O redirecionamento acontece no useEffect acima, quando a sessão é gravada.
    } catch (erroCapturado) {
      if (erroCapturado instanceof ApiError && erroCapturado.status === 429) setBloqueado(true);
      notificar.erro(mensagemErro(erroCapturado));
    } finally {
      setEnviando(false);
    }
  }

  const corSetor = visualDoSetor(setor.slug).cor;

  return (
    <div className={styles.loginContainer}>
      {/* --cor-setor vem do setor atual (dado dinâmico): pinta a faixa no topo do card */}
      <div className={`${styles.loginCard} ${styles.loginCardSetor}`} style={{ "--cor-setor": corSetor } as React.CSSProperties}>
        <div className={styles.brand}>
          <Image src="/logoCedro.svg" alt="Logo Cedro" width={200} height={72} className={styles.logo} priority />
          <span className={styles.systemName}>Valis</span>
        </div>

        <div className={styles.titulo}>
          <h1>Acesse sua conta</h1>
          <p>Entre com seu e-mail e senha para continuar.</p>
        </div>

        <span className={sharedStyles.formLabel} id="rotulo-setor">Setor</span>
        <nav className={styles.setores} aria-labelledby="rotulo-setor">
          {setores.map((item) => {
            const { icone: Icone, cor } = visualDoSetor(item.slug);
            const ativo = item.slug === setor.slug;
            return (
              <Link
                key={item.slug}
                href={`/${item.slug}`}
                replace
                aria-current={ativo ? "page" : undefined}
                className={`${styles.setorBotao} ${ativo ? styles.setorAtivo : ""}`}
                style={{ "--cor-setor": cor } as React.CSSProperties}
              >
                <Icone size={18} />
                <span>{item.nome}</span>
              </Link>
            );
          })}
        </nav>

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
            <div className={styles.labelLinha}>
              <label className={sharedStyles.formLabel} htmlFor="senha">Senha</label>
              <Link href={rota("/esqueci-senha")} className={styles.forgotPassword}>
                Esqueceu a senha?
              </Link>
            </div>
            <CampoSenha
              id="senha"
              className={sharedStyles.formInput}
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {/* O toast some; este aviso explica por que o botão continua desabilitado. */}
          {bloqueado && (
            <p className={styles.formAviso} role="alert">
              <HiOutlineExclamationTriangle aria-hidden />
              Muitas tentativas de acesso. Aguarde alguns minutos ou use outro e-mail.
            </p>
          )}

          <button type="submit" className={styles.loginBtn} disabled={enviando || bloqueado} aria-busy={enviando}>
            <HiOutlineArrowRightEndOnRectangle aria-hidden />
            {enviando ? "Entrando..." : "Acessar"}
          </button>
        </form>

        <p className={styles.footer}>
          Não tem uma conta? <Link href={rota("/cadastro")}>Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
