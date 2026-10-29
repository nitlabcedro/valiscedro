"use client";

import { useState, type InputHTMLAttributes } from "react";
import { TbEyeSearch } from "react-icons/tb";
import styles from "./CampoSenha.module.css";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export default function CampoSenha({ className, style, ...props }: Props) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div className={styles.campo}>
      <input
        {...props}
        type={visivel ? "text" : "password"}
        className={[className, styles.input].filter(Boolean).join(" ")}
        style={{ ...style, paddingRight: 44 }}
      />
      <button
        type="button"
        className={`${styles.olho} ${visivel ? styles.olhoAtivo : ""}`}
        onClick={() => setVisivel((atual) => !atual)}
        aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={visivel}
      >
        <TbEyeSearch size={18} aria-hidden />
      </button>
    </div>
  );
}
