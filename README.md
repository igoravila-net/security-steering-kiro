# COGNA Security Guardrails

Framework de segurança automatizado para desenvolvimento seguro no Grupo COGNA, implementado como Kiro Power com steering files temáticos e hooks.

## Visão Geral

Este Power contém **7 steerings temáticos consolidados** e **4 hooks automatizados** que garantem que todo código produzido com auxílio do Kiro esteja em conformidade com as políticas corporativas do Grupo COGNA, OWASP Top 10, LGPD e melhores práticas de mercado.

## Como Funciona

Os steerings são regras carregadas automaticamente em toda interação com o Kiro. Os hooks interceptam ações específicas para validar segurança em tempo real. Código inseguro é corrigido antes de ser apresentado ao desenvolvedor.

### Princípios Fundamentais

1. **Todo input é malicioso** — Limite de caracteres + sanitização obrigatória
2. **Credenciais nunca no código** — Sempre via cofre PAM / vault
3. **Menor privilégio** — Apenas permissões mínimas necessárias
4. **Defesa em profundidade** — Múltiplas camadas de proteção
5. **Segurança por design** — Incorporada desde o início do desenvolvimento

## Estrutura

```
POWER.md                    # Overview do Power (enxuto)
steering/
  constraints.md            # Regras críticas, input, sanitização, dependências, scaffolding
  implementation.md         # Padrões de código seguro por vulnerabilidade (multilinguagem)
  validation.md             # Testes de segurança, checklist pré-PR, threat modeling
  policies.md               # Políticas corporativas COGNA (SI, LGPD, acessos, IA)
  infrastructure.md         # IaC seguro (Terraform, Docker, K8s), deployment, CI/CD
  observability.md          # Padrão de logs COGNA (GELF, CorrelationID), monitoramento
  conditional.md            # Regras por tipo de arquivo (controllers, repos, templates, infra)
```

## Steering Files

| Steering | Conteúdo |
|---|---|
| **constraints** | Regras absolutas, scaffolding seguro, input malicioso, secrets scanning, dependências proibidas, onboarding |
| **implementation** | Injection (SQL/Code/Command), XSS, SSRF, desserialização, criptografia, autenticação, OAuth2/JWT, API security, CRLF, credentials, directory traversal, information leakage, race conditions |
| **validation** | 20 categorias de testes de segurança, checklist pré-PR, threat modeling STRIDE, métricas de compliance |
| **policies** | Política Geral SI, classificação da informação, LGPD, gestão de acessos, PAM, incidentes, vulnerabilidades, SSDLC, IA segura, criptografia em BD, cloud, fornecedores |
| **infrastructure** | Terraform, Docker, Kubernetes, Helm, deployment config, server config, resiliência, CI/CD security, anti-backdoor |
| **observability** | Níveis de log, campos GELF/COGNA, CorrelationID, implementação por linguagem, dados sensíveis em logs, logging de segurança, monitoramento |
| **conditional** | Regras ativadas por fileMatch: controllers/APIs, repositories/SQL, templates/views, infra/IaC |

## Hooks Recomendados

> **Nota:** Hooks não são distribuídos automaticamente com o Power. Os steerings são o mecanismo principal de proteção. Os hooks abaixo são **recomendados** para complementar a segurança — crie-os no `.kiro/hooks/` do seu projeto.

| Hook | Trigger | Ação | Prioridade |
|---|---|---|---|
| **Revisão de Segurança em Código** | `preToolUse` (write) | Bloqueia padrões vulneráveis antes da escrita | Alta |
| **Bloquear Segredos em Commits** | `preToolUse` (shell) | Detecta API keys, tokens, senhas em git add/commit | Alta |
| **Verificar Segurança de Dependências** | `fileEdited` (package.json, pom.xml, etc.) | Pesquisa CVEs e sugere versões seguras | Média |
| **SAST Pós-Tarefa** | `postTaskExecution` | Revisa código contra regras de segurança | Média |
| **Sugestões Proativas** | `agentStop` | Sugere melhorias de segurança após gerar código | Baixa |

### Como Criar os Hooks

No seu projeto, crie arquivos `.kiro/hooks/<nome>.kiro.hook` com o formato JSON:

```json
{
  "name": "Revisão de Segurança em Código",
  "version": "1.0.0",
  "when": {
    "type": "preToolUse",
    "toolTypes": ["write"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Revise o código contra padrões de segurança proibidos..."
  }
}
```

Consulte os exemplos completos no diretório `.kiro/hooks/` deste repositório.

## Linguagens Cobertas

C#, Java, TypeScript, JavaScript, HTML, Swift, Kotlin, Python, YAML, HCL, PowerShell, Bash/Shell

## SLAs de Correção

| Criticidade | Prazo |
|---|---|
| Crítica (CVSS 9.0+) | 1 semana |
| Alta (CVSS 7.0-8.9) | 15 dias |
| Média (CVSS 4.0-6.9) | 1 mês |
| Baixa (CVSS 0.1-3.9) | 6 meses |

## Classificação da Informação

| Nível | Controles |
|---|---|
| Pública | Sem controle especial |
| Interna | Autenticação obrigatória |
| Restrita | Criptografia + RBAC + auditoria |
| Confidencial | Criptografia forte + acesso mínimo + auditoria completa |

## Manutenção

- Steerings revisados quando políticas corporativas forem atualizadas
- Hook de dependências verifica CVEs em tempo real
- Estrutura consolidada em 7 arquivos temáticos para minimizar contexto

## Referências

- OWASP Top 10 / API Security Top 10 / Cheat Sheet Series
- ISO 27001:2022, ISO 27002:2022, ISO 42001:2024
- NIST CSF, CIS Controls
- LGPD (Lei 13.709/2018)
- Políticas internas do Grupo COGNA
