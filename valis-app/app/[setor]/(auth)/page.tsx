"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  HiOutlineEnvelope,
  HiOutlineExclamationTriangle,
  HiOutlineLockClosed,
} from "react-icons/hi2";
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

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <Image src="/logoCedro.svg" alt="Laboratório Cedro" width={190} height={60} className={styles.logoTopo} priority />

        <div className={styles.titulo}>
          <h1>Login</h1>
          <p>Acesse o Valis para continuar</p>
        </div>

        <span className={`${sharedStyles.formLabel} ${styles.rotulo}`} id="rotulo-setor">Setor</span>
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
            <label className={sharedStyles.formLabel} htmlFor="email">E-mail corporativo</label>
            <div className={styles.campoIcone}>
              <HiOutlineEnvelope aria-hidden />
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
          </div>

          <div className={sharedStyles.formGroup}>
            <label className={sharedStyles.formLabel} htmlFor="senha">Senha</label>
            <div className={styles.campoIcone}>
              <HiOutlineLockClosed aria-hidden />
              <CampoSenha
                id="senha"
                className={sharedStyles.formInput}
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className={styles.linhaSenha}>
            <Link href={rota("/esqueci-senha")} className={styles.forgotPassword}>
              Esqueci minha senha
            </Link>
          </div>

          {/* O toast some; este aviso explica por que o botão continua desabilitado. */}
          {bloqueado && (
            <p className={styles.formAviso} role="alert">
              <HiOutlineExclamationTriangle aria-hidden />
              Muitas tentativas de acesso. Aguarde alguns minutos ou use outro e-mail.
            </p>
          )}

          <button type="submit" className={styles.loginBtn} disabled={enviando || bloqueado} aria-busy={enviando}>
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className={styles.footer}>
          Não possui conta? <Link href={rota("/cadastro")}>Criar cadastro</Link>
        </p>
      </div>
    </div>
  );
}
