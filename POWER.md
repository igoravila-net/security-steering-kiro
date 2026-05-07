---
name: "security-steering-kiro"
displayName: "COGNA Security Guardrails"
description: "Framework completo de segurança para desenvolvimento seguro no Grupo COGNA. Inclui 40+ regras baseadas em OWASP, políticas corporativas e LGPD, com exemplos em todas as linguagens homologadas."
keywords: ["segurança", "security", "owasp", "cogna", "lgpd", "vulnerabilidade", "appsec", "devsecops"]
author: "Segurança da Informação - Grupo COGNA"
---

# COGNA Security Guardrails

**Versão:** 1.0.0  
**Autor:** Segurança da Informação - Grupo COGNA  
**Última atualização:** Maio/2026

![COGNA](icon.png)

## Overview

Framework automatizado de segurança para desenvolvimento seguro no Grupo COGNA. Garante que todo código produzido esteja em conformidade com as políticas corporativas, OWASP Top 10, LGPD e melhores práticas de mercado.

Linguagens cobertas: C#, Java, TypeScript, JavaScript, HTML, CSS/SCSS, Swift, Kotlin, Python, JSON, AVRO, YAML, HCL, PowerShell e Bash/Shell.

## Princípios Fundamentais

1. **Todo input é malicioso** — Limite de caracteres + sanitização obrigatória
2. **Credenciais nunca no código** — Sempre via cofre PAM / vault
3. **Menor privilégio** — Apenas permissões mínimas necessárias
4. **Defesa em profundidade** — Múltiplas camadas de proteção
5. **Segurança por design** — Incorporada desde o início

## Available Steering Files

### Regras Fundamentais
- **input-malicioso** — Todo input é malicioso: limites, sanitização, validação
- **scaffolding-seguro** — Padrões seguros por default ao criar componentes
- **checklist-pre-pr** — Checklist de Security Champion antes de PR
- **erros-comuns-linguagem** — Erros mais frequentes por linguagem

### Vulnerabilidades OWASP
- **xss** — Cross-Site Scripting multilinguagem
- **crlf-injection** — CRLF Injection
- **criptografia** — Cryptographic Issues
- **information-leakage** — Information Leakage
- **credentials-traversal** — Credentials e Directory Traversal
- **code-injection-sql** — Code/SQL/Command Injection
- **authorization-quality** — Authorization, Encapsulation, Code Quality
- **config-backdoor** — Deployment, Backdoor, Time and State

### APIs e Autenticação
- **api-guardrails** — OWASP API Security Top 10
- **oauth2-oidc** — OAuth2, OIDC, JWT, PKCE

### Políticas Corporativas
- **politica-geral** — Política Geral de SI
- **classificacao** — Classificação da Informação
- **cofre-senhas** — PAM
- **acessos-logicos** — Gestão de Acessos
- **incidentes** — Gestão de Incidentes
- **vulnerabilidades** — Gestão de Vulnerabilidades
- **desenvolvimento-seguro** — SSDLC
- **ia-segura** — IA Segura
- **nuvem** — Segurança em Nuvem
- **lgpd** — LGPD e Dados Sensíveis

### Condicionais (por tipo de arquivo)
- **condicional-controllers** — Ativado em controllers/APIs
- **condicional-repositories** — Ativado em repositories/SQL
- **condicional-templates** — Ativado em templates/views
- **condicional-infra** — Ativado em Terraform/Docker/K8s

## SLAs de Correção

| Criticidade | Prazo |
|---|---|
| Crítica (CVSS 9.0+) | 1 semana |
| Alta (CVSS 7.0-8.9) | 15 dias |
| Média (CVSS 4.0-6.9) | 1 mês |
| Baixa (CVSS 0.1-3.9) | 6 meses |

## Referências

- OWASP Top 10 / API Security Top 10
- ISO 27001:2022, ISO 42001:2024
- NIST CSF, CIS Controls
- LGPD (Lei 13.709/2018)
- Políticas do Grupo COGNA
