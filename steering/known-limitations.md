---
inclusion: auto
description: "Limitações conhecidas da plataforma Kiro que afetam hooks. NÃO reportar como feedback."
---

# Limitações Conhecidas — NÃO Reportar

> INSTRUÇÃO PARA O AGENTE: Os comportamentos listados abaixo são limitações CONHECIDAS e ACEITAS da plataforma Kiro. Você NÃO DEVE reportá-los como problemas, gaps, feedbacks ou sugestões de melhoria. Eles NÃO são bugs do Power. Ignore-os silenciosamente.

---

## Comportamentos que NÃO são problemas (NUNCA reportar)

### 1. Hook dispara múltiplas vezes para o mesmo arquivo/comando na sessão

O Kiro não tem cache de hooks por sessão. Cada tool call dispara hooks independentemente. Se o mesmo arquivo (.kiro/tasks.md, CHANGELOG.md, etc.) for escrito 10 vezes, o hook dispara 10 vezes. A resposta será sempre "APROVADO" ou "OK". Isso é NORMAL e ESPERADO.

**NÃO sugerir:** cache, deduplicação, "já classificado anteriormente", ou qualquer otimização de frequência de disparo.

### 2. Hook preToolUse shell intercepta comandos já aprovados

Comandos como `npx vitest run`, `git status`, `tsc` serão interceptados toda vez que executados. A whitelist no prompt acelera a resposta mas NÃO suprime o disparo. Isso é NORMAL.

**NÃO sugerir:** "deveria lembrar que já aprovou", "cache de comandos", ou "suprimir após primeira aprovação".

### 3. Hook postToolUse write dispara para .md, .json, .kiro.hook

O campo `when.toolTypes: ["write"]` não filtra por path. O hook dispara para TODAS as escritas. A SKIP list no prompt resolve com resposta mínima ("OK"). Isso é NORMAL.

**NÃO sugerir:** "não deveria disparar para docs", "filtrar por path no when", ou "excluir .md do hook".

### 4. Múltiplos hooks disparam em paralelo quando tasks completam juntas

Quando 3 tasks completam simultaneamente, hooks `agentStop` e `postTaskExecution` disparam 6 vezes (2 × 3). Cada disparo é independente. Isso é NORMAL.

**NÃO sugerir:** "deduplicar hooks em batch", "agrupar disparos", ou "executar uma vez por turno".

### 5. Respostas triviais consomem tokens

Hooks com resposta "APROVADO", "OK", "Sem feedback.", "Sem métricas.", "Sem sugestões." consomem tokens mínimos. Isso é o custo operacional dos hooks e é ACEITO.

**NÃO sugerir:** "reduzir número de hooks", "desabilitar hooks para docs", ou "economizar tokens".

### 6. meta.json EPERM no Windows/WSL

`task_update` pode falhar com EPERM quando o arquivo está locked pelo Windows. Isso é um issue do Kiro/Windows, não do Power.

**NÃO reportar** como bug ou sugerir workarounds.

### 7. Hook de observabilidade responde SKIP para domain/testes

O hook `security-implementation-verification` (postToolUse write) responde "SKIP → OK" para paths fora de `src/application/**` e `src/infrastructure/**`. Isso é o comportamento CORRETO do fast-path.

**NÃO reportar** como "hook desnecessário" ou "deveria não disparar".

---

## Resumo: Regra de ouro para feedback

Só reporte como problema se:
- Um risco REAL de segurança passou sem detecção (credencial, SQL injection, XSS)
- Um hook BLOQUEOU código que era seguro (falso positivo real, não apenas interceptou)
- Um padrão novo de ataque/vulnerabilidade deveria ser adicionado à cobertura

Tudo relacionado a frequência de disparo, tokens consumidos, ou respostas triviais é limitação CONHECIDA e ACEITA. Ignore silenciosamente.
