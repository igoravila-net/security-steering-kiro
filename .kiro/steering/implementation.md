---
inclusion: auto
---

# Secure Implementation — Padrões de Código Seguro

> Padrões obrigatórios por tipo de vulnerabilidade com exemplos multilinguagem.
> Referências: OWASP Top 10, OWASP API Security Top 10, OWASP Cheat Sheet Series.

---

## 1. SQL / Code / Command Injection

### SQL Injection — SEMPRE parametrizar
- C#: EF Core (parametrizado por padrão), Dapper com new { param }
- Java: JPA @Query com @Param, PreparedStatement
- TypeScript: Prisma, Knex, pg com $1 placeholders
- Python: SQLAlchemy ORM, psycopg2 com %s tuple, Django ORM
- Kotlin: Exposed framework, PreparedStatement

PROIBIDO: concatenação de strings em queries, f-strings/template literals em SQL.

### Code Injection — NUNCA executar código dinâmico
- Usar whitelist de operações (Map/Dict de funções permitidas)
- PROIBIDO: eval(), exec(), Function(), ScriptEngine.eval(), CSharpScript com input externo

### Command Injection — NUNCA usar shell com input
- Usar APIs sem shell: ProcessBuilder (Java), execFile (Node), subprocess com shell=False (Python)
- Validar input contra regex whitelist antes de passar como argumento
- PROIBIDO: Runtime.exec(string), exec() com concatenação, shell=True, Invoke-Expression

---

## 2. Cross-Site Scripting (XSS)

### Regras por framework
- React/Angular/Vue: escape automático por padrão — NUNCA usar dangerouslySetInnerHTML/innerHTML sem DOMPurify
- Razor (.NET): escape automático — NUNCA usar Html.Raw com input
- Thymeleaf (Java): th:text seguro — NUNCA th:utext com input não sanitizado
- Jinja2/Django: escape automático — NUNCA safe filter ou mark_safe com input
- Vanilla JS: usar textContent — NUNCA innerHTML com dados do usuário

### Sanitização de HTML rico
- Usar DOMPurify (JS), OWASP Java HTML Sanitizer, Bleach (Python)
- Whitelist de tags permitidas: p, b, i, em, strong, a
- CSP header obrigatório: default-src self; script-src self

---

## 3. SSRF e Desserialização

