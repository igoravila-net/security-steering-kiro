# COGNA Security Guardrails

Framework de segurança automatizado para desenvolvimento seguro no Grupo COGNA, implementado como Kiro Power com steering files temáticos e hooks.

## Visão Geral

Este Power contém **7 steerings temáticos consolidados** e **18 hooks recomendados** que garantem que todo código produzido com auxílio do Kiro esteja em conformidade com as políticas corporativas do Grupo COGNA, OWASP Top 10, LGPD e melhores práticas de mercado.

## Como Funciona

Os steerings são regras carregadas automaticamente (ou condicionalmente via fileMatch) em interações com o Kiro. Os hooks interceptam ações específicas para validar segurança em tempo real. Código inseguro é corrigido antes de ser apresentado ao desenvolvedor.

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
  implementation.md         # Padrões de código seguro por vulnerabilidade (multilinguagem) [fileMatch: código-fonte]
  validation.md             # Testes de segurança, checklist pré-PR, threat modeling
  policies.md               # Políticas corporativas COGNA (SI, LGPD, acessos, IA)
  infrastructure.md         # IaC seguro (Terraform, Docker, K8s), deployment, CI/CD
  observability.md          # Padrão de logs COGNA (GELF, CorrelationID), monitoramento [fileMatch: código-fonte e logging/middleware]
  conditional.md            # Regras por tipo de arquivo (controllers, repos, templates, infra)
