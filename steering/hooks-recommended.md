---
inclusion: manual
description: "Arquitetura de hooks recomendados em camadas. Referência para setup em novos projetos."
---

# Hooks Recomendados — Arquitetura em Camadas

> Este documento define a arquitetura de hooks do Power em 3 camadas. Use como referência ao configurar hooks em novos projetos. Nem todos os hooks são obrigatórios — escolha conforme o contexto do projeto.

---

## Mapeamento de Triggers — Nomenclatura Oficial Kiro

| Nome usado na documentação | Trigger real (Kiro) | Matcher (regex) |
|---|---|---|
| preToolUse write | `PreToolUse` | `fs_write\|str_replace\|fs_append` |
| preToolUse shell | `PreToolUse` | `execute_pwsh` |
| postToolUse shell | `PostToolUse` | `execute_pwsh` |
| postToolUse write | `PostToolUse` | `fs_write\|str_replace\|fs_append` |
| fileCreated | `PostFileCreate` | (path regex, ex: `\.(ts\|js\|py\|java)$`) |
| fileEdited | `PostFileSave` | (path regex, ex: `\.(ts\|js\|py\|java)$`) |
| preTaskExecution | `PreTaskExec` | — |
| postTaskExecution | `PostTaskExec` | — |
| agentStop | `Stop` | — |
| userTriggered | `UserPromptSubmit` | (matcher com keyword, ex: `security review\|veracode\|cve`) |

> **Regra:** Sempre use os nomes PascalCase (`PreToolUse`, `PostFileSave`, etc.) ao criar hooks via `createHook` ou JSON manual.

---

## Camada 1: Core (obrigatórios em todo projeto)

Hooks que previnem vulnerabilidades críticas. Devem estar ativos sempre.

| Hook | Trigger | Matcher | Propósito |
|------|---------|---------|-----------|
| `security-critical-paths` | `PreToolUse` | `fs_write\|str_replace\|fs_append` | Checklist App (7 itens) + Checklist IaC (7 itens) com fast-path para docs/testes |
| `block-prohibited-packages` | `PreToolUse` | `fs_write\|str_replace\|fs_append` | Bloqueia pacotes PROIBIDOS ANTES de serem adicionados ao package.json/pom.xml/etc |
| `block-secrets-in-commits` | `PreToolUse` | `execute_pwsh` | Bloqueia credenciais em git add/commit/push e flags inseguras (--ignore-engines) |
| `shell-output-scanner` | `PostToolUse` | `execute_pwsh` | Detecta credenciais, deprecated com CVE, e stack traces em outputs |
| `npm-audit-on-deps-change` | `PostFileSave` | `package\\.json` | Executa `npm audit` automaticamente após alteração em package.json |

**Tokens estimados por sessão:** ~500 (maioria fast-path)

### JSON Snippets — Core Hooks

#### security-critical-paths

```json
{
  "version": "v1",
  "hooks": [{
    "name": "Security Critical Paths",
    "trigger": "PreToolUse",
    "matcher": "fs_write|str_replace|fs_append",
    "action": {
      "type": "agent",
      "prompt": "FAST-PATH SILENCIOSO (NÃO responda nada — apenas prossiga):\n- Se path contém: .kiro/, test/, spec/, __tests__/, *.md, *.json (não package.json), *.lock, *.yml, *.css, *.html\n- Se é arquivo de documentação, configuração IDE, steering, ou hook\n\nSe NÃO for fast-path, aplique:\n\n**Checklist App (código-fonte):**\n1. Input validado com limite de caracteres?\n2. SQL/queries parametrizadas (sem concatenação)?\n3. Credenciais via env/vault (sem hardcoded)?\n4. Auth + Authz no endpoint?\n5. Dados sensíveis mascarados em logs/respostas?\n6. Error handling sem stack trace ao cliente?\n7. DTO separado da entidade?\n\n**Checklist IaC (se Dockerfile/Terraform/K8s/Compose):**\n1. USER não-root?\n2. Sem secrets na imagem/manifesto?\n3. Resource limits definidos?\n4. Imagem com tag fixa (não :latest)?\n5. Security groups sem 0.0.0.0/0 em portas sensíveis?\n6. Encryption at rest habilitado?\n7. Network policies aplicadas?\n\nSe TODOS os itens aplicáveis estão OK: 'APROVADO'.\nSe algum item FALHA: liste os problemas e sugira correção inline."
    }
  }]
}
```

