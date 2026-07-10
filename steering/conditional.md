---
inclusion: fileMatch
fileMatchPattern: "**/*Controller*,**/*controller*,**/*Handler*,**/*handler*,**/*Route*,**/*route*,**/*Endpoint*,**/*endpoint*,**/routes/*,**/controllers/*,**/handlers/*,**/*Repository*,**/*repository*,**/*Repo*,**/*repo*,**/*DAO*,**/*dao*,**/migrations/*,**/*.sql,**/*.html,**/*.htm,**/*.jsx,**/*.tsx,**/*.vue,**/*.svelte,**/*.ejs,**/*.hbs,**/*.pug,**/templates/*,**/views/*,**/pages/*,**/components/*,**/*.tf,**/*.tfvars,**/Dockerfile,**/docker-compose*.yml,**/docker-compose*.yaml,**/k8s/*,**/kubernetes/*,**/helm/*,**/*deployment*,**/*networkpolicy*"
---

# Conditional Security Rules — Por Tipo de Arquivo

> Regras ativadas automaticamente conforme o tipo de arquivo sendo editado.

---

## Detecção Automática de Framework

> O Kiro detecta o framework do projeto pelos arquivos de configuração e ativa regras específicas.

### Ativação via SessionStart Hook (Recomendado)

Para garantir que as regras framework-specific sejam ativadas corretamente em toda sessão, crie um hook `SessionStart` que detecta o framework e injeta o contexto:

```json
{
  "version": "v1",
  "hooks": [{
    "name": "Detect Project Framework",
    "trigger": "SessionStart",
    "action": {
      "type": "command",
      "command": "node -e \"const fs=require('fs');const pkg=fs.existsSync('package.json')?JSON.parse(fs.readFileSync('package.json','utf8')):{};const deps={...pkg.dependencies,...pkg.devDependencies};let fw='unknown';if(deps['@nestjs/core'])fw='nestjs';else if(deps['express'])fw='express';else if(deps['next'])fw='nextjs';else if(deps['react'])fw='react';else if(fs.existsSync('pom.xml'))fw='spring-boot';else if(fs.existsSync('composer.json'))fw='laravel-or-php';else if(fs.existsSync('requirements.txt')||fs.existsSync('pyproject.toml'))fw='python';console.log(JSON.stringify({framework:fw,hasDeps:Object.keys(deps).length>0}))\""
    }
  }]
}
```

Alternativa mais simples (agent-based):

```json
{
  "version": "v1",
  "hooks": [{
    "name": "Detect Project Framework",
    "trigger": "SessionStart",
    "action": {
      "type": "agent",
      "prompt": "Ao iniciar esta sessão, verifique se existe package.json, pom.xml, composer.json, requirements.txt ou pyproject.toml na raiz do projeto. Identifique o framework (NestJS, Express, Next.js, Spring Boot, Laravel, Django, Flask, ASP.NET) e mantenha em mente as regras específicas do framework conforme o steering conditional.md ao longo de toda a sessão."
    }
  }]
}
```

### Regras de Detecção

| Arquivo Detectado | Framework | Regras Ativadas |
|---|---|---|
| `pom.xml` | Spring Boot (Java) | Validação com `@Valid`/`@Validated`, Spring Security config, `@PreAuthorize`, CSRF via `CsrfFilter`, `@Query` com `@Param` |
| `composer.json` | Laravel / WordPress (PHP) | Eloquent ORM (não raw queries), Blade `{{ }}` escape, `@csrf` em forms, `wp_nonce_field()`, `$wpdb->prepare()`, `esc_html()` |
| `package.json` com `@nestjs/*` | NestJS (TypeScript) | Guards (`@UseGuards`), Pipes (`ValidationPipe`), DTOs com `class-validator`, `@Roles()` decorator, Helmet middleware, `@nestjs/throttler` |
| `package.json` com `express` | Express.js (Node) | `helmet()` middleware, `cors()` com whitelist, `express-rate-limit`, `express-validator`, `hpp` (HTTP Parameter Pollution) |

### Como funciona

1. **Na abertura do projeto**, o Kiro verifica a existência dos arquivos de configuração
2. **Se `pom.xml` existe** → ativa regras Spring Boot:
   - Todo DTO deve ter `@Valid` no controller
   - `SecurityFilterChain` configurado (não `permitAll()` global)
   - Endpoints sensíveis com `@PreAuthorize("hasRole('ADMIN')")`
   - Propriedades sensíveis: `spring.datasource.password` via env/vault
3. **Se `composer.json` existe** → ativa regras Laravel/WordPress:
   - Queries via Eloquent/Query Builder (não `DB::raw()` com input)
   - Blade: `{{ $var }}` obrigatório (nunca `{!! $var !!}` com input do usuário)
   - Formulários com `@csrf` (Laravel) ou `wp_nonce_field()` (WordPress)
   - Upload via `Storage::putFile()` (Laravel) ou `wp_handle_upload()` (WordPress)
4. **Se `package.json` contém `@nestjs`** → ativa regras NestJS:
   - `ValidationPipe` global configurado no `main.ts`
   - Todo endpoint com `@UseGuards(AuthGuard)` (exceto públicos explícitos)
   - DTOs com decorators `class-validator` (`@IsString()`, `@MaxLength()`, `@IsEmail()`)
   - Rate limiting via `@nestjs/throttler`
5. **Se `package.json` contém `express`** → ativa regras Express:
   - `helmet()` como primeiro middleware
   - `cors({ origin: whitelist })` (nunca `cors()` sem config)
   - `express-rate-limit` configurado por rota
   - `express-validator` com `body().trim().escape()` em inputs
   - Body parser com limite: `express.json({ limit: '1mb' })`

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