```

## Steering Files

| Steering | Conteúdo |
|---|---|
| **constraints** | Regras absolutas, scaffolding seguro, input malicioso, secrets scanning, dependências proibidas, detecção de dependências não utilizadas, supply chain security (npm, pip, Maven, NuGet), escopo de aplicação (classificação de projetos com relaxamento contextual de regras), onboarding |
| **implementation** *(fileMatch)* | Injection (SQL/Code/Command), XSS, SSRF, desserialização, criptografia, autenticação, OAuth2/JWT, API security, CRLF, credentials, directory traversal, information leakage, race conditions, memory safety (CWE-787/125/416/119/190 — buffer overflow, use-after-free, integer overflow em C#/Node.js/Java), exceptional conditions (OWASP A10:2025), LLM Top 10:2025, API Security Top 10:2023 expandido, PHP (Laravel/Symfony/WordPress). Ativado ao editar código-fonte. |
| **validation** | 20 categorias de testes de segurança, templates prontos (TypeScript/Java/Python/C#/PHP/Kotlin/JavaScript/Swift), banco de payloads, checklist pré-PR, threat modeling STRIDE, métricas de compliance |
| **policies** | Política Geral SI, classificação da informação, LGPD, gestão de acessos, PAM, incidentes, vulnerabilidades, SSDLC, IA segura, criptografia em BD, cloud, fornecedores |
| **infrastructure** | Terraform, Docker, Kubernetes, Helm, deployment config, server config, resiliência, CI/CD security, anti-backdoor |
| **observability** *(fileMatch)* | Níveis de log, campos GELF/COGNA, CorrelationID, implementação por linguagem, dados sensíveis em logs, logging de segurança, monitoramento. Ativado ao editar código-fonte ou arquivos de logging/middleware. |
| **conditional** | Regras ativadas por fileMatch: controllers/APIs, repositories/SQL, templates/views, infra/IaC |

## Hooks

> **Nota:** Hooks não são distribuídos automaticamente com o Power. Os steerings são o mecanismo principal de proteção. Os hooks abaixo são **recomendados** para complementar a segurança — crie-os no `.kiro/hooks/` do seu projeto.

### Recomendados para Projetos

| Hook | Arquivo | Trigger | Ação | Prioridade |
|---|---|---|---|---|
| **🛡️ STRIDE Assessment Pré-Tarefa** | `stride-pre-task-assessment.kiro.hook` | `preTaskExecution` | Avalia ameaças STRIDE com fast-path SKIP para types/testes/generators | Alta |
| **🔎 Verificação de Implementação** | `security-implementation-verification.kiro.hook` | `postToolUse` (write) | Cruza mitigações STRIDE com código produzido em app/infra | Alta |
| **🔍 Revisão de Segurança — Paths Críticos** | `security-critical-paths.kiro.hook` | `preToolUse` (write) | Fast-path APROVADO + checklist 7 itens para paths de risco | Alta |
| **🔒 Bloquear Segredos em Commits** | `block-secrets-in-commits.kiro.hook` | `preToolUse` (shell) | Auto-aprova testes/lint/build. Verifica segredos em git add/commit/push | Alta |
| **🚨 Detectar Arquivos de Secrets (criação)** | `detect-secrets-files.kiro.hook` | `fileCreated` (.env, .pem, .key, credentials) | Alerta ao criar arquivos de secrets. Verifica .gitignore | Alta |
| **🚨 Detectar Arquivos de Secrets (edição)** | `detect-secrets-files-edit.kiro.hook` | `fileEdited` (.env, .pem, .key, credentials) | Alerta ao editar arquivos de secrets. Detecta credenciais reais | Alta |
| **🏗️ Revisão de Infra — Edição** | `infra-review-on-edit.kiro.hook` | `fileEdited` (Dockerfile, *.tf, k8s, CI/CD, nginx) | Detecta regressões: USER root, 0.0.0.0/0, encryption, pipelines inseguros | Alta |
| **🆕🏗️ Revisão de Infra — Criação** | `infra-review-on-create.kiro.hook` | `fileCreated` (Dockerfile, *.tf, k8s, CI/CD, nginx) | Verifica segurança IaC desde o início, corrige automaticamente | Alta |
| **✅ Auto-Fix em Arquivo Novo** | `auto-fix-vulnerabilities-on-create.kiro.hook` | `fileCreated` (*.ts, *.js, *.py, *.java, etc.) | Corrige automaticamente vulnerabilidades ao criar arquivo | Alta |
| **✅ Auto-Fix em Arquivo Editado** | `auto-fix-vulnerabilities-on-edit.kiro.hook` | `fileEdited` (*.ts, *.js, *.py, *.java, etc.) | Corrige automaticamente vulnerabilidades ao editar código | Alta |
| **📦 Verificar Segurança de Dependências** | `check-dependency-security.kiro.hook` | `fileEdited` (package.json, pom.xml, etc.) | Pesquisa CVEs via web e corrige automaticamente | Média |
| **📦 Verificação de Saúde de Dependências** | `dependency-health-check.kiro.hook` | `userTriggered` | Verifica outdated, deprecated, CVEs e não utilizadas sob demanda | Média |
| **🌐 CORS e Security Headers** | `cors-security-headers-check.kiro.hook` | `fileEdited` (server.*, middleware*) | Verifica CORS restritivo e headers de segurança obrigatórios | Média |
| **🔍 Scanner de Output de Shell** | `shell-output-scanner.kiro.hook` | `postToolUse` (shell) | Escaneia output por credenciais, deprecated, stack traces | Média |
| **🔍 SAST Pós-Tarefa** | `post-task-security-scan.kiro.hook` | `postTaskExecution` | Revisa código contra regras de segurança após completar task | Média |
| **🏛️ LGPD — Dados Pessoais** | `lgpd-data-review.kiro.hook` | `fileEdited` (user*, customer*, aluno*, profile*) | Verifica mascaramento, consentimento e retenção de PII | Média |
| **💡 Sugestões Proativas** | `proactive-security-suggestions.kiro.hook` | `agentStop` | Sugere melhorias apenas para código de produção com I/O | Baixa |
| **🔍 Security Review On-Demand** | `security-review-on-demand.json` | `UserPromptSubmit` | Revisão completa (20 categorias) sob demanda no arquivo ativo | Baixa |
| **📊 Métricas de Adoção** | `adoption-metrics.kiro.hook` | `agentStop` | Registra regras aplicadas, bloqueios e correções por sessão | Baixa |
| **📝 Coletor de Feedback** | `power-feedback-collector.kiro.hook` | `agentStop` | Coleta feedback automático de gaps e falsos positivos | Baixa |

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
Crie os seguintes 5 hooks em .kiro/hooks/ com os JSONs EXATOS abaixo (copie literalmente):
```