#### block-prohibited-packages

```json
{
  "version": "v1",
  "hooks": [{
    "name": "Block Prohibited Packages",
    "trigger": "PreToolUse",
    "matcher": "fs_write|str_replace|fs_append",
    "action": {
      "type": "agent",
      "prompt": "ANTES de escrever neste arquivo, verifique se é um arquivo de dependências (package.json, pom.xml, build.gradle, requirements.txt, *.csproj, composer.json).\n\nFAST-PATH: Se NÃO é arquivo de dependências → 'APROVADO'.\n\nSe É arquivo de dependências, verifique se ALGUM pacote sendo adicionado/modificado está na lista PROIBIDA:\n\n**npm PROIBIDOS:** event-stream, ua-parser-js<0.7.30, colors>=1.4.1, faker>=6.6.6, node-ipc>=10.1.1, coa>=2.0.3, rc>=1.2.9, peacenotwar, next<14.2.25, react-server-dom-webpack 19.0-19.2, js-yaml<4.1.1, vm2, express<4.21\n\n**pip PROIBIDOS:** jeIlyfish (com I maiúsculo), colourama, python3-dateutil, setup-tools, urllib, reqeusts\n\n**Maven PROIBIDOS:** log4j-core<2.24, commons-collections<3.2.2, fastjson<1.2.83, struts2-core, commons-text<1.10, snakeyaml<2.0, spring-cloud-gateway<4.1.6\n\n**NuGet PROIBIDOS:** Newtonsoft.Json<13.0.3, System.Drawing.Common (Linux), log4net<2.0.16, RestSharp<108.0\n\n**Composer PROIBIDOS:** phpmailer<6.5, guzzlehttp/guzzle<7.4.5, symfony/http-kernel<6.3.8, laravel/framework<10.0\n\n🚫 Se pacote PROIBIDO detectado → BLOQUEIE e instrua a usar alternativa.\n✅ Se nenhum pacote proibido → 'APROVADO'."
    }
  }]
}
```

#### block-secrets-in-commits

```json
{
  "version": "v1",
  "hooks": [{
    "name": "Block Secrets in Commits",
    "trigger": "PreToolUse",
    "matcher": "execute_pwsh",
    "action": {
      "type": "agent",
      "prompt": "ANTES de executar este comando shell, verifique:\n\nFAST-PATH (responda apenas 'APROVADO'):\n- Se NÃO contém: git add, git commit, git push, git stash, npm install, npm i\n- Se é comando de leitura: git status, git log, git diff, cat, ls, dir, type\n- Se é build/test: npm run, npx, mvn, dotnet, python -m pytest, vitest, jest\n\n🚫 FLAGS INSEGURAS — BLOQUEAR:\n- `--ignore-engines` → bypassa verificação de compatibilidade de Node.js, pode instalar pacotes inseguros\n- `--ignore-scripts` em contexto de produção (OK no CI)\n- `--force` ou `-f` em npm install → bypassa verificações de segurança\n- `npm install` sem lockfile (sem --ci ou --frozen-lockfile)\n\nSe o comando contém git add/commit/push, VERIFIQUE:\n1. Arquivos sendo commitados NÃO contêm padrões de secrets:\n   - Prefixos: sk-, pk-, api_, AKIA, AIza, ghp_, glpat-\n   - Patterns: BEGIN RSA/PRIVATE KEY, eyJ (JWT hardcoded)\n   - Variáveis com valor literal: password=, secret=, token=, api_key=\n   - Connection strings com credenciais embutidas\n2. Arquivos .env, *.pem, *.key NÃO estão sendo adicionados\n3. Se detectar qualquer secret ou flag insegura: BLOQUEAR e instruir correção\n\nSe seguro: responda 'APROVADO'."
    }
  }]
}
```

