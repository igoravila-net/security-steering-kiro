# Changelog - COGNA Security Guardrails

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [2.4.0] - 2026-05-25

### Adicionado
- Hook `stride-pre-task-assessment` (preTaskExecution): avaliação STRIDE antes de tarefas com fast-path SKIP para types/testes/generators/checkpoints (4.4)
- Hook `security-implementation-verification` (postToolUse write): cruza mitigações STRIDE com código produzido em application/infrastructure (4.3)
- Detecção de stack traces com paths internos no shell-output-scanner (4.7)
- Detecção de erros de compilação sensíveis no shell-output-scanner (4.7)
- `npx depcheck` integrado ao dependency-health-check para detectar dependências não utilizadas (4.2)
- Priorização visual com emojis no dependency-health-check (🔴🟠🟡🔵⚪🗑️)
- Emojis visuais em TODOS os hooks para identificação rápida de categorias
- Hook `infra-review-on-create` (fileCreated): verifica segurança IaC desde a criação do arquivo
- Cobertura IaC expandida: CI/CD pipelines (GitHub Actions, GitLab CI, Jenkins), Helm values, nginx/apache, .dockerignore

### Alterado
- security-critical-paths v3: prompt reduzido ~60% com fast-path de 1 linha para AUTO-APPROVE (4.1)
- shell-output-scanner v4: expandido para deprecated em qualquer comando npm + stack traces + compilation errors (4.7)
- dependency-health-check v2: cobertura multi-ecossistema expandida (pip-audit, mvn, dotnet, composer) (4.2)
- adoption-metrics: fast-path para sessões sem código de produção
- proactive-security-suggestions: fast-path para sessões sem código de produção
- power-feedback-collector: fast-path para sessões sem código de produção
- Todos os hooks agentStop otimizados: ~200 tokens economizados por sessão de docs/análise
- infra-review-on-edit: emojis por plataforma (🐳 Docker, ☁️ Terraform, ☸️ Kubernetes)
- cors-security-headers-check: emojis por seção (🔀 CORS, 🛡️ Headers)
- lgpd-data-review: emojis por verificação LGPD
- post-task-security-scan: emojis por categoria de vulnerabilidade
- auto-fix-vulnerabilities-on-create: emojis por tipo de correção
- detect-secrets-files-edit: emojis de alerta
- Instruções de setup rápido no README atualizadas com prompts v2.4.0

### Removido
- `security-code-review.kiro.hook` — desabilitado, substituído por security-critical-paths
- `npm-audit-on-dependency-change.kiro.hook` — redundante com check-dependency-security
- `learn-from-insecure-dependencies.kiro.hook` — disparava em 100% das leituras, ~1% útil

### Métricas Esperadas
- Interceptações redundantes/sessão: ~15-20 → ~3-5
- Tokens desperdiçados/sessão: ~4.000-8.000 → ~500-1.000
- Gap STRIDE (identificar vs verificar): ~40% → ~5%
- Assessments desnecessários em specs grandes: ~70% → ~10%

## [2.3.0] - 2026-05-12

### Adicionado
- Go completo — padrões de código seguro (SQL, Command Injection, XSS, Path Traversal, Auth, Crypto, Error Handling, Race Conditions, Input Validation)
- Supply Chain para Go Modules (govulncheck, GOPRIVATE, go.sum)
- CWE Top 25 MITRE 2024 — cobertura 100% (25/25) incluindo Memory Safety (CWE-787, 125, 416, 119, 190)
- 21 CWEs adicionais mapeadas (total: 46 CWEs cobertas)
- CVEs 2025-2026: Next.js CVE-2025-29927, React RSC CVE-2025-55182, Spring Cloud Gateway CVE-2025-41243, Spring AI data exposure
- Ataques supply chain 2025-2026: Mini Shai-Hulud (worm npm), PhantomRaven (Remote Dynamic Dependencies)
- Regra: Bloquear Remote Dynamic Dependencies (URLs externas em package.json)
- Hook auto-fix-vulnerabilities-on-create: correção automática ao criar arquivo de código
- Hook auto-fix-vulnerabilities-on-edit: correção automática ao editar código de produção
- Hook dependency-health-check: verificação completa sob demanda (outdated + deprecated + CVEs)
- Hook security-critical-paths v2: auto-approve para barrel exports e ports/
- Shell-output-scanner v3: detecta npm deprecated warnings
- Regra de dependências não utilizadas (depcheck, knip, dependency:analyze)
- Documento CWE-MAPPING com mapeamento completo de 46 CWEs → steerings
- Instruções de setup rápido para projetos consumidores no README