**Hook 1 — `auto-fix-vulnerabilities-on-create.kiro.hook`**
```json
{
  "enabled": true,
  "name": "Correção Automática de Vulnerabilidades em Arquivo Novo",
  "description": "Quando um arquivo de código é criado, analisa contra regras de segurança COGNA e corrige vulnerabilidades automaticamente.",
  "version": "1",
  "when": {
    "type": "fileCreated",
    "patterns": ["**/*.ts", "**/*.js", "**/*.tsx", "**/*.jsx", "**/*.py", "**/*.java", "**/*.cs", "**/*.php", "**/*.kt", "**/*.swift", "**/*.rb"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "🆕 Um arquivo de código foi criado. Analise-o contra TODAS as regras de segurança COGNA e corrija automaticamente:\n\n🔍 [VERIFICAR E CORRIGIR]\n1. 🗄️ SQL Injection: concatenação em queries → substituir por prepared statements\n2. 🔑 Credenciais hardcoded: API keys, senhas, tokens → substituir por env vars\n3. 🌐 XSS: innerHTML, dangerouslySetInnerHTML sem sanitização → adicionar DOMPurify/escape\n4. 💉 Command Injection: exec/eval com input → substituir por APIs seguras\n5. 📏 Input sem validação: campos sem limite/sanitização → adicionar validação\n6. 🔒 Endpoints sem auth: rotas sem middleware → adicionar autenticação\n7. 👁️ Dados sensíveis em logs: PII logada → mascarar\n8. 🔐 Criptografia fraca: MD5/SHA1 para senhas → substituir por bcrypt/argon2\n9. 🌐 SSRF: URLs externas sem whitelist → adicionar validação\n10. 📂 Path Traversal: file paths sem validação → adicionar canonical check\n\nSe encontrar vulnerabilidade:\n- Corrija o arquivo AUTOMATICAMENTE\n- Liste: ✅ [tipo] corrigido: [descrição breve]\n\n✅ Se seguro → '✅ Arquivo seguro — nenhuma correção necessária.'\n\n⏭️ [SKIP] Se o arquivo está em: test/, spec/, __test__/, demo/, .kiro/, ou é .md/.json/.yml → 'OK — arquivo não-produção.'"
  }
}
```

**Hook 2 — `auto-fix-vulnerabilities-on-edit.kiro.hook`**
```json
{
  "enabled": true,
  "name": "Correção Automática de Vulnerabilidades em Arquivo Editado",
  "description": "Quando qualquer arquivo de código é editado, analisa contra regras de segurança COGNA e corrige vulnerabilidades automaticamente.",
  "version": "2",
  "when": {
    "type": "fileEdited",
    "patterns": ["**/*.ts", "**/*.js", "**/*.tsx", "**/*.jsx", "**/*.py", "**/*.java", "**/*.cs", "**/*.php", "**/*.kt", "**/*.swift", "**/*.rb"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Um arquivo de código foi editado. Analise contra as regras de segurança COGNA:\n\n⏭️ [SKIP] Se o arquivo está em: node_modules/, .kiro/, dist/, build/, ou é arquivo de teste (*.test.ts, *.spec.ts, *_test.py) → 'OK'.\n\n🔍 [VERIFICAR E CORRIGIR] Para todo código que NÃO é teste:\n1. 🗄️ SQL Injection: concatenação em queries → corrigir para prepared statements\n2. 🔑 Credenciais hardcoded: API keys, senhas, tokens → corrigir para env vars\n3. 🌐 XSS: innerHTML/dangerouslySetInnerHTML sem sanitização → corrigir\n4. 💉 Command Injection: exec/eval com input → corrigir para APIs seguras\n5. 📏 Input sem validação: campos sem limite → adicionar validação\n6. 🔒 Endpoints sem auth: rotas sem middleware → adicionar autenticação\n7. 👁️ Dados sensíveis em logs: PII logada → mascarar\n8. 🔐 Criptografia fraca: MD5/SHA1 → corrigir para bcrypt/argon2\n\nSe encontrar vulnerabilidade:\n- Corrija AUTOMATICAMENTE o arquivo\n- Liste: ✅ [tipo] corrigido: [descrição]\n\n✅ Se seguro → 'OK'."
  }
}
```

