---
name: "security-steering-kiro"
displayName: "COGNA Security Guardrails"
version: "2.1.0"
description: "v2.1.0 - Framework completo de segurança para desenvolvimento seguro no Grupo COGNA. Inclui 50+ regras baseadas em OWASP, políticas corporativas e LGPD, com exemplos em todas as linguagens homologadas."
keywords: ["segurança", "security", "owasp", "cogna", "lgpd", "vulnerabilidade", "appsec", "devsecops"]
author: "Segurança da Informação - Grupo COGNA"
---

# COGNA Security Guardrails

Framework automatizado de segurança para desenvolvimento seguro no Grupo COGNA. Garante conformidade com políticas corporativas, OWASP Top 10, LGPD e melhores práticas de mercado.

Linguagens cobertas: C#, Java, PHP, TypeScript, JavaScript, HTML, Swift, Kotlin, Python, YAML, HCL, PowerShell e Bash/Shell.

## Execução Automática

Todas as regras deste Power são aplicadas automaticamente em toda geração de código. Código inseguro é corrigido antes de ser apresentado ao desenvolvedor.

Princípios fundamentais:
1. Todo input é malicioso — limite + sanitização obrigatória
2. Credenciais nunca no código — sempre via vault/env
3. Menor privilégio — apenas permissões mínimas
4. Defesa em profundidade — múltiplas camadas
5. Segurança por design — incorporada desde o início

## Available Steering Files

- **constraints** — Regras críticas, violações automáticas, princípios de input/sanitização, dependências seguras, supply chain security (npm, pip, Maven, NuGet) e scaffolding por default
- **implementation** — Padrões de código seguro por tipo de vulnerabilidade (injection, XSS, SSRF, crypto, auth, APIs, exceptional conditions OWASP A10:2025, LLM Top 10:2025, API Security Top 10:2023) com exemplos multilinguagem
- **validation** — Testes de segurança, checklist pré-PR, threat modeling STRIDE e métricas de compliance
- **policies** — Políticas corporativas COGNA (SI geral, LGPD, acessos, incidentes, IA segura, criptografia, cloud)
- **infrastructure** — IaC seguro (Terraform, Docker, K8s), deployment, resiliência e secrets scanning
- **observability** — Padrão de logs COGNA (GELF, CorrelationID, níveis), monitoramento e auditoria
- **conditional** — Regras ativadas por tipo de arquivo (controllers, repositories, templates, infra)

Toda a documentação conceitual está neste POWER.md. Os steering files contêm regras detalhadas com exemplos de código.

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