### Alterado
- Check-dependency-security v2: correção automática + npm audit obrigatório
- README expandido com hooks auto-fix e instruções passo-a-passo de criação
- Linguagens suportadas: adicionado Go (microserviços, APIs)

---

## [2.2.0] - 2026-05-08

### Adicionado
- OWASP Top 10:2025 A10 — Mishandling of Exceptional Conditions
- OWASP LLM Top 10:2025 — 7 categorias (Prompt Injection, Sensitive Disclosure, Supply Chain modelos, Output Handling, Excessive Agency, Prompt Leakage, Unbounded Consumption)
- OWASP API Security Top 10:2023 expandido — regras detalhadas para todas as 10 categorias
- PHP completo — padrões de código seguro (SQL, XSS, Command/Code Injection, Auth, Upload, Config)
- WordPress Security — plugins, temas, REST API, CSRF, wp-config, plugins proibidos
- Supply Chain para Composer/PHP (4 ataques, 5 pacotes proibidos, CI/CD)
- Supply Chain para NuGet/.NET (4 ataques, 5 pacotes proibidos, CI/CD)
- Templates de testes de segurança expandidos (Python pytest, C# xUnit, PHP PHPUnit, Kotlin JUnit)
- Banco de payloads maliciosos (SQL, XSS, Command, Path Traversal, CRLF)
- Detecção automática de framework (Spring Boot, Laravel, NestJS, Express)
- Exemplos inline ❌→✅ por linguagem (Java, TypeScript, Python, PHP, C#)
- Hook LGPD contextual para entidades com PII
- Hook métricas de adoção
- Hook mapeamento Veracode CWE
- Hook feedback collector v2 (ignora limitações da plataforma)
- Regra Absoluta de Dependências: verificar CVEs via web ANTES de escrever versões
- Demo completa com 9 cenários + roteiro para apresentação à liderança

### Alterado
- Referências atualizadas para OWASP Top 10:2025
- PHP classificado como "suportada (não homologada)" — 13 linguagens homologadas + 1 suportada
- Hooks v4 com prompts ultra-concisos e auto-approve para UI (.svelte, .vue, .jsx, .tsx)
- Lista explícita de hooks que NÃO devem ser criados no projeto consumidor

---

## [2.1.0] - 2026-05-08

### Adicionado
- OWASP Top 10:2025 A10 — Mishandling of Exceptional Conditions (fail-closed, graceful degradation, cleanup, timeout, error boundaries)
- OWASP LLM Top 10:2025 — Prompt Injection, Sensitive Disclosure, Supply Chain modelos, Output Handling, Excessive Agency, Prompt Leakage, Unbounded Consumption
- OWASP API Security Top 10:2023 expandido — regras detalhadas para todas as 10 categorias (BOLA, auth, property-level authz, resource consumption, function-level authz, business flows, SSRF, misconfiguration, inventory, unsafe consumption)
- Supply Chain Security para npm/Node.js no steering constraints
- Supply Chain Security para pip/Python (5 ataques, 6 pacotes proibidos, 8 regras, CI/CD)
- Supply Chain Security para Maven/Java (5 ataques, 7 pacotes proibidos, 8 regras, CI/CD)
- Supply Chain Security para NuGet/.NET (4 ataques, 5 pacotes proibidos, 6 regras, CI/CD)
- Regra Absoluta de Dependências: agente DEVE verificar CVEs via web ANTES de escrever versões
- Hooks v4 com verificação contextual por nível de risco (reduz fricção ~70%)
- Hook detect-secrets-files: alerta ao criar .env, .pem, .key, credentials
- Hook detect-secrets-files-edit: alerta ao editar arquivos de secrets
- Hook npm-audit-on-dependency-change: executa npm audit automaticamente
- Hook security-review-on-demand: revisão completa (20 categorias) sob demanda
- Hook infra-review-on-edit: detecta regressões em Dockerfile, Terraform, K8s editados
- Hook shell-output-scanner: escaneia output de comandos por credenciais expostas
- Hook cors-security-headers-check: verifica CORS e headers ao editar servidor/middleware
- Hook power-feedback-collector v2: coleta feedback acionável (ignora limitações da plataforma)
- Hook lgpd-data-review: verifica mascaramento/consentimento/retenção em entidades com PII
- Hook adoption-metrics: registra métricas de uso por sessão
- Hook veracode-cwe-mapping: mapeia findings Veracode para steerings (manual AppSec)
- Documentação completa de todos os 21 hooks no README com nomes de arquivo
- Alerta no README contra hook promptSubmit redundante
- Documentação de limitações conhecidas da plataforma Kiro

### Alterado
- Hook security-code-review v4: prompts ultra-concisos, cache por sessão, auto-approve para .svelte/.vue/.jsx/.tsx e paths de UI
- Hook block-secrets-in-commits v3: whitelist expandida (node ./node_modules/vitest, .bin/)
- Hook proactive-security-suggestions v3: contextual (só produção com I/O)
- Hook learn-from-vulnerabilities v2: ignora bloqueios em testes/docs/configs
- Hook check-dependency-security v2: correção automática de CVEs + npm audit obrigatório
- Hook update-readme-on-steering-change v2: atualizado para steerings temáticos v2.0.0
- README atualizado com seção de hooks separada em categorias (15 recomendados + 6 manutenção)
- Hook proactive-security-suggestions v2: sugere apenas para código de produção com I/O
- Hook learn-from-vulnerabilities v2: ignora bloqueios em testes/docs/configs
- README atualizado com seção de hooks separada em categorias
- Hook update-readme-on-steering-change atualizado para novos steerings temáticos v2.0.0

---

## [2.0.0] - 2026-05-07

### Breaking Change — Reestruturação Completa

Consolidação de ~62 steerings individuais em 7 steerings temáticos, seguindo o modelo do [arm-soc-migration Power](https://github.com/kirodotdev/powers/blob/main/arm-soc-migration/).

### Estrutura Nova

| Arquivo | Conteúdo |
|---|---|
| constraints.md | Regras críticas, input malicioso, scaffolding, secrets scanning, dependências |
| implementation.md | Padrões de código seguro por vulnerabilidade (injection, XSS, SSRF, crypto, auth, APIs) |
| validation.md | Testes de segurança (20 categorias), checklist pré-PR, threat modeling STRIDE |
| policies.md | Políticas corporativas COGNA (SI, LGPD, acessos, incidentes, IA, criptografia, cloud) |
| infrastructure.md | IaC (Terraform, Docker, K8s), deployment, resiliência, CI/CD security |
| observability.md | Padrão de logs COGNA (GELF, CorrelationID), monitoramento, auditoria |
| conditional.md | Regras por tipo de arquivo (controllers, repos, templates, infra) via fileMatch |

### Motivação
- Redução de ~90% no número de arquivos (62 para 7)
- Minimização de contexto carregado pelo Kiro
- Estrutura alinhada com padrão oficial de Powers (POWER.md enxuto + steerings temáticos)
- Eliminação de redundâncias entre steerings

### Removido
- Todos os arquivos seguranca-*.md individuais (62 arquivos)
- Steerings de aprendizado contínuo (dados voláteis não pertencem a steerings)
- Changelog e versionamento inline no POWER.md

### Alterado
- POWER.md reescrito: enxuto (overview + lista de steerings + SLAs + referências)
- README.md atualizado para refletir nova estrutura
- conditional.md unifica os 4 steerings condicionais em um único arquivo com fileMatch amplo

---

## [1.4.0] - 2026-05-07

### Adicionado
- Secrets scanning (API keys, tokens, senhas, chaves privadas, cloud)
- Threat modeling STRIDE automatizado + Security Champions
- PR security description checklist
- Compliance as Code (LGPD, PCI-DSS, menores)
- Métricas de adoção e feedback loop
- Consulta automática de CVEs
- Padrões OWASP PTK

### Otimizado
- 8 steerings redundantes removidos (-1.360 linhas)
- 14 steerings mudados para inclusion: manual
- Contexto reduzido em ~37%

## [1.3.0] - 2026-05-07

### Adicionado
- Segurança por framework específico (Spring Boot, ASP.NET, NestJS, Django, FastAPI, Express, Angular, React, Swift, Kotlin)
- Templates de código seguro
- Arquitetura de resiliência
- Onboarding de segurança para novos desenvolvedores
- Feedback loop com AppSec/Veracode
- Testes de regressão de segurança

## [1.2.0] - 2026-05-07

### Adicionado
- Testes de segurança expandidos de 8 para 20 categorias
- Banco de payloads maliciosos para testes parametrizados
- Cobertura mínima por componente definida

## [1.1.0] - 2026-05-07

### Adicionado
- Steering de testes de segurança automatizados
- Steering de padrão de logs COGNA
- Instrução de execução automática obrigatória no POWER.md

## [1.0.0] - 2026-05-07

### Adicionado — Framework Base
- 40+ steerings de segurança (OWASP Top 10 + políticas corporativas)
- 8 hooks automatizados
- Exemplos em todas as linguagens homologadas
- 19 políticas corporativas COGNA convertidas
- Steerings condicionais por tipo de arquivo