#### shell-output-scanner

```json
{
  "version": "v1",
  "hooks": [{
    "name": "Shell Output Scanner",
    "trigger": "PostToolUse",
    "matcher": "execute_pwsh",
    "action": {
      "type": "agent",
      "prompt": "Analise o output do comando executado. Responda 'OK' a menos que detecte:\n\n1. **Credenciais expostas**: tokens, passwords, API keys, connection strings no output → ALERTA + instruir rotação\n2. **Deprecated com advisory**: se output contém `npm warn deprecated` E o pacote tem security advisory conhecido → CORRIGIR automaticamente (atualizar no package.json para versão segura)\n3. **Npm audit findings**: vulnerabilidades HIGH ou CRITICAL reportadas → listar e sugerir fix\n4. **Stack traces com info sensível**: paths internos, versões de framework, nomes de tabelas → alertar\n5. **Flags inseguras detectadas**: `--ignore-engines`, `--force` em install → alertar sobre risco\n\nPara deprecated com CVE conhecido (item 2):\n- Identifique o pacote e versão atual\n- Pesquise a versão segura mais recente\n- CORRIJA o package.json/requirements.txt automaticamente\n- Execute novo `npm audit` para confirmar correção\n\nSe output limpo: responda 'OK'."
    }
  }]
}
```

#### npm-audit-on-deps-change

```json
{
  "version": "v1",
  "hooks": [{
    "name": "NPM Audit on Deps Change",
    "trigger": "PostFileSave",
    "matcher": "package\\.json$",
    "action": {
      "type": "command",
      "command": "npm audit --audit-level=high --json 2>/dev/null || echo '{\"error\": \"npm audit failed or not available\"}'"
    }
  }]
}
```

> **Nota:** Este hook usa `type: command` para executar `npm audit` automaticamente após cada save de package.json. O output JSON é analisado pelo agente via `shell-output-scanner`. Se `npm audit` encontrar vulnerabilidades HIGH/CRITICAL, o agente será alertado e poderá corrigir automaticamente.

---

## Camada 2: Contextual (ativar conforme stack do projeto)

Hooks que agregam valor para stacks específicas. Ative apenas os relevantes.

| Hook | Trigger | Matcher | Quando ativar |
|------|---------|---------|---------------|
| `auto-fix-vulnerabilities-on-create` | `PostFileCreate` | `\.(ts\|js\|py\|java\|cs\|kt\|php)$` | Todo projeto com código-fonte |
| `auto-fix-vulnerabilities-on-edit` | `PostFileSave` | `\.(ts\|js\|py\|java\|cs\|kt\|php)$` | Todo projeto com código-fonte |
| `infra-review-on-create` | `PostFileCreate` | `(Dockerfile\|docker-compose\|\.tf\|\.tfvars\|k8s\|kubernetes\|helm)` | Projetos com Docker/Terraform/K8s |
| `infra-review-on-edit` | `PostFileSave` | `(Dockerfile\|docker-compose\|\.tf\|\.tfvars\|k8s\|kubernetes\|helm)` | Projetos com Docker/Terraform/K8s |
| `check-dependency-security` | `PostFileSave` | `(package\.json\|requirements.*\.txt\|pom\.xml\|build\.gradle\|\.csproj\|composer\.json)` | Projetos com gerenciador de dependências |
| `lgpd-data-review` | `PostFileCreate` | `\.(ts\|js\|py\|java\|cs\|kt\|php)$` | Projetos que processam dados pessoais |
| `cors-security-headers-check` | `PostFileCreate` | `(middleware\|server\|app\|main\|startup\|program)\.(ts\|js\|py\|java\|cs)$` | Projetos com APIs HTTP |
| `stride-pre-task-assessment` | `PreTaskExec` | — | Projetos usando specs/tasks do Kiro |
| `security-implementation-verification` | `PostToolUse` | `fs_write\|str_replace\|fs_append` | Verifica mitigações STRIDE (silencioso para .kiro/.md/.json/.lock) |

