# Changelog - COGNA Security Guardrails

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [1.3.0] - 2026-05-07

### Adicionado
- Segurança por framework específico (Spring Boot, ASP.NET, NestJS, Django, FastAPI, Express, Angular, React, Swift, Kotlin)
- Templates de código seguro (Controller, Service, Repository, DTO, Integração, Upload, Login, Error Handler)
- Arquitetura de resiliência (Health Check, Circuit Breaker, Retry, Timeout, Métricas, Alertas)
- Onboarding de segurança para novos desenvolvedores
- Feedback loop com AppSec/Veracode (mapeamento CWE)
- Testes de regressão de segurança
- Versionamento semântico do framework

## [1.2.0] - 2026-05-07

### Adicionado
- Testes de segurança expandidos de 8 para 20 categorias
- Novas categorias: CORS, Timeout/DoS, Upload, Sessão/Cookies, Headers, CSRF, Mass Assignment, Business Logic, Desserialização, Criptografia/Tokens
- Banco de payloads maliciosos para testes parametrizados
- Cobertura mínima por componente definida
- Nomenclatura padronizada para testes

## [1.1.0] - 2026-05-07

### Adicionado
- Steering de testes de segurança automatizados (auth, authz, validation, injection, rate limiting, dados sensíveis)
- Steering de padrão de logs COGNA (campos GELF, CorrelationID, níveis, implementação por linguagem)
- Instrução de execução automática obrigatória no POWER.md
- Ícone personalizado do Grupo COGNA (icon.png)
- Versão e changelog visíveis na descrição do Power

### Melhorado
- POWER.md com seção de execução automática obrigatória
- Testes de segurança com inputs maliciosos parametrizados

## [1.0.0] - 2026-05-07

### Adicionado - Framework Base
- 40+ steerings de segurança (OWASP Top 10 + políticas corporativas)
- 8 hooks automatizados
- Exemplos em todas as linguagens homologadas
- 19 políticas corporativas COGNA convertidas
- Steerings de vulnerabilidades OWASP multilinguagem
- Steerings de APIs e autenticação (OAuth2, OIDC, JWT, PKCE)
- Steerings de infraestrutura (Cloud, IaC, Firewalls, Criptografia)
- Steerings proativos (scaffolding seguro, checklist pré-PR, erros comuns)
- Steerings condicionais por tipo de arquivo
- Sistema de aprendizado contínuo (vulnerabilidades e bibliotecas)
- Hooks: security-code-review, block-secrets-in-commits, check-dependency-security, post-task-security-scan, proactive-security-suggestions, learn-from-vulnerabilities, learn-from-insecure-dependencies, update-readme-on-steering-change
