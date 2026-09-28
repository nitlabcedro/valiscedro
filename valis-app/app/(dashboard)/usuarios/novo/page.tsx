"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import s from "@/styles/shared.module.css";

const cargos = ["Técnico", "Bioquímico", "Coordenador"] as const;

export default function NovoUsuarioPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cargo, setCargo] = useState("");
  const [erro, setErro] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !cargo) {
      setErro("Preencha nome, e-mail e cargo.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErro("Informe um e-mail válido.");
      return;
    }
    setErro("");
    router.push("/usuarios");
  }

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
                {cargos.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {erro && (
            <p style={{ marginTop: 16, fontSize: 13, color: "var(--accent-red)", fontWeight: 500 }}>
              {erro}
            </p>
          )}

          <div className={s.formActions}>
            <button type="button" className={s.btnSecondary} onClick={() => router.push("/usuarios")}>
              <HiOutlineArrowLeft /> Voltar
            </button>
            <button type="submit" className={s.btnPrimary}>Criar Usuário</button>
          </div>
        </form>
      </div>
    </div>
  );
}
