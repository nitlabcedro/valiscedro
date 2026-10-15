"use client";

import { useEffect, useState } from "react";
import { fetchAll, mensagemErro } from "@/lib/api";
import type { CadastroTipo, CatalogoItem } from "@/lib/types";

const VAZIO: Record<CadastroTipo, CatalogoItem[]> = {
  equipamentos: [],
  fabricantes: [],
  ntos: [],
  setores: [],
  analitos: [],
};

export function useCatalogos(tipos: CadastroTipo[]) {
  const chave = tipos.join(",");
  const [dados, setDados] = useState(VAZIO);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const lista = chave.split(",").filter(Boolean) as CadastroTipo[];
    if (lista.length === 0) return;
    const controller = new AbortController();

    Promise.all(
      lista.map(async (tipo) => {
        const items = await fetchAll<CatalogoItem>(`/cadastros/${tipo}`, controller.signal);
        return [tipo, items] as const;
      })
    )
      .then((pares) => {
        setDados((atual) => {
          const proximo = { ...atual };
          for (const [tipo, items] of pares) proximo[tipo] = items;
          return proximo;
        });
      })
      .catch((erroCapturado: unknown) => {
        if (controller.signal.aborted) return;
        setErro(mensagemErro(erroCapturado));
      });

    return () => controller.abort();
  }, [chave]);

  return { ...dados, erro };
}
