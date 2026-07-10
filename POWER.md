---
name: "security-steering-kiro"
displayName: "COGNA Security Guardrails"
version: "2.4.4"
description: "v2.4.4 - Framework completo de segurança para desenvolvimento seguro no Grupo COGNA. Inclui 50+ regras baseadas em OWASP, políticas corporativas e LGPD, com exemplos em todas as linguagens homologadas. STRIDE assessment pré-tarefa, verificação de implementação pós-escrita, checklist IaC-específico no preToolUse, fast-paths otimizados."
keywords: ["segurança", "security", "owasp", "cogna", "lgpd", "vulnerabilidade", "appsec", "devsecops"]
author: "Segurança da Informação - Grupo COGNA"
---

# COGNA Security Guardrails

Framework automatizado de segurança para desenvolvimento seguro no Grupo COGNA. Garante conformidade com políticas corporativas, OWASP Top 10, LGPD e melhores práticas de mercado.

Linguagens cobertas: C#, Java, TypeScript, JavaScript, HTML, Swift, Kotlin, Python, YAML, HCL, PowerShell e Bash/Shell.
Linguagens suportadas (não homologadas): PHP (WordPress, Laravel), Go (gin, echo, fiber, net/http), Rust (actix-web, axum, rocket, warp).

## Execução Automática

Todas as regras deste Power são aplicadas automaticamente em toda geração de código. Código inseguro é corrigido antes de ser apresentado ao desenvolvedor.

Princípios fundamentais:
1. Todo input é malicioso — limite + sanitização obrigatória
2. Credenciais nunca no código — sempre via vault/env
3. Menor privilégio — apenas permissões mínimas
4. Defesa em profundidade — múltiplas camadas
5. Segurança por design — incorporada desde o início

## Available Steering Files

