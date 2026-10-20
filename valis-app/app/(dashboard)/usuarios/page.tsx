"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from "react-icons/hi2";
import s from "@/styles/shared.module.css";
import { isCoordenador, useAuth } from "@/components/AuthProvider/AuthProvider";
import { rotaInicial } from "@/lib/acesso";
import { apiGet, apiSend, mensagemErro } from "@/lib/api";
import { useList } from "@/lib/use-list";
import { cargoLabel, cargosAtribuiveis, emailValido, formatDate, iniciais } from "@/lib/format";
import { classeSituacao } from "@/lib/badges";
import Erro from "@/components/Erro";
import Pager from "@/components/Pager";
import { CARGOS, type Cargo, type UsuarioLista } from "@/lib/types";

export default function UsuariosPage() {
  const router = useRouter();
  const { usuario, ready } = useAuth();
  const permitido = ready && isCoordenador(usuario);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroCargo, setFiltroCargo] = useState<Cargo | "">("");
  const souAdministrador = usuario?.cargo === "Administrador";
  // Coordenador não edita nem exclui Administradores (a API responde 403).
  const podeGerir = (alvo: UsuarioLista) => souAdministrador || alvo.cargo !== "Administrador";
  const list = useList<UsuarioLista>(permitido ? "/usuarios" : null, undefined, {
    nome: filtroNome.trim() || undefined,
    cargo: filtroCargo || undefined,
  });
  const [editando, setEditando] = useState<UsuarioLista | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cargo, setCargo] = useState<Cargo | "">("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (ready && !isCoordenador(usuario)) router.replace(rotaInicial(usuario?.cargo));
  }, [ready, usuario, router]);

  async function abrirEdicao(id: string) {
    setErro("");
    try {
      const res = await apiGet<UsuarioLista>(`/usuarios/${id}`);
      setEditando(res.data);
      setNome(res.data.nome);
      setEmail(res.data.email);
      setCargo(res.data.cargo);
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    }
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!editando) return;
    if (!nome.trim() || !email.trim() || !cargo) {
      setErro("Preencha nome, e-mail e cargo.");
      return;
    }
    if (!emailValido(email)) {
      setErro("Informe um e-mail válido.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      await apiSend("PATCH", `/usuarios/${editando.id}`, {
        nome: nome.trim(),
        email: email.trim(),
        cargo,
      });
      setEditando(null);
      list.reload();
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: string) {
    if (!window.confirm("Excluir este usuário?")) return;
    setErro("");
    try {
      await apiSend("DELETE", `/usuarios/${id}`);
      list.reload();
    } catch (erroCapturado) {
      setErro(mensagemErro(erroCapturado));
    }
  }

  if (!permitido) return null;

  const mensagem = erro || list.erro;

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <h1>Usuários</h1>
          <p>Gerencie os usuários e permissões do sistema</p>
        </div>
        <div className={s.headerActions}>
          <Link href="/usuarios/novo" className={s.btnPrimary} style={{ textDecoration: "none" }}>
            <HiOutlinePlus /> Novo Usuário
          </Link>
        </div>
      </div>

      <Erro texto={editando ? "" : mensagem} />

      <div className={s.card}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
          <div className={s.searchBar} style={{ flex: 1, marginBottom: 0, minWidth: 240 }}>
            <HiOutlineMagnifyingGlass className={s.searchIcon} />
            <input
              placeholder="Pesquisar por nome, e-mail ou cargo..."
              value={list.q}
              onChange={(e) => list.setQ(e.target.value)}
            />
          </div>
          <input
            className={s.formInput}
            style={{ width: 240 }}
            placeholder="Filtrar por nome"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            aria-label="Filtrar por nome"
          />
          <select
            className={s.formSelect}
            style={{ width: 200 }}
            value={filtroCargo}
            onChange={(e) => setFiltroCargo(e.target.value as Cargo | "")}
            aria-label="Filtrar por cargo"
          >
            <option value="">Todos os cargos</option>
            {CARGOS.map((c) => (
              <option key={c} value={c}>{cargoLabel(c)}</option>
            ))}
          </select>
        </div>

        <div className={s.tableWrapper}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Cargo</th>
                <th>Criado Em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "32px 16px" }}>
                    Carregando...
                  </td>
                </tr>
              )}
              {!list.loading && list.items.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "32px 16px" }}>
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}
              {!list.loading && list.items.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.codigo}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "var(--gradient-blue)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#fff",
                        flexShrink: 0,
                      }}>
                        {iniciais(u.nome)}
                      </div>
                      {u.nome}
                    </div>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{u.email}</td>
                  <td><span className={classeSituacao(u.cargo)}>{cargoLabel(u.cargo)}</span></td>
                  <td style={{ color: "var(--text-secondary)" }}>{formatDate(u.criadoEm)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      {podeGerir(u) ? (
                        <>
                          <button type="button" className={s.iconBtn} title="Editar" onClick={() => abrirEdicao(u.id)}><HiOutlinePencilSquare /></button>
                          {u.id !== usuario?.id && (
                            <button type="button" className={s.iconBtn} title="Excluir" onClick={() => excluir(u.id)}><HiOutlineTrash /></button>
                          )}
                        </>
                      ) : (
                        <span style={{ color: "var(--text-secondary)" }} title="Somente um Administrador pode alterar outro Administrador.">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager page={list.page} pageSize={list.pageSize} total={list.total} onPage={list.setPage} />
      </div>

      {editando && (
        <div className={s.modalOverlay} onClick={() => setEditando(null)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={s.modalTitle}>Editar {editando.codigo}</h2>
            <form onSubmit={salvar}>
              <div className={s.formGrid}>
                <div className={s.formGroup}>
                  <label className={s.formLabel} htmlFor="nome">Nome</label>
                  <input id="nome" className={s.formInput} value={nome} onChange={(e) => setNome(e.target.value)} />
                </div>
                <div className={s.formGroup}>
                  <label className={s.formLabel} htmlFor="email">E-mail</label>
                  <input id="email" className={s.formInput} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className={s.formGroup}>
                  <label className={s.formLabel} htmlFor="cargo">Cargo</label>
                  <select
                    id="cargo"
                    className={s.formSelect}
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value as Cargo)}
                    disabled={editando.id === usuario?.id}
                    title={editando.id === usuario?.id ? "Não é possível alterar o próprio cargo." : undefined}
                  >
                    {cargosAtribuiveis(usuario?.cargo).map((c) => (
                      <option key={c} value={c}>{cargoLabel(c)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Erro texto={erro} />
              <div className={s.formActions}>
                <button type="button" className={s.btnSecondary} onClick={() => setEditando(null)}>Cancelar</button>
                <button type="submit" className={s.btnPrimary} disabled={salvando}>{salvando ? "Salvando..." : "Salvar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
