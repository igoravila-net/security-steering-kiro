---
inclusion: auto
---

# Segurança por Framework Específico

> Regras específicas para cada framework homologado. Aplicar automaticamente quando detectado.

## Spring Boot (Java/Kotlin)

### Configuração Obrigatória
- spring.jpa.open-in-view: false
- spring.jackson.deserialization.fail-on-unknown-properties: true
- server.error.include-stacktrace: never
- server.error.include-message: never
- management.endpoints.web.exposure.include: health,info,metrics
- management.endpoint.health.show-details: never

### Security Config
- CSRF habilitado para apps com sessão
- CORS com whitelist explícita
- SessionCreationPolicy.STATELESS para APIs REST
- Actuator protegido com role ADMIN
- .anyRequest().denyAll() como última regra

## ASP.NET Core (C#)

### Middleware Pipeline (ordem)
1. UseExceptionHandler
2. UseHsts
3. UseHttpsRedirection
4. UseCors (restritivo)
5. UseAuthentication
6. UseAuthorization
7. UseRateLimiter

### Configuração
- Kestrel com limites de request body
- appsettings.json SEM segredos (User Secrets / Key Vault)
- DataProtection configurado

## NestJS (TypeScript)

### Configuração Obrigatória
- ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
- helmet() middleware
- express.json({ limit: '1mb' })
- ThrottlerGuard para rate limiting
- AuthGuard global
- TimeoutInterceptor (5s)

## Django (Python)

### settings.py Produção
- DEBUG = False
- ALLOWED_HOSTS definido (nunca ['*'])
- SECURE_SSL_REDIRECT = True
- SESSION_COOKIE_SECURE = True
- CSRF_COOKIE_SECURE = True
- SECURE_HSTS_SECONDS = 31536000
- X_FRAME_OPTIONS = 'DENY'

## FastAPI (Python)

### Obrigatório
- CORSMiddleware com origins whitelist
- Depends(get_current_user) em rotas protegidas
- Response model definido (nunca ORM direto)
- Pydantic com Field(max_length=...)
- HTTPException sem detalhes internos

## Express.js (JavaScript/TypeScript)

### Middleware (ordem)
1. helmet()
2. cors({ origin: whitelist })
3. express.json({ limit: '1mb' })
4. rateLimit()
5. Autenticação
6. Validação (joi/zod)

### Config
- app.disable('x-powered-by')
- Cookie: secure, httpOnly, sameSite strict

## Angular / React (Frontend)

### Obrigatório
- Não bypassar sanitização do framework
- Tokens em memória ou HttpOnly cookies (nunca localStorage)
- CSP configurado no servidor
- DOMPurify para HTML rico (se necessário)

## Swift (iOS) / Kotlin (Android)

### Obrigatório
- Keychain / EncryptedSharedPreferences para dados sensíveis
- Certificate pinning para APIs críticas
- Detecção de jailbreak/root
- Não logar dados sensíveis
