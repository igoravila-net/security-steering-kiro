# COGNA Security Guardrails — Apresentação

> Arquivo local — NÃO commitar

---

## Slide 1 — Título

**COGNA Security Guardrails**
Framework automatizado de segurança para desenvolvimento seguro

Segurança da Informação — Grupo COGNA
v2.1.0 | Maio 2026

---

## Slide 2 — O Problema

- Vulnerabilidades são detectadas **tarde demais** (PR review, Veracode, produção)
- Custo de correção aumenta 10x a cada fase do ciclo
- Desenvolvedores não são especialistas em segurança
- Dependências com CVEs entram no código sem verificação
- Políticas corporativas existem mas não são aplicadas automaticamente

---

## Slide 3 — A Solução

**Plugin para o IDE Kiro** que bloqueia código vulnerável **em tempo real**, antes de ser escrito.

Como funciona:
1. Desenvolvedor escreve código normalmente
2. Power intercepta e verifica contra 20+ categorias de ataque
3. Se inseguro → bloqueia e sugere correção
4. Se seguro → permite sem fricção

**Transparente para o desenvolvedor — proteção automática.**

---

## Slide 4 — Arquitetura

```
┌─────────────────────────────────────────┐
│              IDE (Kiro)                  │
├─────────────────────────────────────────┤
│  Steering Files (7)     │  Hooks (21)   │
│  ─────────────────      │  ───────────  │
│  • constraints          │  • preToolUse │
│  • implementation       │  • postToolUse│
│  • validation           │  • fileEdited │
│  • policies             │  • agentStop  │
│  • infrastructure       │  • userTrigger│
│  • observability        │               │
│  • conditional          │               │
├─────────────────────────────────────────┤
│         Código do Desenvolvedor         │
└─────────────────────────────────────────┘
```

**Steerings** = regras carregadas automaticamente
**Hooks** = automações que interceptam ações de risco

---

## Slide 5 — Cobertura

| Dimensão | Escopo |
|----------|--------|
| Vulnerabilidades | 46 CWEs (Top 25 MITRE completo + 21 adicionais, OWASP Top 10:2025 + API + LLM) |
| Linguagens | 13 (C#, Java, TS, JS, PHP, Python, Swift, Kotlin, etc.) |
| Supply Chain (SCA) | 5 ecossistemas (npm, pip, Maven, NuGet, Composer), 26 pacotes proibidos |
| Políticas COGNA | 12 automatizadas |
| Infraestrutura | Terraform, Docker, K8s |
| LGPD | Hook dedicado para PII |
| WordPress | Plugins, temas, REST API |

---

## Slide 6 — Como Protege (Exemplos)

**SQL Injection:**
- ❌ `"SELECT * FROM users WHERE id = " + userId` → BLOQUEADO
- ✅ `SELECT * FROM users WHERE id = ?` com parâmetro → PERMITIDO

**Credenciais:**
- ❌ `const API_KEY = "sk-abc123..."` → BLOQUEADO
- ✅ `const API_KEY = process.env.API_KEY` → PERMITIDO

**Supply Chain:**
- ❌ `"faker": "^6.6.6"` → BLOQUEADO (protestware)
- ✅ `"@faker-js/faker": "9.0.0"` → PERMITIDO (alternativa segura)

---

## Slide 7 — Classificação Inteligente

O Power não trata tudo igual — classifica por risco:

| Nível | Arquivos | Verificação |
|-------|----------|-------------|
| **SKIP** | Testes, docs, configs, UI | Auto-approve instantâneo |
| **LIGHT** | Domain models, DTOs | Apenas credenciais |
| **FULL** | Controllers, services, infra | Checklist completa (7 itens) |

**Resultado:** -83% de interrupções vs. v1, mantendo 100% de proteção em código de produção.

---

## Slide 8 — Supply Chain (SCA)

Maior vetor de ataque atual — dependências vulneráveis.

| Ecossistema | Pacotes proibidos | Ataques cobertos |
|-------------|-------------------|------------------|
| npm | 8 | Typosquatting, dependency confusion, protestware, worm (Shai-Hulud), remote dynamic deps (PhantomRaven) |
| pip | 6 | Typosquatting, malicious setup.py |
| Maven | 7 | Log4Shell, transitive attacks |
| NuGet | 5 | Dependency confusion, build scripts |
| Composer | 5 | Abandoned packages, malicious autoload |

**Regra absoluta:** Agente DEVE verificar CVEs via web ANTES de escrever versões.

---

## Slide 8.5 — Observabilidade e Logs

O Power garante que logs sigam o padrão COGNA:

| Regra | Antes | Depois |
|-------|-------|--------|
| PII em logs | `console.log(user.cpf)` | Mascarado: `***.456.***-**` |
| Formato | `console.log("msg")` | GELF estruturado com campos obrigatórios |
| Rastreabilidade | Sem correlação | CorrelationID em toda request |
| Níveis | Tudo `console.log` | INFO/WARN/ERROR conforme contexto |
| Dados de cartão | Logado em plaintext | NUNCA logado (PCI-DSS) |

**Padrão GELF COGNA:** timestamp, level, correlationId, service, message, userId (sem PII)

---

## Slide 9 — Integração com Processos

| Processo | Como o Power ajuda |
|----------|-------------------|
| Veracode | Hook mapeia CWEs → steerings (feedback loop) |
| LGPD | Hook dedicado verifica mascaramento/consentimento |
| Incidentes | Regras atualizadas quando novas vulnerabilidades surgem |
| Onboarding | 10 regras fundamentais carregadas automaticamente |
| CI/CD | Regras de pipeline (npm audit, pip-audit, OWASP DC) |

---

## Slide 10 — Métricas

| Métrica | Valor |
|---------|-------|
| Proteção em código de produção | **100%** |
| CWEs cobertas | **46** (Top 25 MITRE 2024 + 21 adicionais) |
| Linguagens homologadas | **13** |
| Hooks ativos | **21** |
| Pacotes proibidos monitorados | **26** |
| Políticas COGNA automatizadas | **12** |
| Redução de fricção vs. v1 | **-83%** |

---

## Slide 11 — Próximos Passos

1. **Piloto com squads** — ativar em projetos selecionados
2. **Métricas de adoção** — hook coleta dados automaticamente
3. **Feedback loop Veracode** — mapear findings para melhorar regras
4. **Mobile-specific** — certificate pinning, jailbreak detection
5. **Evolução contínua** — hook de feedback coleta gaps reais

---

## Slide 12 — Como Usar

1. Instalar o Power no Kiro (marketplace ou manual)
2. Steerings carregam automaticamente — zero configuração
3. Opcionalmente: criar hooks recomendados no projeto (`.kiro/hooks/`)
4. Desenvolver normalmente — proteção é transparente

**Repositório:** github.com/igoravila-net/security-steering-kiro
