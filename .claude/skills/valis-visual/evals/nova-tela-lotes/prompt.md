---
tags: [skill-creator]
max_turns: 40
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

cria uma tela nova de Lotes de controle no valis-app, em app/[setor]/(dashboard)/lotes. Precisa listar os lotes (codigo, nome do lote, analito, validade, situação) com busca e paginação, usando a API /lotes, e ter um botão pra cadastrar lote novo num modal (nome, analito, validade). só coordenador pode cadastrar e excluir.