**Tokens estimados por sessão:** ~1000-2000 (depende da stack)

### JSON Snippets — Hooks Contextuais Principais

#### auto-fix-vulnerabilities-on-create

```json
{
  "version": "v1",
  "hooks": [{
    "name": "Auto-fix Vulnerabilities on Create",
    "trigger": "PostFileCreate",
    "matcher": "\\.(ts|js|py|java|cs|kt|php)$",
    "action": {
      "type": "agent",
      "prompt": "Execute revisão COMPLETA de segurança no arquivo criado. Aplique TODAS as 20 categorias:\n\n1. Autenticação (tokens, sessões, MFA)\n2. Autorização (RBAC, ownership, IDOR)\n3. Validação de input (limites, sanitização, tipos)\n4. SQL/Code/Command Injection\n5. XSS (output encoding, CSP)\n6. SSRF (whitelist de URLs, bloqueio de IPs internos)\n7. CSRF (tokens, SameSite)\n8. Rate limiting\n9. Criptografia (algoritmos, chaves, TLS)\n10. Secrets management (hardcoded, vault)\n11. Error handling (sem stack traces, mensagens genéricas)\n12. Logging (GELF, CorrelationID, sem PII)\n13. CORS (whitelist, não wildcard)\n14. Timeout/DoS (limites de body, timeouts)\n15. Upload (validação de tipo, tamanho, path)\n16. Sessão/Cookies (Secure, HttpOnly, SameSite)\n17. Headers de segurança (HSTS, X-Frame-Options, CSP)\n18. Mass Assignment (DTOs separados, campos protegidos)\n19. Desserialização (formatos seguros, whitelist)\n20. Directory Traversal (canonical path, base dir check)\n\nPara cada categoria aplicável, indique: OK ou PROBLEMA + correção.\nIgnore categorias não aplicáveis ao contexto do arquivo.\nSe encontrar problemas, CORRIJA automaticamente o arquivo."
    }
  }]
}
```

#### auto-fix-vulnerabilities-on-edit

```json
{
  "version": "v1",
  "hooks": [{
    "name": "Auto-fix Vulnerabilities on Edit",
    "trigger": "PostFileSave",
    "matcher": "\\.(ts|js|py|java|cs|kt|php)$",
    "action": {
      "type": "agent",
      "prompt": "Execute revisão COMPLETA de segurança no arquivo editado. Aplique TODAS as 20 categorias conforme steering constraints.md e implementation.md.\n\nFAST-PATH: Se o arquivo é test/spec/mock/fixture, responda 'OK'.\n\nPara código de produção: verifique as 20 categorias de segurança. Se encontrar problemas, CORRIJA automaticamente."
    }
  }]
}
```

#### check-dependency-security

```json
{
  "version": "v1",
  "hooks": [{
    "name": "Check Dependency Security",
    "trigger": "PostFileSave",
    "matcher": "(package\\.json|requirements.*\\.txt|pom\\.xml|build\\.gradle|\\.csproj|composer\\.json)",
    "action": {
      "type": "agent",
      "prompt": "Arquivo de dependências modificado.\n\n🌐 REGRA ABSOLUTA: Para CADA dependência adicionada/modificada, você DEVE executar web search (GitHub Advisories, NVD, Snyk) para verificar CVEs. NÃO use conhecimento interno — CVEs novos são publicados diariamente. Pular esta etapa é VIOLAÇÃO CRÍTICA.\n\nVerifique:\n1. 🔍 Web search OBRIGATÓRIO para cada pacote+versão novo/modificado\n2. Pacotes na lista de PROIBIDOS (conforme constraints.md seção Supply Chain)?\n3. Versões pinadas (exatas, sem ^ ou ~ ou *)?\n4. Pacotes com nomes suspeitos (typosquatting)?\n5. Dependências apontando para URLs externas (não registry)?\n6. 🛠️ Se npm: execute `npm audit --audit-level=high` e corrija findings\n7. 🛠️ Se pip: execute `pip-audit` (se disponível) ou pesquise no PyPI/Snyk\n\nSe CVE encontrado: CORRIJA imediatamente (atualize versão no arquivo).\nSe tudo verificado via web e OK: responda 'APROVADO'.\n\n❌ PROIBIDO: Responder 'APROVADO' sem ter executado web search para cada dependência nova/modificada."
    }
  }]
}
```

