# COGNA Security Guardrails

Framework de segurança automatizado para desenvolvimento seguro no Grupo COGNA, implementado como Kiro Power com steering files temáticos e hooks.

## Visão Geral

Este Power contém **7 steerings temáticos consolidados** e **16 hooks** que garantem que todo código produzido com auxílio do Kiro esteja em conformidade com as políticas corporativas do Grupo COGNA, OWASP Top 10, LGPD e melhores práticas de mercado.

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
| **constraints** | Regras absolutas, scaffolding seguro, input malicioso, secrets scanning, dependências proibidas, supply chain security (npm), onboarding |
| **implementation** | Injection (SQL/Code/Command), XSS, SSRF, desserialização, criptografia, autenticação, OAuth2/JWT, API security, CRLF, credentials, directory traversal, information leakage, race conditions |
| **validation** | 20 categorias de testes de segurança, checklist pré-PR, threat modeling STRIDE, métricas de compliance |
| **policies** | Política Geral SI, classificação da informação, LGPD, gestão de acessos, PAM, incidentes, vulnerabilidades, SSDLC, IA segura, criptografia em BD, cloud, fornecedores |
| **infrastructure** | Terraform, Docker, Kubernetes, Helm, deployment config, server config, resiliência, CI/CD security, anti-backdoor |
| **observability** | Níveis de log, campos GELF/COGNA, CorrelationID, implementação por linguagem, dados sensíveis em logs, logging de segurança, monitoramento |
| **conditional** | Regras ativadas por fileMatch: controllers/APIs, repositories/SQL, templates/views, infra/IaC |

## Hooks

> **Nota:** Hooks não são distribuídos automaticamente com o Power. Os steerings são o mecanismo principal de proteção. Os hooks abaixo são **recomendados** para complementar a segurança — crie-os no `.kiro/hooks/` do seu projeto.

### Recomendados para Projetos

| Hook | Trigger | Ação | Prioridade |
|---|---|---|---|
| **Revisão de Segurança em Código** v3 | `preToolUse` (write) | 3 níveis: SKIP (testes/docs) → LIGHT (domain) → FULL (I/O/auth). Cache por sessão | Alta |
| **Bloquear Segredos em Commits** v2 | `preToolUse` (shell) | Auto-aprova testes/lint/build. Verifica segredos apenas em git add/commit/push | Alta |
| **Detectar Arquivos de Secrets** | `fileCreated` + `fileEdited` | Alerta ao criar/editar .env, .pem, .key, credentials. Verifica .gitignore | Alta |
| **Revisão de Infra — Edição** | `fileEdited` (Dockerfile, *.tf, k8s) | Detecta regressões: USER root, 0.0.0.0/0, encryption desabilitada | Alta |
| **npm audit Automático** | `fileEdited` (package.json/lock) | Executa `npm audit --audit-level=moderate` automaticamente | Média |
| **Verificar Segurança de Dependências** | `fileEdited` (package.json, pom.xml, etc.) | Pesquisa CVEs via agente e sugere versões seguras | Média |
| **CORS e Security Headers** | `fileEdited` (server.*, middleware*) | Verifica CORS restritivo e headers de segurança obrigatórios | Média |
| **Scanner de Output de Shell** | `postToolUse` (shell) | Escaneia output por credenciais expostas acidentalmente | Média |
| **SAST Pós-Tarefa** | `postTaskExecution` | Revisa código contra regras de segurança após completar task | Média |
| **Sugestões Proativas** v2 | `agentStop` | Sugere melhorias apenas para código de produção com I/O | Baixa |
| **Security Review On-Demand** | `userTriggered` | Revisão completa (20 categorias) sob demanda no arquivo ativo | Baixa |

### Desenvolvimento e Manutenção do Power

| Hook | Trigger | Ação |
|---|---|---|
| **Aprender com Vulnerabilidades** v2 | `postToolUse` (write) | Registra padrões vulneráveis bloqueados (ignora testes/docs) |
| **Aprender com Dependências Inseguras** | `postToolUse` (read) | Registra bibliotecas com CVEs detectados |
| **Sincronizar Versão POWER/CHANGELOG** | `fileEdited` (CHANGELOG.md) | Atualiza versão no POWER.md |
| **Atualizar CVEs (Manual)** | `userTriggered` | Busca CVEs recentes na web (uso pelo time AppSec) |
| **Atualizar README ao Modificar Steering** | `fileEdited` (steering/*.md) | Verifica se README precisa refletir mudanças |

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
