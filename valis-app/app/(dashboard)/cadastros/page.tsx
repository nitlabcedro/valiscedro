"use client";

import { useState, type FormEvent } from "react";
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from "react-icons/hi2";
import s from "@/styles/shared.module.css";
import { isCoordenador, useAuth } from "@/components/AuthProvider/AuthProvider";
import { apiSend, mensagemErro } from "@/lib/api";
import { useList } from "@/lib/use-list";
import { formatDate } from "@/lib/format";
import Erro from "@/components/Erro";
import Pager from "@/components/Pager";
import type { CadastroTipo, CatalogoItem } from "@/lib/types";

const abas: { key: CadastroTipo; label: string; singular: string }[] = [
  { key: "equipamentos", label: "Equipamentos", singular: "Equipamento" },
  { key: "fabricantes", label: "Fabricantes", singular: "Fabricante" },
  { key: "ntos", label: "NTOs", singular: "NTO" },
  { key: "setores", label: "Setores", singular: "Setor" },
];

export default function CadastrosPage() {
  const { usuario } = useAuth();
  const podeGerenciar = isCoordenador(usuario);
  const [activeTab, setActiveTab] = useState<CadastroTipo>("equipamentos");
  const list = useList<CatalogoItem>(`/cadastros/${activeTab}`);
  const aba = abas.find((item) => item.key === activeTab) ?? abas[0];
  const [modal, setModal] = useState<null | { id?: string; nome: string }>(null);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  function abrirNovo() {
    setErro("");
    setModal({ nome: "" });
  }

  function abrirEdicao(item: CatalogoItem) {
    setErro("");
    setModal({ id: item.id, nome: item.nome });
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!modal?.nome.trim()) {
      setErro("Informe o nome.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      if (modal.id) {
        await apiSend("PATCH", `/cadastros/${activeTab}/${modal.id}`, { nome: modal.nome.trim() });
      } else {
        await apiSend("POST", `/cadastros/${activeTab}`, { nome: modal.nome.trim() });
      }
      setModal(null);
      list.reload();
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: string) {
    if (!window.confirm(`Excluir este ${aba.singular.toLowerCase()}?`)) return;
    setErro("");
    try {
      await apiSend("DELETE", `/cadastros/${activeTab}/${id}`);
      list.reload();
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    }
  }

  const mensagem = modal ? "" : erro || list.erro;

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <h1>Cadastros Gerais</h1>
          <p>Gerencie equipamentos, fabricantes, NTOs e setores</p>
        </div>
        {podeGerenciar && (
          <div className={s.headerActions}>
            <button type="button" className={s.btnPrimary} onClick={abrirNovo}>
              <HiOutlinePlus /> Novo Cadastro
            </button>
          </div>
        )}
      </div>

      <div className={s.tabs}>
        {abas.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={activeTab === tab.key ? s.tabActive : s.tab}
            onClick={() => {
              setActiveTab(tab.key);
              list.setQ("");
              setErro("");
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Erro texto={mensagem} />

      <div className={s.card}>
        <div className={s.searchBar}>
          <HiOutlineMagnifyingGlass className={s.searchIcon} />
          <input
            placeholder={`Pesquisar ${aba.label.toLowerCase()}...`}
            value={list.q}
            onChange={(e) => list.setQ(e.target.value)}
          />
        </div>

        <div className={s.tableWrapper}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Criado Em</th>
                <th>Criado Por</th>
                {podeGerenciar && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {list.loading && (
                <tr>
                  <td colSpan={podeGerenciar ? 5 : 4} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "32px 16px" }}>
                    Carregando...
                  </td>
                </tr>
              )}
              {!list.loading && list.items.length === 0 && (
                <tr>
                  <td colSpan={podeGerenciar ? 5 : 4} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "32px 16px" }}>
                    Nenhum cadastro encontrado
                  </td>
                </tr>
              )}
              {!list.loading && list.items.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.codigo}</td>
                  <td>{item.nome}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{formatDate(item.criadoEm)}</td>
                  <td>{item.criadoPor || "—"}</td>
                  {podeGerenciar && (
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button type="button" className={s.iconBtn} title="Editar" onClick={() => abrirEdicao(item)}><HiOutlinePencilSquare /></button>
                        <button type="button" className={s.iconBtn} title="Excluir" onClick={() => excluir(item.id)}><HiOutlineTrash /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager page={list.page} pageSize={list.pageSize} total={list.total} onPage={list.setPage} />
      </div>

      {modal && (
        <div className={s.modalOverlay} onClick={() => setModal(null)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={s.modalTitle}>{modal.id ? "Editar" : "Novo"} {aba.singular}</h2>
            <form onSubmit={salvar}>
              <div className={s.formGrid}>
                <div className={s.formGroup}>
                  <label className={s.formLabel} htmlFor="nome">Nome</label>
                  <input
                    id="nome"
                    className={s.formInput}
                    placeholder={`Nome do ${aba.singular.toLowerCase()}`}
                    value={modal.nome}
                    onChange={(e) => setModal({ ...modal, nome: e.target.value })}
                  />
                </div>
              </div>
              <Erro texto={erro} />
              <div className={s.formActions}>
                <button type="button" className={s.btnSecondary} onClick={() => setModal(null)}>Cancelar</button>
                <button type="submit" className={s.btnPrimary} disabled={salvando}>{salvando ? "Salvando..." : "Salvar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