#### stride-pre-task-assessment

```json
{
  "version": "v1",
  "hooks": [{
    "name": "STRIDE Pre-Task Assessment",
    "trigger": "PreTaskExec",
    "action": {
      "type": "agent",
      "prompt": "Antes de iniciar esta task, avalie se ela envolve áreas sensíveis:\n\nFAST-PATH: Se a task é puramente UI, docs, testes, ou refactoring sem mudança de comportamento, responda 'SKIP'.\n\nSe a task envolve: auth, dados pessoais, integração externa, upload, pagamento, admin, ou API pública:\n\nAplique STRIDE:\n- Spoofing: Alguém pode se passar por outro? → JWT + MFA + rate limiting\n- Tampering: Dados podem ser alterados? → Validação + HMAC + transações\n- Repudiation: Ações podem ser negadas? → Logs + CorrelationID + auditoria\n- Info Disclosure: Dados podem vazar? → Criptografia + mascaramento + DTOs\n- DoS: Serviço pode ser derrubado? → Rate limit + timeout + circuit breaker\n- Elevation: Acesso indevido possível? → RBAC + ownership + menor privilégio\n\nListe as mitigações que DEVEM ser implementadas na task."
    }
  }]
}
```

### Hooks SessionStart (inicialização de sessão)

#### load-known-limitations

```json
{
  "version": "v1",
  "hooks": [{
    "name": "Load Known Limitations",
    "trigger": "SessionStart",
    "action": {
      "type": "agent",
      "prompt": "INSTRUÇÃO INTERNA: Os seguintes comportamentos são limitações CONHECIDAS e ACEITAS da plataforma Kiro. NÃO reporte como problemas, gaps ou sugestões: (1) Hook dispara múltiplas vezes para mesmo arquivo — normal, sem cache nativo. (2) preToolUse intercepta comandos já aprovados — normal. (3) postToolUse write dispara para .md/.json — normal, interceptação inevitável. (4) Respostas triviais (APROVADO/OK) consomem tokens — aceito. (5) Redundância entre steerings e hooks — intencional (steerings definem, hooks verificam). Ignore silenciosamente."
    }
  }]
}
```

#### detect-project-framework

```json
{
  "version": "v1",
  "hooks": [{
    "name": "Detect Project Framework",
    "trigger": "SessionStart",
    "action": {
      "type": "agent",
      "prompt": "No início da sessão, identifique o framework do projeto verificando arquivos na raiz/src:\n- package.json → busque por express, @nestjs/*, next, react, vue, angular, svelte\n- pom.xml / build.gradle → Spring Boot, Quarkus\n- composer.json → Laravel, Symfony, WordPress\n- *.csproj / Program.cs → ASP.NET Core\n- requirements.txt / pyproject.toml → Django, Flask, FastAPI\n\nArmazene mentalmente o framework detectado para aplicar regras condicionais específicas (conforme conditional.md) durante toda a sessão. Não precisa reportar ao usuário — apenas use internamente para contextualizar verificações de segurança."
    }
  }]
}
```

---

## Camada 3: On-demand (ativar manualmente quando necessário)

Hooks para situações específicas. Não precisam estar ativos o tempo todo.

| Hook | Trigger | Matcher | Quando usar |
|------|---------|---------|-------------|
| `security-review-on-demand` | `UserPromptSubmit` | `security review\|revisão de segurança\|review segurança` | Review manual antes de PR |
| `veracode-cwe-mapping` | `UserPromptSubmit` | `veracode\|cwe\|mapping\|findings` | Mapear findings Veracode |
| `update-cves-from-web` | `UserPromptSubmit` | `cve\|atualizar vulnerabilidades\|update cves` | Atualizar base de CVEs |

**Tokens estimados:** 0 (só disparam quando acionados manualmente via keyword no prompt)