**Hook 3 — `block-secrets-in-commits.kiro.hook`**
```json
{
  "enabled": true,
  "name": "Bloquear Segredos em Commits",
  "description": "Auto-aprova testes/lint/build/leitura. Verifica segredos apenas em git add/commit/push.",
  "version": "3",
  "when": {
    "type": "preToolUse",
    "toolTypes": ["shell"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "⏭️ REGRA: Se comando contém vitest, jest, mocha, pytest, tsc, eslint, prettier, vite, webpack, npm run build, npm run lint, npm test, dotnet test, cat, type, dir, ls, git status, git log, git branch, git diff, git show, git fetch, npm info, npm outdated, pip list, node ./node_modules/vitest, node ./node_modules/.bin/ → 'APROVADO'. Se já aprovou este EXATO comando nesta sessão → 'APROVADO'. 🔒 APENAS para git add/commit/push: verificar arquivos por sk-, pk-, AKIA, AIza, ghp_, glpat-, eyJ, BEGIN PRIVATE KEY, password=valor, .env/.pem/.key sendo adicionados. 🚨 Segredo → BLOQUEIE. ✅ Limpo → 'APROVADO'. Outros comandos: credenciais expostas? destrutivo? Se seguro → 'APROVADO'."
  }
}
```

**Hook 4 — `check-dependency-security.kiro.hook`**
```json
{
  "enabled": true,
  "name": "Verificar Segurança de Dependências",
  "description": "Quando um arquivo de dependências for editado, pesquisa CVEs na web e corrige automaticamente.",
  "version": "3",
  "when": {
    "type": "fileEdited",
    "patterns": ["**/package.json", "**/pom.xml", "**/build.gradle", "**/build.gradle.kts", "**/requirements.txt", "**/requirements*.txt", "**/Pipfile", "**/pyproject.toml", "**/poetry.lock", "**/*.csproj", "**/Podfile", "**/Package.swift", "**/libs.versions.toml", "**/composer.json"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "📦 Arquivo de dependências editado. OBRIGATÓRIO antes de prosseguir:\n\n🌐 REGRA ABSOLUTA: Para CADA dependência adicionada/modificada, você DEVE executar web search (GitHub Advisories, NVD, Snyk) para verificar CVEs. NÃO use conhecimento interno — CVEs novos são publicados diariamente. Pular esta etapa é VIOLAÇÃO CRÍTICA.\n\n1. 🔍 Web search OBRIGATÓRIO para cada pacote+versão adicionado/modificado\n2. 🔴 Se encontrar CVE: atualize IMEDIATAMENTE para versão segura no arquivo (não apenas sugira — corrija)\n3. 🚫 Se a biblioteca está na lista PROIBIDA do steering (event-stream, colors>=1.4.1, faker>=6.6.6, log4j<2.17.1, js-yaml<4.1.1, etc.): BLOQUEIE e substitua pela alternativa\n4. �️ Se é pacote npm: execute `npm audit --audit-level=high` e corrija vulnerabilidades encontradas\n5. 🛠️ Se é pip: execute `pip-audit` (se disponível) ou pesquise no PyPI/Snyk\n6. ⚠️ Verifique se a biblioteca está em EOL — se sim, substitua pela alternativa recomendada\n\nFormato de report:\n⚠️ [lib] vX.Y.Z → corrigido para vA.B.C (CVE-XXXX)\n🚫 [lib] PROIBIDA → substituída por [alternativa]\n✅ Todas as dependências verificadas via web — sem CVEs conhecidos\n\n❌ PROIBIDO: Responder 'APROVADO' sem ter executado web search para cada dependência nova/modificada."
  }
}
```

