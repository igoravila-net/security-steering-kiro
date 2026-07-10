# Sessao: Evolucao do Security Power — 24/06/2026

> Notas de sessao sobre escalabilidade, integracao com pipeline, Veracode, MCP e recomendacoes estrategicas.

---

## 1. Escalabilidade do Power

### Como escalar a adocao

- **Por projeto:** Instalar o power em cada workspace. Cada time/repo que instalar tera as regras aplicadas automaticamente.
- **Customizacao por stack:** O sistema de hooks em camadas (Core / Contextual / On-demand) permite adaptar. Times com infra pesada ativam hooks de IaC; times com APIs ativam CORS/headers; times com dados pessoais ativam LGPD.
- **Steering condicional (fileMatch):** O `conditional.md` ativa regras diferentes conforme tipo de arquivo. Escala naturalmente sem overhead.
- **Variantes por vertical:** Se diferentes BUs tem requisitos distintos, criar forks ou powers complementares (ex: `security-steering-fintech` com PCI-DSS).
- **Distribuicao centralizada:** O power e um repositorio git. Publicar e cada time referencia como power no Kiro. Atualizacoes propagam para todos.
- **Hooks como enforcement gateway:** Os hooks `preToolUse` funcionam como gate. Garantir que todo projeto tenha os hooks Core instalados (parte de template de repo corporativo).

**Gargalo atual:** Operacional — garantir que devs instalem o power e criem os hooks recomendados.

---

## 2. Limitacoes Conhecidas vs. Atualizacoes do Kiro

As limitacoes documentadas no `known-limitations.md` sao limitacoes da **plataforma Kiro**, nao do power:

- Hooks disparando multiplas vezes — sem cache/deduplicacao nativa
- Falta de `excludePatterns` nativo — sem filtro de path no trigger
- Overhead de tokens em respostas triviais — sem fast-path que nao exija resposta
- EPERM no Windows/WSL — issue do Kiro/Windows
- Sem suporte a hook manifest

**Status (junho 2026):** Nenhuma dessas limitacoes foi corrigida em releases do Kiro. O power implementa workarounds internos (auto-approve lists, SKIP fast-paths, prompts minimalistas).

---

## 3. Transformar em MCP — Analise

### O que um MCP adicionaria

| Tool MCP | Funcao |
|----------|--------|
| `scan_file(path)` | Analisa arquivo e retorna vulnerabilidades |
| `check_dependencies(manifest)` | Consulta CVEs em tempo real (NVD, Snyk) |
| `mask_pii(text)` | Mascara dados sensiveis |
| `validate_infra(path)` | Checkov/tfsec-like rules em HCL/Dockerfile |
| `get_security_rules(language, category)` | Retorna regras aplicaveis ao contexto |
| `audit_secrets(path)` | Scan de credenciais hardcoded |

### Vantagens do MCP

- Logica computacional real (regex, AST parsing, chamadas a APIs externas)
- Estado (cache de CVEs, resultados anteriores, metricas agregadas)
- Determinismo (regras por codigo, nao interpretadas por prompt)
- Escalabilidade (roda fora do context window, nao consome tokens)
- Integracao com tooling existente (semgrep, trivy, checkov)

### O que o Power (steering + hooks) faz melhor

| Aspecto | Power atual | MCP |
|---------|-------------|-----|
| Influenciar geracao de codigo em tempo real | Steering no context direto | Nao — MCP e chamado, nao injeta contexto passivo |
| Regras "por osmose" (agente internaliza) | Funciona naturalmente | Nao se aplica |
| Zero setup (sem servidor rodando) | Sim | Precisa de processo running |
| Hooks como gate (preToolUse) | Sim, nativo | Nao — MCP nao intercepta tool calls |
| Funciona offline | Sim | Depende |

### Veredicto: Abordagem hibrida

- **Manter como steering:** constraints, implementation patterns, policies, observability — tudo que influencia como o agente escreve codigo
- **Mover para MCP:** scan de dependencias (consulta real a CVEs), detecao de secrets por regex deterministica, validacao de IaC com regras computacionais, metricas agregadas entre sessoes

O MCP nao substitui o steering porque o steering opera no nivel de *geracao* (agente ja escreve certo), enquanto o MCP opera no nivel de *verificacao* (checagem pos-escrita com logica deterministica).

---

## 4. Integracao com Pipeline (CI/CD)

### Opcoes viaveis

#### Caminho 1: Extrair regras para ferramentas de pipeline (pragmatico)

| Regra do Power | Ferramenta de Pipeline |
|---|---|
| SQL Injection, XSS, SSRF | Semgrep (custom rules YAML) |
| Secrets hardcoded | Gitleaks / TruffleHog |
| Dependencias vulneraveis | npm audit / pip-audit / OWASP Dependency-Check |
| IaC (Docker, Terraform, K8s) | Checkov / Trivy / Hadolint |
| Headers de seguranca | Custom script ou OWASP ZAP |
| Supply chain (lockfile, versions) | lockfile-lint / socket.dev |
| Dados sensiveis em logs | Semgrep com custom pattern |

#### Caminho 2: Kiro headless na pipeline (futuro)

```yaml
# .github/workflows/security.yml
- name: Security Review
  run: kiro review --power security-steering-kiro --files ${{ steps.changed.outputs.files }}
```

Nao existe nativamente no Kiro hoje.

#### Caminho 3: MCP Server como bridge (viavel hoje)

