---
name: valis-visual
description: Padrão visual do sistema Valis (valis-app, Next.js + CSS Modules). Use sempre que for criar ou alterar qualquer tela, página, modal, formulário, tabela, card, botão, badge, componente ou CSS no valis-app, mesmo que o pedido não fale em "visual" ou "design" (ex.: "cria a tela de lotes", "adiciona um filtro na rastreabilidade", "faz um modal para editar usuário", "ajusta o layout do perfil"). Garante que tudo use os tokens de globals.css e as classes de styles/shared.module.css, os ícones e toasts do projeto, e que o código tocado seja limpo de estilos inline e CSS duplicado.
---

# Padrão visual do Valis

O Valis é um sistema interno de laboratório (setores como imuno e hemato) com visual limpo: fundo verde-acinzentado claro, cards brancos, verde-escuro `#075618` como cor da marca, fonte Roboto (via `next/font` em `lib/fonte.ts`, token `--font-sans`), textos em português. A meta desta skill é que qualquer tela nova pareça ter sido feita pela mesma pessoa que fez as outras — e que o código visual fique num lugar só, para que mudar uma cor ou um botão no futuro seja mexer em um arquivo, não em vinte.

## Fontes da verdade (leia antes de escrever CSS)

| Arquivo | O que tem |
|---|---|
| `valis-app/app/globals.css` | Tokens em `:root` (cores, sombras, raios, transições, largura da sidebar) e estilos dos toasts |
| `valis-app/styles/shared.module.css` | A biblioteca de componentes: página, header, botões, card, tabela, badges, formulário, busca, estado vazio, modal, abas, botão de ícone, menu de ações |
| `valis-app/app/[setor]/(dashboard)/cadastros/page.tsx` | Página de referência: header + abas + card com busca + tabela + paginação + modal de formulário |
| `valis-app/lib/badges.ts` | `classeSituacao(situacao)` → classe de badge para status e perfis |
| `valis-app/lib/notificar.tsx` | `notificar.sucesso/erro/aviso/info` e `confirmar(texto)` |

Leia `shared.module.css` inteiro antes de criar classes novas — ele muda, e esta skill pode estar desatualizada em relação a ele. O catálogo com os trechos JSX prontos está em `references/catalogo.md`; consulte quando for montar uma tela.

## Regras

### 1. Use o que já existe antes de criar
Importe a biblioteca compartilhada como `s`:

```tsx
import s from "@/styles/shared.module.css";
```

Para botões, cards, tabelas, formulários, modais, abas, badges, busca e estado vazio, use as classes de `s`. Só crie classe nova quando nada ali serve.

### 2. Onde colocar classe nova
- **Vai ser útil em mais de uma tela** (ex.: um grid de estatísticas, uma linha de filtros, um rodapé de paginação) → adicione em `styles/shared.module.css`, na seção do assunto, com nome em camelCase.
- **Só faz sentido nesta tela** → crie/edite o `.module.css` ao lado da página (ex.: `perfil/perfil.module.css`) e importe como `styles` (mantendo `s` para o compartilhado).
- Nunca copie uma classe do shared para um módulo local (o `dashboard/page.module.css` fez isso com header, botões, card, tabela — é o exemplo do que evitar).

### 3. Sem `style={{...}}`
Estilo inline espalha decisões visuais pelo JSX e não acompanha mudanças nos tokens. Crie uma classe. A exceção é valor que só existe em tempo de execução: posição calculada (`top`/`left` de um menu flutuante), largura de uma barra de progresso, cor vinda do banco. Nesses casos, inline só com a propriedade dinâmica.

### 4. Sempre tokens, nunca valores soltos
Cores, sombras, raios e transições vêm das variáveis de `:root`:
- Texto: `--text-primary`, `--text-secondary`, `--text-muted`
- Fundo: `--bg-primary` (página), `--bg-secondary`/`--bg-card` (cards, modais), `--bg-input`
- Marca: `--accent-blue` e `--accent-blue-hover` — **apesar do nome, são o verde da marca** (`#075618`). O nome ficou por compatibilidade; use-os para a cor principal. `--gradient-blue` é o gradiente verde do botão primário.
- Status: `--accent-green`, `--accent-yellow`, `--accent-red`, `--accent-purple`, `--accent-cyan`
- Bordas: `--border-color`, `--border-color-hover`
- `--shadow-sm|md|lg`, `--radius-sm|md|lg|xl`, `--transition-fast|normal|slow`