### JSON Snippets — On-demand

#### security-review-on-demand

```json
{
  "version": "v1",
  "hooks": [{
    "name": "Security Review On-Demand",
    "trigger": "UserPromptSubmit",
    "matcher": "security review|revisão de segurança|review segurança",
    "action": {
      "type": "agent",
      "prompt": "Execute revisão COMPLETA de segurança no arquivo ativo. Aplique TODAS as 20 categorias:\n\n1. Autenticação (tokens, sessões, MFA)\n2. Autorização (RBAC, ownership, IDOR)\n3. Validação de input (limites, sanitização, tipos)\n4. SQL/Code/Command Injection\n5. XSS (output encoding, CSP)\n6. SSRF (whitelist de URLs, bloqueio de IPs internos)\n7. CSRF (tokens, SameSite)\n8. Rate limiting\n9. Criptografia (algoritmos, chaves, TLS)\n10. Secrets management (hardcoded, vault)\n11. Error handling (sem stack traces, mensagens genéricas)\n12. Logging (GELF, CorrelationID, sem PII)\n13. CORS (whitelist, não wildcard)\n14. Timeout/DoS (limites de body, timeouts)\n15. Upload (validação de tipo, tamanho, path)\n16. Sessão/Cookies (Secure, HttpOnly, SameSite)\n17. Headers de segurança (HSTS, X-Frame-Options, CSP)\n18. Mass Assignment (DTOs separados, campos protegidos)\n19. Desserialização (formatos seguros, whitelist)\n20. Directory Traversal (canonical path, base dir check)\n\nPara cada categoria aplicável, indique: OK ou PROBLEMA + correção.\nIgnore categorias não aplicáveis ao contexto do arquivo."
    }
  }]
}
```

#### update-cves-from-web

```json
{
  "version": "v1",
  "hooks": [{
    "name": "Update CVEs from Web",
    "trigger": "UserPromptSubmit",
    "matcher": "cve|atualizar vulnerabilidades|update cves",
    "action": {
      "type": "agent",
      "prompt": "O time de AppSec solicitou atualização de CVEs. Execute as seguintes ações:\n\n1. Pesquise na web por CVEs recentes (últimos 30 dias) que afetem as bibliotecas utilizadas pela empresa (Spring Boot, Jackson, Netty, React, Next.js, Express, Django, Flask, .NET, Lodash, axios, etc.)\n\n2. Para cada CVE encontrado:\n   - Identifique a biblioteca afetada e versão vulnerável\n   - Identifique a versão corrigida\n   - Classifique a severidade (CVSS)\n   - Determine o tipo de vulnerabilidade\n\n3. Se encontrar bibliotecas que devem ser adicionadas à lista de PROIBIDAS, atualize constraints.md\n\n4. Apresente um resumo do que foi encontrado.\n\nFontes: cve.org, nvd.nist.gov, github.com/advisories, snyk.io/vuln"
    }
  }]
}
```

#### veracode-cwe-mapping

> **Quando usar:** Apenas quando há findings reais do Veracode para mapear. Ative este hook manualmente quando receber um relatório de scan. Sem findings, o hook é no-op — não o deixe no SessionStart.

