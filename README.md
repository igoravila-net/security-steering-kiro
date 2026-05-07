# Guardrails de Segurança - Grupo COGNA

Framework de segurança automatizado para desenvolvimento seguro, implementado via Kiro AI steering files e hooks.

## Visão Geral

Este repositório contém **40 steerings de segurança** e **4 hooks automatizados** que garantem que todo código produzido com auxílio do Kiro esteja em conformidade com as políticas corporativas do Grupo COGNA, OWASP e melhores práticas de mercado.

## Como Funciona

Os steerings são regras carregadas automaticamente em toda interação com o Kiro. Os hooks interceptam ações específicas para validar segurança em tempo real.

### Hooks Ativos

| Hook | Trigger | Ação |
|---|---|---|
| **Revisão de Segurança em Código** | Antes de escrever código | Bloqueia padrões vulneráveis |
| **Bloquear Segredos em Commits** | Antes de comandos git | Detecta API keys, tokens, senhas |
| **Verificar Segurança de Dependências** | Ao editar arquivos de dependência | Pesquisa CVEs e sugere versões seguras |
| **SAST Pós-Tarefa** | Após completar task de spec | Revisa código contra regras de segurança |

### Princípios Fundamentais

1. **Todo input é malicioso** — Limite de caracteres + sanitização obrigatória
2. **Credenciais nunca no código** — Sempre via cofre PAM / vault
3. **Menor privilégio** — Apenas permissões mínimas necessárias
4. **Defesa em profundidade** — Múltiplas camadas de proteção
5. **Segurança por design** — Incorporada desde o início do desenvolvimento

## Estrutura

```
.kiro/
  hooks/                                  # 4 hooks automatizados
    block-secrets-in-commits.kiro.hook
    check-dependency-security.kiro.hook
    post-task-security-scan.kiro.hook
    security-code-review.kiro.hook
  steering/                               # 38+ steerings de segurança
    seguranca-*.md
```

## Categorias de Steerings

### Vulnerabilidades OWASP (Multilinguagem)

| Steering | Cobertura |
|---|---|
| `seguranca-xss-multilinguagem.md` | Cross-Site Scripting (XSS) |
| `seguranca-crlf-injection.md` | CRLF Injection |
| `seguranca-criptografia-multilinguagem.md` | Cryptographic Issues |
| `seguranca-information-leakage.md` | Information Leakage |
| `seguranca-credentials-directory-traversal.md` | Credentials Management, Directory Traversal |
| `seguranca-code-injection-sql.md` | Code Injection, SQL Injection, Command Injection |
| `seguranca-authorization-encapsulation-quality.md` | Authorization, Encapsulation, Code Quality |
| `seguranca-config-deployment-backdoor.md` | Deployment Config, Server Config, Backdoor, Time and State |
| `seguranca-input-malicioso.md` | Todo Input é Malicioso (sanitização obrigatória) |
| `seguranca-scaffolding-seguro.md` | Scaffolding Seguro (componentes criados com segurança por default) |
| `seguranca-testes-seguranca.md` | Testes de Segurança (20 categorias: auth, authz, injeção, rate limiting, CORS, DoS, upload, sessão, headers, CSRF, mass assignment, business logic, desserialização, criptografia + banco de payloads) |

### Segurança de APIs e Autenticação

| Steering | Cobertura |
|---|---|
| `seguranca-api-guardrails.md` | OWASP API Security Top 10 |
| `seguranca-api-rest.md` | REST Security, Rate Limiting, CORS |
| `seguranca-autenticacao.md` | Autenticação, Sessões, Senhas |
| `seguranca-oauth2-oidc.md` | OAuth2, OIDC, JWT, PKCE |
| `seguranca-xss-csrf.md` | XSS, CSRF, CSP, Headers |
| `seguranca-controle-acesso.md` | RBAC, IDOR, Escalação de Privilégios |

### Infraestrutura e Cloud

| Steering | Cobertura |
|---|---|
| `seguranca-nuvem-cloud.md` | Segurança em Nuvem |
| `seguranca-iac-compliance.md` | Terraform, Kubernetes, Docker, CIS |
| `seguranca-gestao-firewalls.md` | Firewalls, ACLs, Segmentação |
| `seguranca-criptografia-banco-dados.md` | Criptografia em Banco de Dados |

### Políticas Corporativas COGNA

| Steering | Política Base |
|---|---|
| `seguranca-politica-geral-si.md` | Política de Segurança da Informação |
| `seguranca-classificacao-informacao.md` | Classificação das Informações |
| `seguranca-manuseio-descarte-informacao.md` | Manuseio, Descarte e Remoção |
| `seguranca-cofre-senhas-pam.md` | Cofre de Senhas / PAM |
| `seguranca-gestao-acessos-logicos.md` | Gestão de Acessos Lógicos + Revisão |
| `seguranca-gestao-acessos-sap.md` | Gestão de Acessos SAP |
| `seguranca-gestao-incidentes.md` | Gestão de Incidentes |
| `seguranca-gestao-vulnerabilidades.md` | Gestão de Vulnerabilidades |
| `seguranca-desenvolvimento-seguro-ssdlc.md` | Desenvolvimento Seguro / SSDLC |
| `seguranca-inteligencia-artificial.md` | IA Segura |
| `seguranca-avaliacao-fornecedores-ti.md` | Avaliação de Fornecedores |
| `seguranca-fisica-ambiente.md` | Segurança Física e do Ambiente |
| `seguranca-byod-dispositivos-pessoais.md` | BYOD |
| `seguranca-uso-ativos-ti.md` | Uso Seguro de Ativos de TI |
| `seguranca-lgpd-dados-sensiveis.md` | LGPD e Dados Sensíveis |
| `seguranca-dependencias.md` | Dependências Vulneráveis |
| `seguranca-padrao-logs.md` | Padrão de Logs (Arquitetura de Referência) |

### Aprendizado e Melhoria Contínua

| Steering | Cobertura |
|---|---|
| `seguranca-aprendizado-vulnerabilidades.md` | Registro de padrões vulneráveis detectados, métricas, gaps e melhorias |
| `seguranca-aprendizado-bibliotecas.md` | Registro de bibliotecas/dependências inseguras detectadas, métricas por ecossistema e candidatas a proibição |

## Linguagens Homologadas

C#, Java, TypeScript, JavaScript, HTML, CSS/SCSS, Swift, Kotlin, Python, JSON, AVRO, YAML, HCL, PowerShell, Bash/Shell

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
- Novas vulnerabilidades nos repositórios devem ser adicionadas aos steerings

## Referências

- OWASP Top 10 / API Security Top 10 / Cheat Sheet Series
- ISO 27001:2022, ISO 27002:2022, ISO 42001:2024
- NIST CSF, NIST 800-53
- CIS Controls / CIS Benchmarks
- LGPD (Lei 13.709/2018)
- Políticas internas do Grupo COGNA
