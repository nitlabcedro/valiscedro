"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { listarSetores, mensagemErro } from "@/lib/api";
import { visualDoSetor, type Setor } from "@/lib/setores";
import styles from "./setores.module.css";

export default function EscolhaSetorPage() {
  const [setores, setSetores] = useState<Setor[] | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    listarSetores()
      .then(setSetores)
      .catch((e: unknown) => setErro(mensagemErro(e)));
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Image src="/logoCedro.svg" alt="Logo Cedro" width={200} height={72} style={{ objectFit: "contain" }} priority />
        <h1 className={styles.titulo}>Valis</h1>
        <p className={styles.subtitulo}>Escolha o setor</p>

        {erro && <p className={styles.erro}>{erro}</p>}
        {!setores && !erro && <p className={styles.subtitulo}>Carregando...</p>}
        {setores?.length === 0 && <p className={styles.subtitulo}>Nenhum setor disponível.</p>}

        <div className={styles.grade}>
          {setores?.map((setor) => {
            const { icone: Icone, cor } = visualDoSetor(setor.slug);
            return (
              <Link key={setor.slug} href={`/${setor.slug}`} className={styles.setor} style={{ borderColor: cor }}>
                <Icone size={40} color={cor} />
                <span>{setor.nome}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
