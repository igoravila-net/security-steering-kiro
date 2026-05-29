# Security Guardrails Power — COGNA

**29/05/2026** | v2.4.2 | Segurança da Informação

---

## Números

| | |
|---|---|
| CWEs cobertas | 46 (Top 25 MITRE 2024 completo + 21 adicionais) |
| Linguagens | 14 (13 homologadas + PHP) |
| Políticas COGNA automatizadas | 12 |
| Proteção em código de produção | 100% |
| SCA (Supply Chain) | 5 ecossistemas — 26+ pacotes proibidos, CVE check automático |
| Correção automática | Ao criar ou editar código — sem intervenção manual |
| Observabilidade/Logs | Padrão GELF COGNA, CorrelationID, mascaramento PII |
| Hooks ativos | 26 |
| Checklist IaC dedicado | 7 itens (image pin, non-root, secrets, healthcheck, limits, ports, privileged) |

---

## Últimas atualizações (v2.4.1)

- Checklist IaC-específico no hook preToolUse write: verifica image pinning, non-root user, privileged mode, secrets em ENV/ARG, healthcheck, resource limits e port binding
- Separação de checklists: App (7 itens) e IaC (7 itens) no security-critical-paths v4
- `*.yml` removido do FAST-PATH para que docker-compose.yml seja analisado pelo checklist IaC
- STRIDE assessment pré-tarefa com fast-path SKIP para types/testes/generators
- Verificação de implementação pós-escrita cruza mitigações STRIDE com código produzido
- Git hook pre-push para auto-tagging baseado na versão do POWER.md

---

## Próximos passos

- Piloto com squads selecionados
- Métricas de adoção (hook automático coleta dados por sessão)
- Feedback loop com findings Veracode
