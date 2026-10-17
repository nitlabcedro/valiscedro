"use client";

import { useCallback, useEffect, useState } from "react";
import { PAGE_SIZE, apiGet, mensagemErro, type Query } from "@/lib/api";

export function useList<T>(path: string | null, normalizar?: (q: string) => string, query?: Query) {
  const extra = JSON.stringify(query ?? {});
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(Boolean(path));
  const [erro, setErro] = useState("");
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    setPage(1);
  }, [path, debouncedQ, extra]);

  const reload = useCallback(() => setVersao((valor) => valor + 1), []);

  useEffect(() => {
    if (!path) {
      setItems([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    const consulta = normalizar ? normalizar(debouncedQ) : debouncedQ;

    const params: Query = { q: consulta, page, pageSize: PAGE_SIZE, ...(JSON.parse(extra) as Query) };
    apiGet<T[]>(path, params, controller.signal)
      .then((res) => {
        if (!Array.isArray(res.data)) {
          setItems([]);
          setTotal(0);
          setErro("Resposta inesperada da API.");
          return;
        }
        setItems(res.data);
        setTotal(res.total ?? res.data.length);
        setErro("");
      })
      .catch((erroCapturado: unknown) => {
        if (controller.signal.aborted) return;
        const mensagem = mensagemErro(erroCapturado);
        if (!mensagem) return;
        setErro(mensagem);
        setItems([]);
        setTotal(0);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [path, debouncedQ, page, versao, normalizar, extra]);

  return { q, setQ, page, setPage, items, total, loading, erro, setErro, reload, pageSize: PAGE_SIZE };
}
