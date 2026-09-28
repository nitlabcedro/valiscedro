"use client";

import Link from "next/link";
import Image from "next/image";
import sharedStyles from "@/styles/shared.module.css";
import styles from "./login.module.css";

export default function LoginPage() {
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
                </div>

                <div className={styles.form}>
                    <div className={sharedStyles.formGroup}>
                        <label className={sharedStyles.formLabel}>E-mail</label>
                        <input
                            className={sharedStyles.formInput}
                            type="email"
                            placeholder="nome@laboratorio.com.br"
                        />
                    </div>


                    <div className={sharedStyles.formGroup}>
                        <label className={sharedStyles.formLabel}>Senha</label>
                        <input
                            className={sharedStyles.formInput}
                            type="password"
                            placeholder="••••••••"
                        />
                        <Link href="#" className={styles.forgotPassword}>
                            Esqueceu a senha?
                        </Link>
                    </div>

                    <Link href="/dashboard" style={{ textDecoration: "none" }}>
                        <button className={`${sharedStyles.btnPrimary} ${styles.loginBtn}`}>
                            Acessar
                        </button>
                    </Link>
                </div>

                <p className={styles.footer}>
                    Não tem uma conta? <Link href="/cadastro">Cadastre-se</Link>
                </p>
            </div>
        </div>
    );
}
