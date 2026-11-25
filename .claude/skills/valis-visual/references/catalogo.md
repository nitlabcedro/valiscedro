# Catálogo de componentes do Valis

Trechos prontos usando `styles/shared.module.css` (importado como `s`). Confira no arquivo se a classe ainda existe antes de usar; se o arquivo mudou, ele vale mais que este catálogo.

## Sumário
1. Esqueleto de página
2. Botões
3. Abas
4. Card com busca, tabela e paginação
5. Badges de status
6. Ações por linha (ícones ou menu)
7. Modal com formulário
8. Estado vazio
9. Cards de estatística
10. Classes que ainda não existem

---

## 1. Esqueleto de página

```tsx
"use client";

import { HiOutlinePlus } from "react-icons/hi2";
import s from "@/styles/shared.module.css";

export default function LotesPage() {
  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <h1>Lotes</h1>
          <p>Acompanhe os lotes de controle do setor</p>
        </div>
        <div className={s.headerActions}>
          <button type="button" className={s.btnPrimary}>
            <HiOutlinePlus /> Novo Lote
          </button>
        </div>
      </div>

      <div className={s.card}>{/* conteúdo */}</div>
    </div>
  );
}
```

`s.page` já tem a animação de entrada (`fadeIn`). Ações que dependem de permissão ficam dentro de `{podeGerenciar && (...)}`.

## 2. Botões

| Classe | Uso |
|---|---|
| `s.btnPrimary` | Ação principal da tela/modal (gradiente verde). Uma por contexto. |
| `s.btnSecondary` | Cancelar, voltar, paginação, ações neutras |
| `s.btnDanger` | Ação destrutiva visível (fundo vermelho suave) |
| `s.btnSmall` | Combine com outro: `` className={`${s.btnSecondary} ${s.btnSmall}`} `` |
| `s.iconBtn` | Botão só de ícone (34×34), sempre com `title` |

## 3. Abas

```tsx
<div className={s.tabs}>
  {abas.map((tab) => (
    <button
      key={tab.key}
      type="button"
      className={ativa === tab.key ? s.tabActive : s.tab}
      onClick={() => setAtiva(tab.key)}
    >
      {tab.label}
    </button>
  ))}
</div>
```

## 4. Card com busca, tabela e paginação

```tsx
<div className={s.card}>
  <div className={s.searchBar}>
    <HiOutlineMagnifyingGlass className={s.searchIcon} />
    <input placeholder="Pesquisar lotes..." value={list.q} onChange={(e) => list.setQ(e.target.value)} />
  </div>

  <div className={s.tableWrapper}>
    <table className={s.table}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Situação</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {list.loading && (
          <tr><td colSpan={4} className={s.tableMensagem}>Carregando...</td></tr>
        )}
        {!list.loading && list.items.length === 0 && (
          <tr><td colSpan={4} className={s.tableMensagem}>Nenhum lote encontrado</td></tr>
        )}
        {!list.loading && list.items.map((item) => (
          <tr key={item.id}>
            <td className={s.cellDestaque}>{item.codigo}</td>
            <td>{item.nome}</td>
            <td><span className={classeSituacao(item.situacao)}>{item.situacao}</span></td>
            <td>{/* ações, ver seção 6 */}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  <Pager page={list.page} pageSize={list.pageSize} total={list.total} onPage={list.setPage} />
</div>
```

- `useList` (`@/lib/use-list`) dá `items`, `loading`, `q/setQ`, `page/setPage`, `pageSize`, `total`, `reload`.
- `Pager` vem de `@/components/Pager` e some sozinho quando cabe em uma página.
- Valor ausente na célula: `"—"`. Datas: `formatDate` de `@/lib/format`.
- Linha de agrupamento: `<tr className={s.groupRow}>`.
- `tableMensagem` e `cellDestaque` ainda não existem: veja a seção 10.

## 5. Badges de status

```tsx
import { classeSituacao } from "@/lib/badges";

<span className={classeSituacao(os.situacao)}>{os.situacao}</span>
```

Cores disponíveis direto: `s.badgeGreen` (aprovado/fechado), `s.badgeRed` (rejeitado/vencido), `s.badgeYellow` (em andamento/próximo do vencimento), `s.badgeBlue` (aberto), `s.badgePurple` (coordenador/admin), `s.badge` (neutro). Status novo → `case` novo em `lib/badges.ts`.

## 6. Ações por linha

