# Changelog - COGNA Security Guardrails

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [2.1.0] - 2026-05-08

### Adicionado
- Supply Chain Security para npm/Node.js no steering constraints
- Supply Chain Security para pip/Python (5 ataques, 6 pacotes proibidos, 8 regras, CI/CD)
- Supply Chain Security para Maven/Java (5 ataques, 7 pacotes proibidos, 8 regras, CI/CD)
- Supply Chain Security para NuGet/.NET (4 ataques, 5 pacotes proibidos, 6 regras, CI/CD)
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
