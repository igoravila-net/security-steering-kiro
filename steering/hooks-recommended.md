---
inclusion: manual
description: "Arquitetura de hooks recomendados em camadas. Referência para setup em novos projetos."
---

# Hooks Recomendados — Arquitetura em Camadas

> Este documento define a arquitetura de hooks do Power em 3 camadas. Use como referência ao configurar hooks em novos projetos. Nem todos os hooks são obrigatórios — escolha conforme o contexto do projeto.

---

## Camada 1: Core (obrigatórios em todo projeto)

Hooks que previnem vulnerabilidades críticas. Devem estar ativos sempre.

| Hook | Evento | Propósito |
|------|--------|-----------|
| `security-critical-paths` | preToolUse write | Checklist App (7 itens) + Checklist IaC (7 itens) com fast-path para docs/testes |
| `block-secrets-in-commits` | preToolUse shell | Bloqueia credenciais em git add/commit/push |
| `shell-output-scanner` | postToolUse shell | Detecta credenciais, deprecated e stack traces em outputs |

**Tokens estimados por sessão:** ~500 (maioria fast-path)

---

## Camada 2: Contextual (ativar conforme stack do projeto)

Hooks que agregam valor para stacks específicas. Ative apenas os relevantes.

| Hook | Evento | Quando ativar |
|------|--------|---------------|
| `infra-review-on-create` | fileCreated | Projetos com Docker, Terraform, K8s, CI/CD |
| `infra-review-on-edit` | fileEdited | Projetos com Docker, Terraform, K8s, CI/CD |
| `check-dependency-security` | fileEdited | Projetos com package.json, requirements.txt, pom.xml |
| `lgpd-data-review` | fileCreated | Projetos que processam dados pessoais (PII) |
| `cors-security-headers-check` | fileCreated | Projetos com APIs HTTP |
| `stride-pre-task-assessment` | preTaskExecution | Projetos usando specs/tasks do Kiro |
| `security-implementation-verification` | postToolUse write | Projetos usando specs/tasks do Kiro |

**Tokens estimados por sessão:** ~1000-2000 (depende da stack)

---

## Camada 3: On-demand (ativar manualmente quando necessário)

Hooks para situações específicas. Não precisam estar ativos o tempo todo.

| Hook | Evento | Quando usar |
|------|--------|-------------|
| `security-review-on-demand` | userTriggered | Review manual de segurança antes de PR |
| `veracode-cwe-mapping` | userTriggered | Mapear findings Veracode para steerings |
| `update-cves-from-web` | userTriggered | Atualizar base de CVEs conhecidos |

**Tokens estimados:** 0 (só disparam quando acionados manualmente)

---

## Camada Meta: Observabilidade (opcional, para times que querem métricas)

| Hook | Evento | Propósito |
|------|--------|-----------|
| `adoption-metrics` | agentStop | Registra métricas de uso |
| `power-feedback-collector` | agentStop | Coleta gaps reais de segurança |
| `proactive-security-suggestions` | agentStop | Sugere melhorias pós-sessão |
| `docs-before-commit` | preToolUse shell | Garante docs atualizados antes de commit |

**Tokens estimados por sessão:** ~100 (fast-path para sessões sem código)

---

## Setup Rápido por Tipo de Projeto

### API Backend (Node/Java/C#/Python)
- Camada 1 (Core): ✅ todos
- Camada 2: `check-dependency-security`, `cors-security-headers-check`, `lgpd-data-review`
- Camada 3: `security-review-on-demand`

### Frontend (React/Vue/Angular)
- Camada 1 (Core): ✅ todos
- Camada 2: `check-dependency-security`
- Camada 3: `security-review-on-demand`

### Infraestrutura (Terraform/Docker/K8s)
- Camada 1 (Core): ✅ todos
- Camada 2: `infra-review-on-create`, `infra-review-on-edit`
- Camada 3: nenhum

### Mobile (Swift/Kotlin)
- Camada 1 (Core): ✅ todos
- Camada 2: `check-dependency-security`
- Camada 3: `security-review-on-demand`

---

## Princípios de Design dos Hooks

1. **Prompts curtos** — Hooks referenciam steerings (`conforme constraints.md`) em vez de repetir regras
2. **Fast-path primeiro** — Toda resposta trivial deve ser 1 palavra (APROVADO/OK/SKIP)
3. **Sem redundância** — Se o steering já cobre, o hook só verifica compliance
4. **Camadas independentes** — Cada camada funciona sem as outras
5. **Tokens mínimos** — Meta: <3000 tokens/sessão em hooks para sessões típicas