Fundos suaves de status seguem o padrão já usado: a cor com alfa 0.08–0.12 (ex.: `rgba(239, 68, 68, 0.12)` para vermelho). Se precisar de uma cor que não existe, adicione um token em `globals.css` em vez de escrever o hex no módulo.

### 5. Escala tipográfica
Não invente tamanhos; siga a escala que já está no sistema:
- Título da página (`h1` no `.headerLeft`): 28px / 700
- Título de modal: 20px / 700 · título de card: 16px / 600
- Corpo, inputs: 14px · células de tabela, botões, abas: 13px · botão pequeno, legendas: 12px
- Cabeçalho de tabela e rótulo de formulário: 11–12px / 600, MAIÚSCULAS, `letter-spacing` 0.04–0.06em
- Badge: 11px / 600

Espaçamentos: múltiplos de 4 (4, 8, 12, 16, 20, 24, 32). Cards com `padding: 24px`, header da página com `margin-bottom: 32px`.

### 6. Estrutura de página
Toda página do dashboard segue o esqueleto `s.page` → `s.header` (`s.headerLeft` com `h1` + `p` de subtítulo, `s.headerActions` com os botões) → conteúdo em `s.card`. O layout (`(dashboard)/layout.module.css`) já cuida da sidebar e do padding externo — não adicione margem lateral na página.

### 7. Ícones
`react-icons/hi2`, variante Outline (`HiOutlinePlus`, `HiOutlineTrash`, `HiOutlinePencilSquare`, `HiOutlineMagnifyingGlass`...). Ícone dentro de botão vai antes do texto. Botão só de ícone usa `s.iconBtn` e precisa de `title` ou `aria-label`.

### 8. Feedback ao usuário
- Mensagens de sucesso/erro: `notificar.sucesso(...)` / `notificar.erro(mensagemErro(e))`. Não use `alert`, nem texto de erro solto na tela para resultado de ação.
- Confirmação destrutiva: `await confirmar("Excluir este X?")`. Não use `window.confirm`.
- Erro de campo: `aria-invalid="true"` no input (o `.formInput` já pinta a borda de vermelho).
- Carregando / vazio em tabela: uma linha com `colSpan` e texto "Carregando..." / "Nenhum X encontrado" (com classe, não inline). Fora de tabela, use `s.emptyState`.
- Botão de submit desabilitado e com texto "Salvando..." enquanto salva.

### 9. Status com badge
Para status de OS/lote e perfis de usuário, use `classeSituacao()` de `lib/badges.ts`. Status novo → adicione o `case` lá, em vez de escolher a cor na página.

### 10. Responsivo
O breakpoint do sistema é `@media (max-width: 768px)`. Grids com `repeat(auto-fill, minmax(...))` já se adaptam; tabelas ficam dentro de `s.tableWrapper` para rolar na horizontal.

### 11. Textos
Em português, com acento, frases curtas. Botões com verbo ("Salvar", "Novo Cadastro", "Excluir"). Placeholders com exemplo ("Ex: 10,50").

## Limpeza ao tocar em código existente

Quando a tarefa mexe numa tela que foge do padrão, arrume **o trecho que você está tocando** — não a tela inteira, para manter o diff revisável:
- `style={{...}}` estático no trecho → vira classe (shared ou módulo local, pela regra 2).
- Classe local que duplica uma do shared (mesmo nome e mesmo efeito) → troque pelo `s.xxx` e apague a duplicata do módulo se ninguém mais usar.
- Hex/rgba solto que corresponde a um token → troque pela variável.

Se perceber uma inconsistência maior fora do escopo (ex.: o módulo inteiro do dashboard duplicado), não refatore por conta própria: mencione no final da resposta como sugestão.

## Checklist antes de entregar
- [ ] Nenhum `style={{` novo, exceto valores dinâmicos
- [ ] Nenhuma cor/sombra/raio em valor literal fora de `globals.css`
- [ ] Classes existentes do shared foram reaproveitadas; nada copiado dele
- [ ] Ícones de `react-icons/hi2` Outline, botões de ícone com `title`/`aria-label`
- [ ] Feedback via `notificar`/`confirmar`, estados de carregando e vazio presentes
- [ ] Textos em português