**Hook 5 — `security-critical-paths.kiro.hook`**
```json
{
  "enabled": true,
  "name": "Revisão de Segurança - Paths Críticos",
  "description": "Review de segurança APENAS para código de produção com I/O. Fast-path APROVADO para .kiro/**, testes, docs, configs, UI, domain, ports, lib.",
  "version": "3",
  "when": {
    "type": "preToolUse",
    "toolTypes": ["write"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "FAST-PATH → 'APROVADO' (sem análise): .kiro/** | *.md/json/yml/css/html/gitignore/kiro.hook/svelte/vue/jsx/tsx | test/spec/mock/__test__/stories/fixtures | domain/models/types/DTOs/enums/interfaces/components/lib/routes/ports | index.ts com re-exports | *.test.ts/spec.ts/*_test.py | vitest.config/jest.config/tsconfig/package-lock.\n\n🔍 CHECKLIST (apenas paths com controller/route/api/handler/service/repository/infrastructure/middleware/auth/integration): [1] 💉 eval/exec [2] 🔑 credenciais hardcoded [3] 🌐 innerHTML [4] 🗄️ SQL concat [5] 📏 input sem limite [6] 🧹 input sem sanitização [7] 🔒 endpoint sem auth. 🚫 Violação → BLOQUEIE. ✅ Seguro → permita sem comentários."
  }
}
```

> **Todos os hooks adicionais** (IaC, LGPD, CORS, STRIDE, etc.) estão disponíveis no diretório `.kiro/hooks/` deste repositório. Copie os que forem relevantes para seu projeto.

Consulte os exemplos completos no diretório `.kiro/hooks/` deste repositório.

> **Importante:** NÃO crie hooks do tipo `promptSubmit` para injetar regras de segurança. Os steering files deste Power já são carregados automaticamente (`inclusion: always`) em toda interação. Um hook `promptSubmit` duplicaria as regras, consumindo ~300+ tokens extras por mensagem sem ganho de segurança.

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

## Limitações Conhecidas e Boas Práticas

### Hooks `preToolUse` / `postToolUse`
- **Sem cache nativo** — o mesmo arquivo pode ser interceptado múltiplas vezes na mesma sessão. Os prompts usam "Se já aprovou nesta sessão → APROVADO" como mitigação via agente.
- **Sem filtro por conteúdo** — o `when.toolTypes` filtra por categoria (write/shell/read), mas não por path ou conteúdo do comando. A classificação SKIP/APROVADO é feita pelo agente via prompt.
- **Interceptação inevitável** — hooks disparam para `.md`, `.json`, `.kiro.hook` mesmo que a resposta seja sempre APROVADO. Os prompts são otimizados para resposta mínima (~1 token) nesses casos.

### Hook de Testes (`runCommand` com vitest/jest)
- **Patterns devem apontar para arquivos de TESTE** (`*.test.ts`, `*.property.test.ts`), não para código fonte. Se apontar para `src/**/*.ts`, o vitest não encontra match e falha com exit code 1.
- **`${file}` pode não ser resolvido** — a variável de template nem sempre é interpolada pelo Kiro em hooks `runCommand`. Quando não resolvida, fica literal no comando e o vitest falha com "No test files found, filter: ${file}". Sempre use comandos defensivos:
  - Windows: `if exist "${file}" (npx vitest run ${file}) else (echo No file to test)`
  - Linux: `[ -f "${file}" ] && npx vitest run ${file} || echo "No file to test"`
