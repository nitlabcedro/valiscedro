"use client";

import { useEffect, useState, type FormEvent } from "react";
import s from "@/styles/shared.module.css";
import p from "./perfil.module.css";
import { useAuth } from "@/components/AuthProvider/AuthProvider";
import { apiSend, mensagemErro } from "@/lib/api";
import { cargoLabel, emailValido, iniciais, senhaCabe } from "@/lib/format";
import { classeSituacao } from "@/lib/badges";
import { notificar } from "@/lib/notificar";
import CampoSenha from "@/components/CampoSenha/CampoSenha";
import type { Usuario } from "@/lib/types";

export default function PerfilPage() {
  const { usuario, updateUsuario, sairLocal } = useAuth();
  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [email, setEmail] = useState(usuario?.email ?? "");
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    setNome(usuario.nome);
    setEmail(usuario.email);
  }, [usuario]);

  async function salvarPerfil(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) {
      notificar.erro("Preencha nome e e-mail.");
      return;
    }
    if (!emailValido(email)) {
      notificar.erro("Informe um e-mail válido.");
      return;
    }
    setSalvandoPerfil(true);
    try {
      const atualizado = await apiSend<Usuario>("PATCH", "/perfil", {
        nome: nome.trim(),
        email: email.trim(),
      });
      updateUsuario(atualizado);
      notificar.sucesso("Perfil atualizado.");
    } catch (erroCapturado) {
      notificar.erro(mensagemErro(erroCapturado));
    } finally {
      setSalvandoPerfil(false);
    }
  }

  async function salvarSenha(e: FormEvent) {
    e.preventDefault();
    if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
      notificar.erro("Preencha a senha atual, a nova senha e a confirmação.");
      return;
    }
    if (novaSenha.length < 6) {
      notificar.erro("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (!senhaCabe(novaSenha)) {
      notificar.erro("Senha excede o tamanho máximo.");
      return;
    }
    if (novaSenha !== confirmarNovaSenha) {
      notificar.erro("A confirmação da senha não confere.");
      return;
    }
    setSalvandoSenha(true);
    try {
      await apiSend("PATCH", "/perfil/senha", { senhaAtual, novaSenha, confirmarNovaSenha });
      notificar.sucesso("Senha alterada. Entre novamente com a nova senha.");
      sairLocal();
    } catch (erroCapturado) {
      notificar.erro(mensagemErro(erroCapturado));
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
          {usuario && <span className={`${p.profileBadge} ${classeSituacao(usuario.cargo)}`}>{cargoLabel(usuario.cargo)}</span>}
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
          <div className={s.formActions}>
            <button type="submit" className={s.btnPrimary} disabled={salvandoPerfil}>
              {salvandoPerfil ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>

      <div className={s.card}>
        <h3 className={s.cardTitle}>Alterar Senha</h3>
        <form onSubmit={salvarSenha}>
          <div className={s.formGroup}>
            <label className={s.formLabel} htmlFor="senhaAtual">Senha atual</label>
            <CampoSenha id="senhaAtual" className={s.formInput} placeholder="••••••••" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} autoComplete="current-password" />
          </div>
          <div className={s.formGrid} style={{ marginTop: 20 }}>
            <div className={s.formGroup}>
              <label className={s.formLabel} htmlFor="novaSenha">Nova Senha</label>
              <CampoSenha id="novaSenha" className={s.formInput} placeholder="••••••••" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} autoComplete="new-password" />
            </div>
            <div className={s.formGroup}>
              <label className={s.formLabel} htmlFor="confirmarNovaSenha">Confirmar Nova Senha</label>
              <CampoSenha id="confirmarNovaSenha" className={s.formInput} placeholder="••••••••" value={confirmarNovaSenha} onChange={(e) => setConfirmarNovaSenha(e.target.value)} autoComplete="new-password" />
            </div>
          </div>
          <div className={s.formActions}>
            <button
              type="button"
              className={s.btnSecondary}
              onClick={() => {
                setSenhaAtual("");
                setNovaSenha("");
                setConfirmarNovaSenha("");
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
