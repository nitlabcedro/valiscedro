"use client";

import { useState } from "react";
import { HiOutlineCheckCircle } from "react-icons/hi2";
import s from "@/styles/shared.module.css";
import p from "./perfil.module.css";

export default function PerfilPage() {
  const [saved, setSaved] = useState(false);
  const [nome, setNome] = useState("André Pestana");
  const [email, setEmail] = useState("andre.pestana@labcedro.com.br");
  const [senha, setSenha] = useState("");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className={p.profilePage}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <h1>Meu Perfil</h1>
          <p>Atualize suas informações pessoais</p>
        </div>
      </div>

      {/* Avatar Section */}
      <div className={p.avatarSection}>
        <div className={p.avatarLarge}>AP</div>
        <div className={p.avatarInfo}>
          <h2>{nome}</h2>
          <p>{email}</p>
          <span className={p.profileBadge}>Administrador</span>
        </div>
      </div>

      {/* Edit Form */}
      <div className={s.card}>
        <h3 className={s.cardTitle}>Informações Pessoais</h3>

        <div className={s.formGrid}>
          <div className={s.formGroup}>
            <label className={s.formLabel}>Nome</label>
            <input className={s.formInput} value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className={s.formGroup}>
            <label className={s.formLabel}>E-mail</label>
            <input className={s.formInput} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <div className={s.formActions}>
          <button className={s.btnPrimary} onClick={handleSave}>
            {saved ? <><HiOutlineCheckCircle /> Salvo!</> : "Salvar Alterações"}
          </button>
        </div>
      </div>

      <div className={s.card}>
        <h3 className={s.cardTitle}>Alterar Senha</h3>

        <div className={s.formGrid}>
          <div className={s.formGroup}>
            <label className={s.formLabel}>Nova Senha</label>
            <input className={s.formInput} type="password" placeholder="••••••••" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
          <div className={s.formGroup}>
            <label className={s.formLabel}>Confirmar Nova Senha</label>
            <input className={s.formInput} type="password" placeholder="••••••••" />
          </div>
        </div>

        <div className={s.formActions}>
          <button className={s.btnSecondary}>Cancelar</button>
          <button className={s.btnPrimary}>Alterar Senha</button>
        </div>
      </div>
    </div>
  );
}