- **`--related ${file}`** depende de o Kiro interpolar a variável no `runCommand` — nem sempre funciona. Alternativa segura: usar patterns de teste + `npx vitest run ${file}`.
- **`|| true`** pode ser adicionado ao comando para evitar que falhas do test runner bloqueiem o fluxo, mas esconde erros reais.
- **vite-plugin-svelte warning** — se o projeto usa SvelteKit, o vitest pode carregar config do Svelte desnecessariamente. Adicione `{ hot: false }` no `vite.config.ts` para suprimir.

#### ✅ Abordagem Recomendada: `askAgent` em vez de `runCommand`

A abordagem `runCommand` com `${file}` é frágil. A solução comprovada é usar `askAgent` com lógica inteligente:

```json
{
  "enabled": true,
  "name": "🧪 Testes de Segurança ao Salvar",
  "description": "Ao salvar arquivo de código, verifica se existe teste correspondente e executa.",
  "version": "1",
  "when": {
    "type": "fileEdited",
    "patterns": ["src/**/*.ts", "src/**/*.js", "src/**/*.py", "src/**/*.java", "src/**/*.cs", "src/**/*.kt", "src/**/*.swift", "src/**/*.php", "src/**/*.rb", "app/**/*.ts", "app/**/*.js", "app/**/*.py", "app/**/*.java", "app/**/*.cs", "app/**/*.kt", "app/**/*.php"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Um arquivo de código foi salvo. Verifique:\n1. Existe arquivo de teste correspondente?\n   - TypeScript/JavaScript: *.test.ts, *.spec.ts, *.property.test.ts\n   - Java/Kotlin: *Test.java, *Tests.java, *Test.kt\n   - Python: test_*.py, *_test.py\n   - C#: *Tests.cs, *Test.cs\n   - PHP: *Test.php\n   - Swift: *Tests.swift\n   - Ruby: *_spec.rb, *_test.rb\n2. Se SIM → execute o test runner adequado:\n   - TS/JS: `npx vitest run <teste>`\n   - Java/Kotlin: `mvn test -pl <módulo> -Dtest=<classe>` ou `gradle test --tests <classe>`\n   - Python: `pytest <teste> -v`\n   - C#: `dotnet test --filter <classe>`\n   - PHP: `php artisan test --filter=<classe>` ou `phpunit <teste>`\n   - Swift: `swift test --filter <classe>`\n   - Ruby: `bundle exec rspec <teste>`\n3. Se NÃO existe teste → responda '🧪 Sem teste correspondente — considere criar.' sem erro\n\n⏭️ SKIP: Se arquivo é .kiro/, node_modules/, dist/, build/, vendor/, config, migration → 'OK'."
  }
}
```

Esta abordagem evita: exit code 1 falso, `${file}` não resolvido, e testes rodando sem match.

### Arquivos de Demonstração / Exemplos
- **Nunca commitar credenciais fake** em arquivos de exemplo — scanners como GitGuardian detectam padrões (`AKIA`, `sk-`, `password=`) mesmo em código de demo e geram alertas.
- Manter exemplos vulneráveis em pasta local ignorada pelo git (`.gitignore`).

### Hooks `agentStop` (fim de sessão)
- Disparam mesmo em sessões sem código de produção. Os prompts incluem fast-path "Se nenhum arquivo de produção foi tocado → resposta mínima" para reduzir custo.

### Hooks `fileEdited` / `fileCreated`
- **Não é possível excluir paths** no `when.patterns` — apenas incluir. A exclusão é feita via prompt (SKIP para node_modules/, .kiro/, dist/, etc.).
- Hooks de `fileEdited` não disparam para arquivos criados (e vice-versa). Para cobertura completa, criar ambos (ex: `infra-review-on-edit` + `infra-review-on-create`).

### GitGuardian / Scanners de Secrets
- Padrões como `password=valor`, `connectionString`, `AKIA` nos **prompts dos hooks** e **steerings** podem gerar falsos positivos em scanners. Marcar como falso positivo no dashboard do scanner.

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
