"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import s from "@/styles/shared.module.css";
import { isCoordenador, useAuth } from "@/components/AuthProvider/AuthProvider";
import { apiSend, mensagemErro } from "@/lib/api";
import { cargoLabel, emailValido } from "@/lib/format";
import Erro from "@/components/Erro";
import { CARGOS, type Cargo } from "@/lib/types";

export default function NovoUsuarioPage() {
  const router = useRouter();
  const { usuario, ready } = useAuth();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cargo, setCargo] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (ready && !isCoordenador(usuario)) router.replace("/dashboard");
  }, [ready, usuario, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !cargo) {
      setErro("Preencha nome, e-mail e cargo.");
      return;
    }
    if (!emailValido(email)) {
      setErro("Informe um e-mail válido.");
      return;
    }
    setErro("");
    setEnviando(true);
    try {
      await apiSend("POST", "/usuarios", {
        nome: nome.trim(),
        email: email.trim(),
        cargo: cargo as Cargo,
      });
      router.push("/usuarios");
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
      setEnviando(false);
    }
  }

  if (ready && !isCoordenador(usuario)) return null;

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <h1>Novo Usuário</h1>
          <p>Cadastre um usuário com nome, e-mail e cargo</p>
        </div>
      </div>

      <div className={s.card}>
        <form onSubmit={handleSubmit}>
          <div className={s.formGrid}>
            <div className={s.formGroup}>
              <label className={s.formLabel} htmlFor="nome">Nome</label>
              <input
                id="nome"
                className={s.formInput}
                placeholder="Nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div className={s.formGroup}>
              <label className={s.formLabel} htmlFor="email">E-mail</label>
              <input
                id="email"
                className={s.formInput}
                type="email"
                placeholder="email@lab.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className={s.formGroup}>
              <label className={s.formLabel} htmlFor="cargo">Cargo</label>
              <select
                id="cargo"
                className={s.formSelect}
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
              >
                <option value="">Selecione...</option>
                {CARGOS.map((c) => (
                  <option key={c} value={c}>{cargoLabel(c)}</option>
                ))}
              </select>
            </div>
          </div>

          <Erro texto={erro} />

          <div className={s.formActions}>
            <button type="button" className={s.btnSecondary} onClick={() => router.push("/usuarios")}>
              <HiOutlineArrowLeft /> Voltar
            </button>
            <button type="submit" className={s.btnPrimary} disabled={enviando}>
              {enviando ? "Criando..." : "Criar Usuário"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