```json
{
  "version": "v1",
  "hooks": [{
    "name": "Veracode CWE Mapping",
    "trigger": "UserPromptSubmit",
    "matcher": "veracode|cwe|mapping|findings",
    "action": {
      "type": "agent",
      "prompt": "O time de AppSec solicitou mapeamento de findings Veracode.\n\nFAST-PATH: Se não existe arquivo de findings (veracode-results.json, veracode-findings.xml, security-report.json) na raiz do projeto → responda 'Nenhum arquivo de findings encontrado. Forneça o relatório do Veracode para iniciar o mapeamento.' e pare.\n\nSe findings existirem, analise os CWEs reportados e para cada um:\n\n1. Identifique o steering que deveria ter prevenido (constraints, implementation, validation, policies, infrastructure, observability, conditional)\n2. Verifique se a regra correspondente existe e está adequada\n3. Se a regra existe mas não preveniu: sugira melhoria no prompt/exemplo\n4. Se a regra NÃO existe: sugira adição ao steering apropriado\n\nMapeamento CWE → Steering:\n- CWE-89 (SQL Injection) → implementation.md seção 1\n- CWE-79 (XSS) → implementation.md seção 2\n- CWE-918 (SSRF) → implementation.md seção 3\n- CWE-502 (Desserialização) → implementation.md seção 3\n- CWE-327 (Crypto fraca) → implementation.md seção 4\n- CWE-798 (Credenciais hardcoded) → constraints.md Secrets Scanning\n- CWE-611 (XXE) → implementation.md seção 3\n- CWE-22 (Path Traversal) → implementation.md seção 9\n- CWE-862 (Missing Auth) → implementation.md seção 6\n- CWE-1035 (Supply Chain) → constraints.md Supply Chain\n\nRegistre o mapeamento no arquivo VERACODE-MAPPING.md (crie se não existir)."
    }
  }]
}
```

---

## Camada Meta: Observabilidade (opcional, para times que querem métricas)

| Hook | Trigger | Matcher | Propósito |
|------|---------|---------|-----------|
| `adoption-metrics` | `Stop` | — | Registra métricas de uso |
| `power-feedback-collector` | `Stop` | — | Coleta gaps reais de segurança |
| `proactive-security-suggestions` | `Stop` | — | Sugere melhorias pós-sessão |

**Tokens estimados por sessão:** ~100 (fast-path para sessões sem código)

---

## Setup Rápido por Tipo de Projeto

### API Backend (Node/Java/C#/Python)
- Camada 1 (Core): ✅ todos
- Camada 2: `auto-fix-*`, `check-dependency-security`, `cors-security-headers-check`, `lgpd-data-review`
- Camada 3: `security-review-on-demand`

### Frontend (React/Vue/Angular)
- Camada 1 (Core): ✅ todos
- Camada 2: `auto-fix-*`, `check-dependency-security`
- Camada 3: `security-review-on-demand`

### Infraestrutura (Terraform/Docker/K8s)
- Camada 1 (Core): ✅ todos
- Camada 2: `infra-review-on-create`, `infra-review-on-edit`
- Camada 3: nenhum

### Mobile (Swift/Kotlin)
- Camada 1 (Core): ✅ todos
- Camada 2: `auto-fix-*`, `check-dependency-security`
- Camada 3: `security-review-on-demand`

### Full-stack (monorepo)
- Camada 1 (Core): ✅ todos
- Camada 2: `auto-fix-*`, `check-dependency-security`, `infra-review-*`, `cors-security-headers-check`, `lgpd-data-review`
- Camada 3: `security-review-on-demand`, `update-cves-from-web`

---

## Princípios de Design dos Hooks

1. **Prompts curtos** — Hooks referenciam steerings (`conforme constraints.md`) em vez de repetir regras
2. **Fast-path silencioso** — Para .kiro/, *.md, *.json (não deps), *.lock: NÃO emitir resposta alguma — apenas prosseguir
3. **Sem redundância** — Se o steering já cobre, o hook só verifica compliance
4. **Camadas independentes** — Cada camada funciona sem as outras
5. **Tokens mínimos** — Meta: <3000 tokens/sessão em hooks para sessões típicas
6. **Triggers exatos** — Sempre usar nomes PascalCase oficiais do Kiro
7. **Matchers precisos** — Regex para filtrar apenas eventos relevantes
8. **Hooks on-demand para cenários raros** — CVE update e Veracode mapping só ativam quando explicitamente solicitados via keyword no prompt
9. **Command hooks para ações determinísticas** — `npm audit`, `pip-audit`, linters: usar `type: command` em vez de `type: agent` para resultados confiáveis e sem consumo de contexto

---

## Como Criar os Hooks

Peça ao Kiro: **"Crie os hooks de segurança recomendados"** e ele usará a ferramenta `createHook` para gerar os arquivos em `.kiro/hooks/`.

Alternativamente, copie os JSON snippets acima para arquivos em `.kiro/hooks/<id>.json` manualmente.
