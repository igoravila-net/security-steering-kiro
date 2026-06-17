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
Linguagens suportadas (não homologadas): PHP (WordPress, Laravel).

## Execução Automática

Todas as regras deste Power são aplicadas automaticamente em toda geração de código. Código inseguro é corrigido antes de ser apresentado ao desenvolvedor.

Princípios fundamentais:
1. Todo input é malicioso — limite + sanitização obrigatória
2. Credenciais nunca no código — sempre via vault/env
3. Menor privilégio — apenas permissões mínimas
4. Defesa em profundidade — múltiplas camadas
5. Segurança por design — incorporada desde o início

## Available Steering Files

- **constraints** — Regras críticas, violações automáticas, princípios de input/sanitização, dependências seguras, detecção de dependências não utilizadas, supply chain security (npm, pip, Maven, NuGet) e scaffolding por default
- **implementation** — Padrões de código seguro por tipo de vulnerabilidade (injection, XSS, SSRF, crypto, auth, APIs, memory safety CWE-787/125/416/119/190, exceptional conditions OWASP A10:2025, LLM Top 10:2025, API Security Top 10:2023) com exemplos multilinguagem
- **validation** — Testes de segurança, templates prontos (TypeScript/Java/Python/C#/PHP/Kotlin), banco de payloads, checklist pré-PR, threat modeling STRIDE e métricas de compliance
- **policies** — Políticas corporativas COGNA (SI geral, LGPD, acessos, incidentes, IA segura, criptografia, cloud)
- **infrastructure** — IaC seguro (Terraform, Docker, K8s), deployment, resiliência e secrets scanning
- **observability** — Padrão de logs COGNA (GELF, CorrelationID, níveis), monitoramento e auditoria
- **conditional** — Regras ativadas por tipo de arquivo (controllers, repositories, templates, infra)
- **known-limitations** — Limitações conhecidas da plataforma Kiro que NÃO devem ser reportadas como feedback (auto-inclusion)
- **hooks-recommended** — Arquitetura de hooks em camadas (Core/Contextual/On-demand) com setup por tipo de projeto (manual)

Toda a documentação conceitual está neste POWER.md. Os steering files contêm regras detalhadas com exemplos de código.

## Setup de Hooks (Obrigatório)

Após instalar o Power, peça ao agente: **"Crie os hooks de segurança recomendados"**. Os hooks abaixo devem ser criados em `.kiro/hooks/` do projeto:

### Hooks Core (obrigatórios em todo projeto)

| Hook | Evento | Função |
|------|--------|--------|
| `security-critical-paths` | preToolUse write | Checklist de segurança antes de escrever código (App 7 itens + IaC 7 itens) |
| `block-secrets-in-commits` | preToolUse shell | Bloqueia credenciais em git add/commit/push |
| `shell-output-scanner` | postToolUse shell | Detecta credenciais e deprecated em outputs |
| `auto-fix-vulnerabilities-on-create` | fileCreated | Corrige vulnerabilidades automaticamente ao criar arquivo |
| `auto-fix-vulnerabilities-on-edit` | fileEdited | Corrige vulnerabilidades automaticamente ao editar arquivo |

### Hooks Contextuais (ativar conforme stack)

| Hook | Evento | Quando usar |
|------|--------|-------------|
| `infra-review-on-create` | fileCreated | Projetos com Docker/Terraform/K8s |
| `infra-review-on-edit` | fileEdited | Projetos com Docker/Terraform/K8s |
| `check-dependency-security` | fileEdited | Projetos com package.json/requirements.txt/pom.xml |
| `check-dependency-security-on-create` | fileCreated | Projetos com package.json/composer.json/requirements.txt/pom.xml |
| `lgpd-data-review` | fileCreated | Projetos que processam dados pessoais |
| `cors-security-headers-check` | fileCreated | Projetos com APIs HTTP |
| `stride-pre-task-assessment` | preTaskExecution | Projetos usando specs/tasks do Kiro |
| `security-implementation-verification` | postToolUse write | Projetos usando specs/tasks do Kiro |

### Hooks On-demand (ativar manualmente)

| Hook | Evento | Quando usar |
|------|--------|-------------|
| `security-review-on-demand` | UserPromptSubmit | Review manual antes de PR |
| `veracode-cwe-mapping` | UserPromptSubmit | Mapear findings Veracode |
| `update-cves-from-web` | UserPromptSubmit | Atualizar base de CVEs |

**IMPORTANTE:** Os hooks `auto-fix-vulnerabilities-on-create` e `auto-fix-vulnerabilities-on-edit` são essenciais — sem eles, o Power detecta mas NÃO corrige vulnerabilidades automaticamente.

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