### SSRF — Validar todas as URLs externas
- Whitelist de hosts/domínios permitidos
- Bloquear redes internas (127.0.0.1, 10.x, 172.16-31.x, 192.168.x)
- Bloquear protocolos perigosos (file://, gopher://)
- Resolver DNS e verificar IP antes de conectar
- Limitar redirecionamentos HTTP

### Desserialização — Preferir JSON
- NUNCA usar ObjectInputStream sem ObjectInputFilter (Java 9+)
- NUNCA habilitar Jackson defaultTyping
- Usar formatos seguros (JSON com tipos explícitos)
- Whitelist de classes se serialização Java for inevitável

### XXE — Desabilitar DTDs
- DocumentBuilderFactory: disallow-doctype-decl=true, external-entities=false
- Preferir JSON sobre XML quando possível

---

## 4. Criptografia

### Algoritmos OBRIGATÓRIOS
- Simétrica: AES-256-GCM (NUNCA ECB, DES, RC4, 3DES)
- Hash integridade: SHA-256+ (NUNCA MD5, SHA-1)
- Hash senhas: Argon2id (min 19MiB, 2 iter) ou BCrypt (work factor >= 12)
- Assinatura JWT: RS256 ou ES256 (NUNCA HS256 para APIs públicas)
- TLS: 1.2+ obrigatório, 1.3 preferido

### Regras
- Chaves NUNCA hardcoded — usar KMS/vault do cloud provider
- IV/nonce gerado com CSPRNG (SecureRandom, crypto.randomBytes, os.urandom)
- NUNCA usar Math.random/Random para segurança — usar CSPRNG

---

## 5. Autenticação e Sessão

### Senhas
- Hash: Argon2id ou BCrypt (work factor >= 12)
- Mínimo 16 caracteres, 3 de 4 tipos (maiusc, minusc, números, especiais)
- Histórico: bloquear últimas 9 senhas
- Bloqueio após 5 tentativas, desbloqueio após 10 min
- Troca a cada 60 dias

### Tokens JWT
- Access token: max 15 min TTL
- Refresh token: max 7 dias TTL
- Validar SEMPRE: issuer, audience, expiration, nbf
- PKCE obrigatório para SPAs e mobile
- State parameter obrigatório (anti-CSRF)
- Armazenar em HttpOnly cookie (NUNCA localStorage)

### Sessão
- IDs com mínimo 128 bits de entropia
- Regenerar após login (prevenir session fixation)
- Cookies: Secure + HttpOnly + SameSite=Strict
- Timeout inatividade: max 30 min
- Invalidação completa no logout (server-side)

---

## 6. Autorização e Controle de Acesso

### BOLA/IDOR — Verificar ownership em TODA operação
- Filtrar queries por userId do autenticado
- Usar UUIDs em URLs públicas (não IDs sequenciais)
- Verificar que recurso pertence ao usuário autenticado

### RBAC
- Deny-by-default: tudo bloqueado, liberar explicitamente
- Verificar autorização em CADA endpoint (não apenas gateway)
- Endpoints admin separados com role check
- Campos sensíveis (role, isAdmin, balance) NUNCA alteráveis pelo usuário

### Encapsulamento
- DTOs separados da entidade (NUNCA expor entidade via API)
- Campos sensíveis (passwordHash, internalNotes) NUNCA no DTO de resposta
- Setters privados para campos críticos (role, balance)

---

## 7. API Security (OWASP API Top 10)

### Headers de Segurança — OBRIGATÓRIO em toda resposta
- Content-Type: application/json; charset=utf-8
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Strict-Transport-Security: max-age=31536000; includeSubDomains
- Cache-Control: no-store
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

### CORS
- Origins: whitelist explícita (NUNCA wildcard)
- Methods: apenas necessários
- Max Age: 3600

### Rate Limiting

| Endpoint | Limite |
|---|---|
| Login/Auth | 5 req/min por IP |
| Registro | 3 req/hora por IP |
| API autenticada | 100 req/min por usuário |
| API anônima | 20 req/min por IP |
| Upload | 10 req/hora por usuário |
| Operações sensíveis | 5 req/min por usuário |

### Error Handling
- Mensagens genéricas ao cliente (NUNCA stack trace, SQL, nomes de classes)
- Não revelar se usuário/email existe (mensagem única para login inválido)
- Remover headers Server e X-Powered-By

---

## 8. CRLF Injection

- Remover \r\n de TODA entrada antes de usar em headers HTTP
- Validar URLs de redirecionamento (apenas internas, sem //)
- Sanitizar antes de logar (prevenir log injection)

---

## 9. Credentials e Directory Traversal

### Credentials
- NUNCA hardcoded — usar vault, env vars, Keychain (iOS), EncryptedSharedPreferences (Android)
- .gitignore obrigatório: .env, *.pem, *.key, *credentials*, *secrets*
- Validar variáveis de ambiente no startup (falhar se ausentes)

### Directory Traversal
- Resolver path com normalize/canonical
- Verificar que path resolvido começa com diretório base permitido
- NUNCA concatenar input do usuário diretamente em paths de arquivo

---

## 10. Information Leakage

- Stack traces: NUNCA ao cliente (logar internamente, retornar mensagem genérica)
- Headers: remover Server, X-Powered-By
- Erros de auth: mensagem única (não revelar se email existe)
- Configuração produção: DEBUG=false, show-sql=false, include-stacktrace=never
- Actuator/debug endpoints: desabilitados ou protegidos com auth forte
- Outputs Terraform sensíveis: sensitive=true

---

## 11. Race Conditions e Code Quality

### Race Conditions
- Transações com isolamento adequado para operações financeiras
- SELECT FOR UPDATE / pessimistic lock em operações críticas
- Semaphore/Lock para operações concorrentes

### Recursos
- SEMPRE usar try-with-resources (Java), using (C#), with (Python), use (Kotlin)
- Cleanup em finally/defer para recursos não gerenciados
- AbortController com timeout para fetch (JS/TS)