Até 2 ações: botões de ícone lado a lado.

```tsx
<div className={s.acoesLinha}>
  <button type="button" className={s.iconBtn} title="Editar" onClick={() => abrirEdicao(item)}><HiOutlinePencilSquare /></button>
  <button type="button" className={s.iconBtn} title="Excluir" onClick={() => excluir(item.id)}><HiOutlineTrash /></button>
</div>
```

3 ou mais: `MenuAcoes` (`@/components/MenuAcoes`), que abre um menu flutuante.

```tsx
<MenuAcoes acoes={[
  { rotulo: "Editar", icone: <HiOutlinePencilSquare />, onClick: () => abrirEdicao(item) },
  { rotulo: "Duplicar", icone: <HiOutlineDocumentDuplicate />, onClick: () => duplicar(item) },
  { rotulo: "Excluir", icone: <HiOutlineTrash />, onClick: () => excluir(item.id), perigo: true },
]} />
```

Exclusão sempre com `if (!(await confirmar("Excluir este lote?"))) return;`.

## 7. Modal com formulário

```tsx
{modal && (
  <div className={s.modalOverlay} onClick={() => setModal(null)}>
    <div className={s.modal} onClick={(e) => e.stopPropagation()}>
      <h2 className={s.modalTitle}>{modal.id ? "Editar" : "Novo"} Lote</h2>
      <form onSubmit={salvar}>
        <div className={s.formGrid}>
          <div className={s.formGroup}>
            <label className={s.formLabel} htmlFor="nome">Nome</label>
            <input id="nome" className={s.formInput} placeholder="Nome do lote" value={modal.nome}
              onChange={(e) => setModal({ ...modal, nome: e.target.value })} />
          </div>
          <div className={s.formGroup}>
            <label className={s.formLabel} htmlFor="tipo">Tipo</label>
            <select id="tipo" className={s.formSelect} value={modal.tipo}
              onChange={(e) => setModal({ ...modal, tipo: e.target.value })}>
              <option value="">Selecione</option>
            </select>
          </div>
          <div className={s.formGroup}>
            <label className={s.formLabel} htmlFor="obs">Observação</label>
            <textarea id="obs" className={s.formTextarea} />
          </div>
        </div>
        <div className={s.formActions}>
          <button type="button" className={s.btnSecondary} onClick={() => setModal(null)}>Cancelar</button>
          <button type="submit" className={s.btnPrimary} disabled={salvando}>{salvando ? "Salvando..." : "Salvar"}</button>
        </div>
      </form>
    </div>
  </div>
)}
```

- Validação: `notificar.erro("Informe o nome.")` no submit e/ou `aria-invalid` no campo.
- Select de catálogo (equipamentos, analitos...): veja `@/components/CatalogSelect` e `@/lib/use-catalogos`.
- Campo de senha: `@/components/CampoSenha`.

## 8. Estado vazio (fora de tabela)

```tsx
<div className={s.emptyState}>
  <HiOutlineInbox className={s.emptyIcon} />
  <h3 className={s.emptyTitle}>Nenhum lote ainda</h3>
  <p className={s.emptyText}>Crie o primeiro lote para começar a acompanhar os controles.</p>
</div>
```

## 9. Cards de estatística

Hoje vivem em `app/[setor]/(dashboard)/dashboard/page.module.css` (`statsGrid`, `statCard` + `statCardBlue|Green|Yellow|Red`, `statIcon*`, `statValue`, `statLabel`). Se outra tela precisar deles, mova essas classes para o `shared.module.css` (e ajuste o dashboard para usá-las de lá) em vez de copiar.

## 10. Classes que ainda não existem

Padrões que hoje estão como `style={{...}}` repetido nas páginas. Na primeira vez que precisar de um deles, crie no `shared.module.css` com estes nomes e use daí em diante:

```css
/* Linha de "Carregando..." / "Nenhum X encontrado" na tabela */
.tableMensagem {
  text-align: center;
  color: var(--text-secondary);
  padding: 32px 16px;
}

/* Primeira coluna (código/ID) em negrito */
.cellDestaque {
  font-weight: 600;
}

/* Texto secundário em célula (datas, autor) */
.cellSecundaria {
  color: var(--text-secondary);
}

/* Grupo de botões de ícone numa célula */
.acoesLinha {
  display: flex;
  gap: 4px;
}
```

Antes de criar, procure no `shared.module.css`: alguém pode já ter criado.
