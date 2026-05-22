# COGNA Security Guardrails

Framework de segurança automatizado para desenvolvimento seguro no Grupo COGNA, implementado como Kiro Power com steering files temáticos e hooks.

## Visão Geral

Este Power contém **7 steerings temáticos consolidados** e **21 hooks** que garantem que todo código produzido com auxílio do Kiro esteja em conformidade com as políticas corporativas do Grupo COGNA, OWASP Top 10, LGPD e melhores práticas de mercado.

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
| **constraints** | Regras absolutas, scaffolding seguro, input malicioso, secrets scanning, dependências proibidas, detecção de dependências não utilizadas, supply chain security (npm, pip, Maven, NuGet), onboarding |
| **implementation** | Injection (SQL/Code/Command), XSS, SSRF, desserialização, criptografia, autenticação, OAuth2/JWT, API security, CRLF, credentials, directory traversal, information leakage, race conditions, memory safety (CWE-787/125/416/119/190 — buffer overflow, use-after-free, integer overflow em C#/Node.js/Java), exceptional conditions (OWASP A10:2025), LLM Top 10:2025, API Security Top 10:2023 expandido, PHP (Laravel/Symfony/WordPress) |
| **validation** | 20 categorias de testes de segurança, templates prontos (TypeScript/Java/Python/C#/PHP/Kotlin), banco de payloads, checklist pré-PR, threat modeling STRIDE, métricas de compliance |
| **policies** | Política Geral SI, classificação da informação, LGPD, gestão de acessos, PAM, incidentes, vulnerabilidades, SSDLC, IA segura, criptografia em BD, cloud, fornecedores |
| **infrastructure** | Terraform, Docker, Kubernetes, Helm, deployment config, server config, resiliência, CI/CD security, anti-backdoor |
| **observability** | Níveis de log, campos GELF/COGNA, CorrelationID, implementação por linguagem, dados sensíveis em logs, logging de segurança, monitoramento |
| **conditional** | Regras ativadas por fileMatch: controllers/APIs, repositories/SQL, templates/views, infra/IaC |

## Hooks

> **Nota:** Hooks não são distribuídos automaticamente com o Power. Os steerings são o mecanismo principal de proteção. Os hooks abaixo são **recomendados** para complementar a segurança — crie-os no `.kiro/hooks/` do seu projeto.

### Recomendados para Projetos

| Hook | Arquivo | Trigger | Ação | Prioridade |
|---|---|---|---|---|
| **Revisão de Segurança em Código** | `security-code-review.kiro.hook` | `preToolUse` (write) | 3 níveis: SKIP (testes/docs) → LIGHT (domain) → FULL (I/O/auth). Cache por sessão | Alta |
| **Bloquear Segredos em Commits** | `block-secrets-in-commits.kiro.hook` | `preToolUse` (shell) | Auto-aprova testes/lint/build. Verifica segredos apenas em git add/commit/push | Alta |
| **Detectar Arquivos de Secrets (criação)** | `detect-secrets-files.kiro.hook` | `fileCreated` (.env, .pem, .key, credentials) | Alerta ao criar arquivos de secrets. Verifica .gitignore | Alta |
| **Detectar Arquivos de Secrets (edição)** | `detect-secrets-files-edit.kiro.hook` | `fileEdited` (.env, .pem, .key, credentials) | Alerta ao editar arquivos de secrets. Detecta credenciais reais | Alta |
| **Revisão de Infra — Edição** | `infra-review-on-edit.kiro.hook` | `fileEdited` (Dockerfile, *.tf, k8s) | Detecta regressões: USER root, 0.0.0.0/0, encryption desabilitada | Alta |
| **npm audit Automático** | `npm-audit-on-dependency-change.kiro.hook` | `fileEdited` (package.json/lock) | Executa `npm audit --audit-level=moderate` automaticamente | Média |
| **Verificar Segurança de Dependências** | `check-dependency-security.kiro.hook` | `fileEdited` (package.json, pom.xml, etc.) | Pesquisa CVEs via agente e sugere versões seguras | Média |
| **CORS e Security Headers** | `cors-security-headers-check.kiro.hook` | `fileEdited` (server.*, middleware*) | Verifica CORS restritivo e headers de segurança obrigatórios | Média |
| **Scanner de Output de Shell** | `shell-output-scanner.kiro.hook` | `postToolUse` (shell) | Escaneia output por credenciais expostas acidentalmente | Média |
| **SAST Pós-Tarefa** | `post-task-security-scan.kiro.hook` | `postTaskExecution` | Revisa código contra regras de segurança após completar task | Média |
| **Sugestões Proativas** | `proactive-security-suggestions.kiro.hook` | `agentStop` | Sugere melhorias apenas para código de produção com I/O | Baixa |
| **Security Review On-Demand** | `security-review-on-demand.kiro.hook` | `userTriggered` | Revisão completa (20 categorias) sob demanda no arquivo ativo | Baixa |
| **Coletor de Feedback** | `power-feedback-collector.kiro.hook` | `agentStop` | Coleta feedback automático de fricção/redundância/falsos positivos | Baixa |
| **LGPD — Dados Pessoais** | `lgpd-data-review.kiro.hook` | `fileEdited` (user*, customer*, aluno*, profile*) | Verifica mascaramento, consentimento e retenção de PII | Média |
| **Métricas de Adoção** | `adoption-metrics.kiro.hook` | `agentStop` | Registra regras aplicadas, bloqueios e correções por sessão | Baixa |
| **Auto-Fix em Arquivo Novo** | `auto-fix-vulnerabilities-on-create.kiro.hook` | `fileCreated` (*.ts, *.js, *.py, *.java, etc.) | Corrige automaticamente TODAS as vulnerabilidades ao criar arquivo | Alta |
| **Auto-Fix em Arquivo Editado** | `auto-fix-vulnerabilities-on-edit.kiro.hook` | `fileEdited` (src/**, app/**, lib/**) | Corrige automaticamente vulnerabilidades ao editar código de produção | Alta |
| **Verificação de Saúde de Dependências** | `dependency-health-check.kiro.hook` | `userTriggered` | Verifica outdated, deprecated e CVEs sob demanda | Média |

### Desenvolvimento e Manutenção do Power

| Hook | Arquivo | Trigger | Ação |
|---|---|---|---|
| **Aprender com Vulnerabilidades** | `learn-from-vulnerabilities.kiro.hook` | `postToolUse` (write) | Registra padrões vulneráveis bloqueados (ignora testes/docs) |
| **Aprender com Dependências Inseguras** | `learn-from-insecure-dependencies.kiro.hook` | `postToolUse` (read) | Registra bibliotecas com CVEs detectados |
| **Sincronizar Versão POWER/CHANGELOG** | `sync-version-power-changelog.kiro.hook` | `fileEdited` (CHANGELOG.md) | Atualiza versão no POWER.md |
| **Atualizar CVEs (Manual)** | `update-cves-from-web.kiro.hook` | `userTriggered` | Busca CVEs recentes na web (uso pelo time AppSec) |
| **Mapear Findings Veracode** | `veracode-cwe-mapping.kiro.hook` | `userTriggered` | Mapeia CWEs do Veracode para steerings e sugere melhorias |
| **Atualizar README ao Modificar Steering** | `update-readme-on-steering-change.kiro.hook` | `fileEdited` (steering/*.md) | Verifica se README precisa refletir mudanças |

### Como Criar os Hooks no Seu Projeto

**Passo 1:** Crie a pasta `.kiro/hooks/` na raiz do seu projeto (se não existir).

**Passo 2:** Copie os hooks desejados do diretório `.kiro/hooks/` deste repositório para o seu projeto. Ou crie manualmente com o formato JSON:

```json
{
  "enabled": true,
  "name": "Nome do Hook",
  "version": "1",
  "when": {
    "type": "fileCreated",
    "patterns": ["**/*.ts", "**/*.js"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Instrução para o agente..."
  }
}
```

**Passo 3 (Recomendado — Setup Rápido):** Cole este prompt no Kiro para criar todos os hooks essenciais de uma vez:

```
Crie os seguintes hooks em .kiro/hooks/ para ativar o Security Guardrails:

1. auto-fix-vulnerabilities-on-create.kiro.hook — fileCreated em *.ts,*.js,*.py,*.java,*.cs,*.php
   Prompt: "Analise o arquivo criado contra regras de segurança COGNA. Se encontrar vulnerabilidade (SQL concat, credenciais hardcoded, XSS, command injection, input sem validação, endpoint sem auth, PII em logs, crypto fraca), corrija AUTOMATICAMENTE. Liste correções aplicadas."

2. auto-fix-vulnerabilities-on-edit.kiro.hook — fileEdited em src/**/*.ts, src/**/*.js, app/**/*.ts, lib/**/*.ts
   Prompt: "Analise as mudanças contra regras de segurança. Se encontrar vulnerabilidade, corrija automaticamente."

3. block-secrets-in-commits.kiro.hook — preToolUse shell
   Prompt: "Se comando é teste/lint/build → APROVADO. Se git add/commit/push → verificar segredos (sk-, AKIA, eyJ, BEGIN PRIVATE KEY). Segredo → BLOQUEIE. Limpo → APROVADO."

4. check-dependency-security.kiro.hook — fileEdited em **/package.json, **/pom.xml, **/requirements.txt
   Prompt: "Pesquise CVEs na web para cada dependência. Se encontrar, corrija automaticamente para versão segura."

Consulte github.com/igoravila-net/security-steering-kiro/.kiro/hooks/ para os prompts completos.
```

Consulte os exemplos completos no diretório `.kiro/hooks/` deste repositório.

> **Importante:** NÃO crie hooks do tipo `promptSubmit` para injetar regras de segurança. Os steering files deste Power já são carregados automaticamente (`inclusion: auto`) em toda interação. Um hook `promptSubmit` duplicaria as regras, consumindo ~300+ tokens extras por mensagem sem ganho de segurança.

> **Hooks que NÃO devem ser criados no projeto consumidor:**
> - `security-context-reminder` (promptSubmit) — redundante com steerings auto-incluídos
> - `security-power-feedback` (agentStop) — gera apenas feedback sobre limitações da plataforma sem ação possível
> - Qualquer hook que injete checklist de regras COGNA via prompt — os steerings já fazem isso

> **Limitação conhecida:** Hooks `preToolUse` e `postToolUse` sempre interceptam o evento — não é possível filtrar por conteúdo do comando ou path do arquivo no `when`. A classificação (SKIP/APROVADO) é feita pelo agente via prompt. Os prompts deste Power são otimizados para resposta mínima (~1 palavra) em cenários de auto-approve, minimizando o custo de cada interceptação inevitável.

## Linguagens Cobertas

**Homologadas:** C#, Java, TypeScript, JavaScript, HTML, Swift, Kotlin, Python, YAML, HCL, PowerShell, Bash/Shell

**Suportadas (não homologadas):** PHP (WordPress, Laravel)

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