Construir MCP server que:
1. Le steerings como base de regras
2. Expoe CLI (`security-scan --path ./src`)
3. Implementa verificacoes com logica deterministica (regex, AST via tree-sitter)
4. Retorna findings em formato SARIF (padrao GitHub/GitLab/Azure DevOps)

```yaml
- name: COGNA Security Scan
  run: npx @cogna/security-scanner --sarif > results.sarif
- uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: results.sarif
```

### Recomendacao de priorizacao

| Opcao | Esforco | Valor |
|-------|---------|-------|
| Semgrep rules custom | Baixo | Roda em qualquer CI |
| CLI wrapper (scan regex/AST + SARIF) | Medio | Shift-left antes do Veracode |
| MCP Server (Veracode API + steerings) | Medio-alto | Integracao bidirecional |
| Kiro headless | Depende do roadmap | Ideal mas nao disponivel |

---

## 5. Compatibilidade com Veracode

### Relacao Power vs Veracode

| Aspecto | Power (Kiro) | Veracode |
|---------|-------------|----------|
| Quando atua | Dev-time (enquanto escreve) | CI/CD ou sob demanda (apos push) |
| Como funciona | Regras via prompt | SAST/DAST/SCA — analise estatica/dinamica |
| Resultado | Codigo ja nasce seguro | Findings pos-escrita (CWEs) |
| Cobertura | Patterns no prompt (50+ regras) | Engine de analise de fluxo de dados |

### Fluxo ideal de integracao

```
Dev escreve codigo → Power previne no IDE → Push → Veracode analisa →
Findings → Alimentam steerings do Power → Proximo codigo ja evita o padrao
```

### Direcao A: Power → Pipeline (preventivo, pre-Veracode)

CLI/scanner que roda antes do Veracode na pipeline, pegando problemas mais cedo (shift-left).

### Direcao B: Veracode → Power (feedback loop)

Script que puxa findings da API do Veracode e atualiza os steerings:

```python
# veracode_to_steering.py
def get_findings(app_id):
    resp = requests.get(
        f"https://api.veracode.com/appsec/v2/applications/{app_id}/findings",
        auth=(VERACODE_API_ID, VERACODE_API_KEY)  # via env vars
    )
    return resp.json()['_embedded']['findings']

CWE_TO_STEERING = {
    89: 'implementation.md - SQL Injection',
    79: 'implementation.md - XSS',
    798: 'constraints.md - Secrets',
    918: 'implementation.md - SSRF',
    502: 'implementation.md - Desserializacao',
    # ...
}
```

### Direcao C: MCP Server conectando ambos

Tools MCP:
- `veracode_findings(app_id)` → retorna findings atuais
- `map_finding_to_steering(cwe_id)` → indica qual steering deveria ter prevenido
- `suggest_fix(finding)` → sugere correcao baseada nos steerings

---

## 6. O que e um Wrapper

Um **wrapper** e um programa que "embrulha" outro, adicionando funcionalidade ou simplificando a interface.

Neste contexto: um CLI que le os steerings do power, traduz para verificacoes executaveis (regex, AST patterns), roda contra o codigo-fonte, e produz output num formato padrao (SARIF).

Pega o conhecimento que hoje vive no prompt do Kiro e torna executavel fora do Kiro.

---

## 7. Recomendacoes Estrategicas

### 7.1 Metricas de eficacia

- Acompanhar findings Veracode por sprint antes/depois da adocao
- Se CWE aparece repetidamente apesar do power → reforcar steering
- Dashboard: "CWEs novos por mes por time" — curva caindo = power funcionando

### 7.2 Onboarding automatizado

- Template de repositorio com `.kiro/` pre-configurado
- Ou script `npx @cogna/security-setup` que cria estrutura automaticamente

### 7.3 Segmentar por maturidade

- **Nivel 1 (basico):** Injection, secrets, auth
- **Nivel 2 (intermediario):** + XSS, CORS, headers, rate limiting, LGPD
- **Nivel 3 (avancado):** + supply chain, STRIDE, IaC, LLM security

### 7.4 Feedback loop com Security Champions

- Reportar falsos positivos → atualiza steerings
- Reportar gaps → adiciona regra
- Validar novos steerings antes de distribuir

### 7.5 Versionamento semantico dos steerings

- CHANGELOG claro quando regras mudam
- Canal de notificacao (Slack/Teams) para times consumidores

### 7.6 Custo de tokens

- O power v2.4.4 e grande. Steerings `inclusion: always` consomem context window
- Mover steerings especificos para `inclusion: fileMatch`
- Expandir a estrategia do `conditional.md`

### 7.7 Inner source

- Aceitar PRs de outros times (com review AppSec)
- Issues para sugestao de novas regras
- Discussoes sobre falsos positivos
- Aumenta ownership e reduz percepcao de "regra imposta"

### 7.8 Red team do power

- Usar arquivos `demo/vulneravel-*.ts` como test suite
- Abrir cada arquivo com power ativo e verificar deteccao/correcao
- Se nao detectar → gap no steering
- Automatizar quando Kiro tiver modo headless

---

## Proximos passos sugeridos

1. **Curto prazo:** Extrair regras para Semgrep + Gitleaks (baixo esforco, alto retorno)
2. **Medio prazo:** Script de feedback Veracode → steerings + CLI scanner com SARIF
3. **Longo prazo:** MCP server complementar + Kiro headless na pipeline
4. **Governanca:** Template de repo, niveis de maturidade, Security Champions no loop
