---
inclusion: fileMatch
fileMatchPattern: "**/*Controller*,**/*controller*,**/*Handler*,**/*handler*,**/*Route*,**/*route*,**/*Endpoint*,**/*endpoint*,**/routes/*,**/controllers/*,**/handlers/*,**/*Repository*,**/*repository*,**/*Repo*,**/*repo*,**/*DAO*,**/*dao*,**/migrations/*,**/*.sql,**/*.html,**/*.htm,**/*.jsx,**/*.tsx,**/*.vue,**/*.svelte,**/*.ejs,**/*.hbs,**/*.pug,**/templates/*,**/views/*,**/pages/*,**/components/*,**/*.tf,**/*.tfvars,**/Dockerfile,**/docker-compose*.yml,**/docker-compose*.yaml,**/k8s/*,**/kubernetes/*,**/helm/*,**/*deployment*,**/*networkpolicy*"
---

# Conditional Security Rules — Por Tipo de Arquivo

> Regras ativadas automaticamente conforme o tipo de arquivo sendo editado.

---

## Controllers, Handlers e Rotas

Ativado em: Controller, Handler, Route, Endpoint, routes/*, controllers/*, handlers/*

### OBRIGATÓRIO neste contexto
- Autenticação em TODOS os endpoints (exceto health/public explícito)
- Autorização: verificar role E ownership do recurso
- Validação em TODOS os request bodies
- Limite de caracteres em TODOS os parâmetros (query, path, body)
- Chamada a InputSanitizer antes de usar qualquer parâmetro
- Rate limiting configurado
- Paginação com limites (page >= 0, size entre 1 e 100)
- Retorno via DTO (NUNCA entidade de banco)
- Error handling: mensagem genérica, sem stack trace
- Log de auditoria: userId + action + timestamp
- CORS configurado (whitelist, não wildcard)

---

## Repositories, DAOs e SQL

Ativado em: Repository, Repo, DAO, migrations/*, *.sql

### OBRIGATÓRIO neste contexto
- NUNCA concatenar strings para montar queries
- SEMPRE usar consultas parametrizadas
- Filtrar por userId/tenantId quando dados são por usuário
- Paginação obrigatória em listagens (LIMIT/OFFSET)
- Conexão com SSL/TLS habilitado
- Validar input ANTES de passar para a query
- Limitar tamanho de parâmetros de busca (max 200 chars)

---

## Templates, Views e Componentes Frontend

Ativado em: *.html, *.jsx, *.tsx, *.vue, *.svelte, *.ejs, *.hbs, *.pug, templates/*, views/*, pages/*, components/*

### OBRIGATÓRIO neste contexto
- Usar mecanismo de escape automático do framework
- Se HTML rico necessário: sanitizar com biblioteca aprovada ANTES de renderizar
- Content-Security-Policy configurado
- Nenhum event handler inline com dados dinâmicos
- Dados sensíveis NUNCA renderizados sem mascaramento
- Formulários com proteção CSRF (token)
- Inputs com maxlength definido no HTML
- Autocomplete=off em campos sensíveis
- Nenhum script inline com dados do usuário

---

## Infraestrutura como Código

Ativado em: *.tf, *.tfvars, Dockerfile, docker-compose*.yml, k8s/*, kubernetes/*, helm/*, deployment, networkpolicy

### OBRIGATÓRIO neste contexto

#### Terraform
- Security Groups: NUNCA 0.0.0.0/0 em portas sensíveis
- RDS/Banco: publicly_accessible=false, storage_encrypted=true
- S3/Storage: block_public_access=true, encryption habilitada
- Outputs sensíveis: sensitive=true
- Credenciais: via secrets manager (NUNCA hardcoded)
- deletion_protection=true em produção

#### Docker
- USER não-root obrigatório
- Multi-stage build
- Imagem base mínima (alpine, distroless)
- HEALTHCHECK configurado
- Nenhum segredo na imagem
- Tag específica (NUNCA :latest)

#### Kubernetes
- runAsNonRoot: true
- allowPrivilegeEscalation: false
- readOnlyRootFilesystem: true
- capabilities: drop ALL
- Resource limits obrigatórios
- Imagens com digest (sha256)
- Secrets via secretKeyRef
- NetworkPolicy aplicada

#### Docker Compose
- user: UID:GID não-root
- read_only: true
- security_opt: no-new-privileges
- cap_drop: ALL
- deploy.resources.limits definidos
- ports: bind em 127.0.0.1 quando possível
