"use client";

import { useEffect, useState, type FormEvent } from "react";
import { HiOutlineCheckCircle } from "react-icons/hi2";
import s from "@/styles/shared.module.css";
import p from "./perfil.module.css";
import { useAuth } from "@/components/AuthProvider/AuthProvider";
import { apiSend, mensagemErro } from "@/lib/api";
import { cargoLabel, emailValido, iniciais } from "@/lib/format";
import Erro from "@/components/Erro";
import type { Usuario } from "@/lib/types";

export default function PerfilPage() {
  const { usuario, updateUsuario, sairLocal } = useAuth();
  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [email, setEmail] = useState(usuario?.email ?? "");
  const [salvo, setSalvo] = useState(false);
  const [erroPerfil, setErroPerfil] = useState("");
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    setNome(usuario.nome);
    setEmail(usuario.email);
  }, [usuario]);

  async function salvarPerfil(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) {
      setErroPerfil("Preencha nome e e-mail.");
      return;
    }
    if (!emailValido(email)) {
      setErroPerfil("Informe um e-mail válido.");
      return;
    }
    setErroPerfil("");
    setSalvandoPerfil(true);
    try {
      const atualizado = await apiSend<Usuario>("PATCH", "/perfil", {
        nome: nome.trim(),
        email: email.trim(),
      });
      updateUsuario(atualizado);
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
    } catch (erroCapturado) {
      setErroPerfil(mensagemErro(erroCapturado));
    } finally {
      setSalvandoPerfil(false);
    }
  }

  async function salvarSenha(e: FormEvent) {
    e.preventDefault();
    if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
      setErroSenha("Preencha a senha atual, a nova senha e a confirmação.");
      return;
    }
    if (novaSenha.length < 6) {
      setErroSenha("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmarNovaSenha) {
      setErroSenha("A confirmação da senha não confere.");
      return;
    }
    setErroSenha("");
    setSalvandoSenha(true);
    try {
      await apiSend("PATCH", "/perfil/senha", { senhaAtual, novaSenha, confirmarNovaSenha });
      sairLocal();
    } catch (erroCapturado) {
      setErroSenha(mensagemErro(erroCapturado));
      setSalvandoSenha(false);
    }
  }

  return (
    <div className={p.profilePage}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <h1>Meu Perfil</h1>
          <p>Atualize suas informações pessoais</p>
        </div>
      </div>

      <div className={p.avatarSection}>
        <div className={p.avatarLarge}>{iniciais(nome)}</div>
        <div className={p.avatarInfo}>
          <h2>{nome}</h2>
          <p>{email}</p>
          {usuario && <span className={p.profileBadge}>{cargoLabel(usuario.cargo)}</span>}
        </div>
      </div>

      <div className={s.card}>
        <h3 className={s.cardTitle}>Informações Pessoais</h3>
        <form onSubmit={salvarPerfil}>
          <div className={s.formGrid}>
            <div className={s.formGroup}>
              <label className={s.formLabel} htmlFor="nome">Nome</label>
              <input id="nome" className={s.formInput} value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" />
            </div>
            <div className={s.formGroup}>
              <label className={s.formLabel} htmlFor="email">E-mail</label>
              <input id="email" className={s.formInput} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
          </div>
          <Erro texto={erroPerfil} />
          <div className={s.formActions}>
            <button type="submit" className={s.btnPrimary} disabled={salvandoPerfil}>
              {salvo ? <><HiOutlineCheckCircle /> Salvo!</> : salvandoPerfil ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>

      <div className={s.card}>
        <h3 className={s.cardTitle}>Alterar Senha</h3>
        <form onSubmit={salvarSenha}>
          <div className={s.formGroup}>
            <label className={s.formLabel} htmlFor="senhaAtual">Senha atual</label>
            <input id="senhaAtual" className={s.formInput} type="password" placeholder="••••••••" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} autoComplete="current-password" />
          </div>
          <div className={s.formGrid} style={{ marginTop: 20 }}>
            <div className={s.formGroup}>
              <label className={s.formLabel} htmlFor="novaSenha">Nova Senha</label>
              <input id="novaSenha" className={s.formInput} type="password" placeholder="••••••••" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} autoComplete="new-password" />
            </div>
            <div className={s.formGroup}>
              <label className={s.formLabel} htmlFor="confirmarNovaSenha">Confirmar Nova Senha</label>
              <input id="confirmarNovaSenha" className={s.formInput} type="password" placeholder="••••••••" value={confirmarNovaSenha} onChange={(e) => setConfirmarNovaSenha(e.target.value)} autoComplete="new-password" />
            </div>
          </div>
          <Erro texto={erroSenha} />
          <div className={s.formActions}>
            <button
              type="button"
              className={s.btnSecondary}
              onClick={() => {
                setSenhaAtual("");
                setNovaSenha("");
                setConfirmarNovaSenha("");
                setErroSenha("");
              }}
            >
              Cancelar
            </button>
            <button type="submit" className={s.btnPrimary} disabled={salvandoSenha}>
              {salvandoSenha ? "Alterando..." : "Alterar Senha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