- **constraints** — Regras críticas, violações automáticas, princípios de input/sanitização, dependências seguras, detecção de dependências não utilizadas, supply chain security (npm, pip, Maven, NuGet), escopo de aplicação (classificação de projetos: production/internal-tool/prototype/cli-script/library) e scaffolding por default
- **implementation** *(fileMatch: código-fonte)* — Padrões de código seguro por tipo de vulnerabilidade (injection, XSS, SSRF, crypto, auth, APIs, memory safety CWE-787/125/416/119/190, exceptional conditions OWASP A10:2025, LLM Top 10:2025, API Security Top 10:2023, Go, Rust) com exemplos multilinguagem. Ativado ao editar código-fonte.
- **validation** *(fileMatch: testes)* — Testes de segurança, templates prontos (TypeScript/Java/Python/C#/PHP/Kotlin), banco de payloads, checklist pré-PR, threat modeling STRIDE e métricas de compliance. Ativado ao editar arquivos de teste.
- **policies** *(manual: #policies)* — Políticas corporativas COGNA (SI geral, LGPD, acessos, incidentes, IA segura, criptografia, cloud). Referência sob demanda.
- **infrastructure** — IaC seguro (Terraform, Docker, K8s), deployment, resiliência e secrets scanning
- **observability** *(fileMatch: código-fonte e arquivos de logging/middleware)* — Padrão de logs COGNA (GELF, CorrelationID, níveis), monitoramento, auditoria e templates de middleware CorrelationID. Ativado ao editar código-fonte ou arquivos relacionados a logging/middleware.
- **conditional** *(fileMatch: controllers/repos/templates/infra)* — Regras ativadas por tipo de arquivo com detecção de framework via SessionStart hook
- **known-limitations** *(manual: #known-limitations)* — Limitações conhecidas da plataforma Kiro que NÃO devem ser reportadas. Referência interna.
- **hooks-recommended** *(manual: #hooks-recommended)* — Arquitetura de hooks em camadas (Core/Contextual/On-demand) com JSON snippets prontos e setup por tipo de projeto
- **input-sanitizer-templates** *(manual: #input-sanitizer-templates)* — Templates de InputSanitizer para TypeScript, Java, Python e C#. Referência para garantir consistência entre projetos.

Toda a documentação conceitual está neste POWER.md. Os steering files contêm regras detalhadas com exemplos de código.

## Setup de Hooks (Obrigatório)

Após instalar o Power, peça ao agente: **"Crie os hooks de segurança recomendados"**. Os hooks abaixo devem ser criados em `.kiro/hooks/` do projeto:

### Mapeamento de Triggers Kiro

| Nome informal | Trigger oficial (PascalCase) | Matcher regex |
|---|---|---|
| preToolUse write | `PreToolUse` | `fs_write\|str_replace\|fs_append` |
| preToolUse shell | `PreToolUse` | `execute_pwsh` |
| postToolUse shell | `PostToolUse` | `execute_pwsh` |
| postToolUse write | `PostToolUse` | `fs_write\|str_replace\|fs_append` |
| fileCreated | `PostFileCreate` | (path regex) |
| fileEdited | `PostFileSave` | (path regex) |
| preTaskExecution | `PreTaskExec` | — |
| postTaskExecution | `PostTaskExec` | — |
| agentStop | `Stop` | — |
| userTriggered | `UserPromptSubmit` | (keyword regex) |

### Hooks Core (obrigatórios em todo projeto)

| Hook | Trigger | Matcher | Função |
|------|---------|---------|--------|
| `security-critical-paths` | `PreToolUse` | `fs_write\|str_replace\|fs_append` | Checklist de segurança antes de escrever código (App 7 itens + IaC 7 itens) |
| `block-secrets-in-commits` | `PreToolUse` | `execute_pwsh` | Bloqueia credenciais em git add/commit/push |
| `shell-output-scanner` | `PostToolUse` | `execute_pwsh` | Detecta credenciais e deprecated em outputs |
| `auto-fix-vulnerabilities-on-create` | `PostFileCreate` | `\.(ts\|js\|py\|java\|cs\|kt\|php\|go\|rs)$` | Corrige vulnerabilidades automaticamente ao criar arquivo |
| `auto-fix-vulnerabilities-on-edit` | `PostFileSave` | `\.(ts\|js\|py\|java\|cs\|kt\|php\|go\|rs)$` | Corrige vulnerabilidades automaticamente ao editar arquivo |

### Hooks Contextuais (ativar conforme stack)

| Hook | Trigger | Matcher | Quando usar |
|------|---------|---------|-------------|
| `infra-review-on-create` | `PostFileCreate` | `(Dockerfile\|docker-compose\|\.tf\|\.tfvars)` | Projetos com Docker/Terraform/K8s |
| `infra-review-on-edit` | `PostFileSave` | `(Dockerfile\|docker-compose\|\.tf\|\.tfvars)` | Projetos com Docker/Terraform/K8s |
| `check-dependency-security` | `PostFileSave` | `(package\.json\|requirements\|pom\.xml\|\.csproj\|composer\.json\|Cargo\.toml\|go\.mod)` | Projetos com gerenciador de deps |
| `lgpd-data-review` | `PostFileCreate` | `\.(ts\|js\|py\|java\|cs\|kt\|php\|go\|rs)$` | Projetos que processam dados pessoais |
| `cors-security-headers-check` | `PostFileCreate` | `(middleware\|server\|app\|main)\.(ts\|js\|py\|java\|cs\|go\|rs)$` | Projetos com APIs HTTP |
| `stride-pre-task-assessment` | `PreTaskExec` | — | Projetos usando specs/tasks do Kiro |
| `security-implementation-verification` | `PostToolUse` | `fs_write\|str_replace\|fs_append` | Projetos usando specs/tasks do Kiro |

### Hooks On-demand (ativar manualmente)

| Hook | Trigger | Matcher | Quando usar |
|------|---------|---------|-------------|
| `security-review-on-demand` | `UserPromptSubmit` | `security review\|revisão de segurança` | Review manual antes de PR |
| `veracode-cwe-mapping` | `UserPromptSubmit` | `veracode\|cwe\|findings` | Mapear findings Veracode |
| `update-cves-from-web` | `UserPromptSubmit` | `cve\|atualizar vulnerabilidades` | Atualizar base de CVEs |

**IMPORTANTE:** Os hooks `auto-fix-vulnerabilities-on-create` e `auto-fix-vulnerabilities-on-edit` são essenciais — sem eles, o Power detecta mas NÃO corrige vulnerabilidades automaticamente.

> Para JSON snippets completos de cada hook, consulte o steering `hooks-recommended.md`.

## SLAs de Correção

| Criticidade | Prazo |
|---|---|
| Crítica (CVSS 9.0+) | 1 semana |
| Alta (CVSS 7.0-8.9) | 15 dias |
| Média (CVSS 4.0-6.9) | 1 mês |
| Baixa (CVSS 0.1-3.9) | 6 meses |

## Referências

- OWASP Top 10:2025 / API Security Top 10:2023 / LLM Top 10:2025
- OWASP Cheat Sheet Series
- ISO 27001:2022, ISO 42001:2024
- NIST CSF, CIS Controls
- LGPD (Lei 13.709/2018)
- Políticas internas do Grupo COGNA
