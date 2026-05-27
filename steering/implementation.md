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

#### Exemplos Antes/Depois — SQL Injection

**Java:**
```
❌ VULNERÁVEL: String query = "SELECT * FROM users WHERE email = '" + email + "'";
✅ SEGURO:    PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE email = ?"); ps.setString(1, email);
```

**TypeScript:**
```
❌ VULNERÁVEL: const result = await db.query(`SELECT * FROM users WHERE email = '${email}'`);
✅ SEGURO:    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
```

**Python:**
```
❌ VULNERÁVEL: cursor.execute(f"SELECT * FROM users WHERE email = '{email}'")
✅ SEGURO:    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
```

**PHP:**
```
❌ VULNERÁVEL: $stmt = $pdo->query("SELECT * FROM users WHERE email = '$email'");
✅ SEGURO:    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?"); $stmt->execute([$email]);
```

**C#:**
```
❌ VULNERÁVEL: var cmd = new SqlCommand($"SELECT * FROM users WHERE email = '{email}'", conn);
✅ SEGURO:    var cmd = new SqlCommand("SELECT * FROM users WHERE email = @email", conn); cmd.Parameters.AddWithValue("@email", email);
```

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

#### Exemplos Antes/Depois — XSS

**Java (Thymeleaf):**
```
❌ VULNERÁVEL: <span th:utext="${userInput}"></span>
✅ SEGURO:    <span th:text="${userInput}"></span>
```

**TypeScript (React):**
```
❌ VULNERÁVEL: <div dangerouslySetInnerHTML={{ __html: userInput }} />
✅ SEGURO:    <div>{DOMPurify.sanitize(userInput)}</div>
```

**Python (Jinja2):**
```
❌ VULNERÁVEL: {{ user_input | safe }}
✅ SEGURO:    {{ user_input }}
```

**PHP (Blade/WordPress):**
```
❌ VULNERÁVEL: {!! $userInput !!}  |  echo $userInput;
✅ SEGURO:    {{ $userInput }}     |  echo esc_html($userInput);
```

**C# (Razor):**
```
❌ VULNERÁVEL: @Html.Raw(userInput)
✅ SEGURO:    @userInput
```

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

#### Exemplos Antes/Depois — Autenticação

**Java (Spring Boot):**
```
❌ VULNERÁVEL: String hash = MessageDigest.getInstance("MD5").digest(password.getBytes()).toString();
✅ SEGURO:    String hash = new BCryptPasswordEncoder(12).encode(password);
```

**TypeScript (Node.js):**
```
❌ VULNERÁVEL: const hash = crypto.createHash('md5').update(password).digest('hex');
✅ SEGURO:    const hash = await bcrypt.hash(password, 12);
```

**Python:**
```
❌ VULNERÁVEL: password_hash = hashlib.md5(password.encode()).hexdigest()
✅ SEGURO:    password_hash = argon2.PasswordHasher().hash(password)
```

**PHP:**
```
❌ VULNERÁVEL: $hash = md5($password);
✅ SEGURO:    $hash = password_hash($password, PASSWORD_ARGON2ID);
```

**C#:**
```
❌ VULNERÁVEL: var hash = MD5.Create().ComputeHash(Encoding.UTF8.GetBytes(password));
✅ SEGURO:    var hash = BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
```

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

---

## 12. Mishandling of Exceptional Conditions (OWASP A10:2025)

> Categoria NOVA no OWASP Top 10:2025. Cobre falhas no tratamento de condições excepcionais que levam a bypass de segurança, exposição de estado interno ou degradação insegura.

### VIOLAÇÕES CRÍTICAS
- Exception não tratada que expõe stack trace ao cliente → Catch genérico com mensagem segura
- Error condition que bypassa validação/auth → Garantir que falha = deny (fail-closed)
- Resource exhaustion sem graceful degradation → Circuit breaker + fallback seguro
- Panic/crash que deixa sistema em estado inseguro → Cleanup em finally/defer
- Timeout sem tratamento que deixa conexão aberta → Timeout + abort + cleanup

### Regras OBRIGATÓRIAS

1. **Fail-Closed (Deny by Default)**
   - Se uma verificação de segurança falha com exceção → NEGAR acesso (não permitir)
   - Se auth/authz lança exceção → retornar 401/403 (não 200)
   - Se validação falha → rejeitar request (não processar parcialmente)

2. **Graceful Degradation**
   - Serviço externo indisponível → fallback seguro (cache, resposta padrão, circuit breaker)
   - NUNCA expor erro interno ao cliente durante degradação
   - Logar detalhes internamente, retornar mensagem genérica

3. **Resource Cleanup em Falha**
   - Transações: rollback em exceção (NUNCA commit parcial)
   - Conexões: fechar em finally/using/with (NUNCA leak)
   - Locks: liberar em finally (NUNCA deadlock por exceção)
   - Arquivos temporários: cleanup em finally/defer

4. **Timeout Handling**
   - TODA chamada externa DEVE ter timeout configurado (máx 5s padrão)
   - Timeout atingido → abort + cleanup + log + resposta ao cliente
   - NUNCA deixar thread/goroutine/promise pendente indefinidamente

5. **Error Boundaries**
   - Frontend: Error Boundary (React), errorHandler (Vue), handleError (SvelteKit)
   - Backend: Global exception handler que NUNCA expõe internals
   - Middleware: catch-all que garante resposta HTTP válida mesmo em panic

---

## 13. OWASP LLM Top 10:2025 — Segurança em Aplicações com IA

> Regras para código que integra ou consome Large Language Models (LLMs).

### LLM01 — Prompt Injection
- NUNCA concatenar input do usuário diretamente no system prompt
- Separar instruções do sistema de dados do usuário com delimitadores claros
- Validar e sanitizar input ANTES de incluir em prompts
- Implementar output validation — não confiar na resposta do LLM

### LLM02 — Sensitive Information Disclosure
- NUNCA incluir PII, credenciais ou dados confidenciais em prompts
- Filtrar output do LLM por padrões de dados sensíveis antes de retornar ao usuário
- Implementar guardrails de output (regex para CPF, email, cartão, etc.)
- Logs de prompts: mascarar dados sensíveis

### LLM03 — Supply Chain (Modelos)
- Verificar integridade de modelos baixados (checksums, assinaturas)
- Usar apenas modelos de fontes confiáveis (HuggingFace verificado, OpenAI, etc.)
- Pinnar versões de modelos (não usar "latest")
- Auditar plugins/tools que o LLM pode invocar

### LLM05 — Improper Output Handling
- Tratar output do LLM como UNTRUSTED (mesmo input malicioso)
- NUNCA executar código gerado por LLM sem revisão/sandbox
- Sanitizar output antes de renderizar em HTML (prevenir XSS via LLM)
- Validar formato/schema de respostas estruturadas (JSON schema)

### LLM06 — Excessive Agency
- Princípio do menor privilégio para tools/functions que o LLM pode chamar
- Requerer confirmação humana para ações destrutivas (delete, deploy, pagamento)
- Limitar escopo de acesso: LLM não deve ter acesso admin
- Rate limiting em chamadas de tools pelo LLM

### LLM07 — System Prompt Leakage
- Não armazenar secrets no system prompt
- Implementar defesas contra extração de prompt (instruções anti-leak)
- Monitorar tentativas de extração (padrões como "ignore previous instructions")

### LLM10 — Unbounded Consumption
- Rate limiting em chamadas à API de LLM (por usuário e global)
- Limitar tamanho de input (max tokens)
- Timeout em chamadas ao LLM (máx 30s)
- Budget/quota por usuário para prevenir abuse
- Circuit breaker se API do LLM estiver lenta/indisponível

---

## 14. OWASP API Security Top 10:2023 — Regras Expandidas

> Complementa a seção 7 com regras detalhadas por categoria do API Security Top 10.

### API1:2023 — Broken Object Level Authorization (BOLA)
- TODA operação em recurso DEVE verificar ownership: `resource.userId == authenticatedUser.id`
- Usar UUIDs em URLs públicas (não IDs sequenciais/previsíveis)
- Implementar middleware de ownership check reutilizável
- Testes obrigatórios: acessar recurso de outro usuário deve retornar 403

### API2:2023 — Broken Authentication
- Tokens com TTL curto (access: 15min, refresh: 7d)
- Rate limiting em /login, /register, /forgot-password (5 req/min)
- Não revelar se email/usuário existe (mensagem genérica)
- MFA para operações sensíveis

### API3:2023 — Broken Object Property Level Authorization
- DTOs de REQUEST separados de DTOs de RESPONSE
- Campos admin (role, isAdmin, balance, permissions) NUNCA alteráveis via request body
- Whitelist de campos permitidos por role (não blacklist)
- Mass Assignment protection: usar @JsonIgnore, [BindNever], exclude_fields

### API4:2023 — Unrestricted Resource Consumption
- Rate limiting por IP E por usuário (dupla camada)
- Limitar body size (1MB JSON, 10MB upload)
- Paginação obrigatória (max 100 itens por página)
- Timeout em TODA operação (5s padrão, 30s para relatórios)
- Limitar complexidade de queries (GraphQL: depth limit, cost analysis)

### API5:2023 — Broken Function Level Authorization
- Endpoints admin em path separado (/api/admin/*) com role check
- Deny-by-default: tudo bloqueado, liberar explicitamente por role
- Verificar autorização em CADA endpoint (não apenas no gateway)
- Testes: usuário comum acessando endpoint admin deve retornar 403

### API6:2023 — Unrestricted Access to Sensitive Business Flows
- Rate limiting diferenciado para fluxos críticos (pagamento, criação de conta)
- CAPTCHA/challenge para operações sensíveis automatizáveis
- Detectar padrões de abuse (muitas tentativas sequenciais, scraping)
- Implementar step-up authentication para operações de alto valor

### API7:2023 — Server Side Request Forgery (SSRF)
- Whitelist de hosts/URLs permitidos para chamadas externas
- Bloquear redes internas (127.0.0.1, 10.x, 172.16-31.x, 192.168.x, 169.254.x)
- Bloquear protocolos perigosos (file://, gopher://, dict://)
- Resolver DNS e verificar IP ANTES de conectar (anti-DNS rebinding)
- Limitar redirecionamentos (max 2)

### API8:2023 — Security Misconfiguration
- Desabilitar endpoints de debug/actuator em produção
- Remover headers que expõem tecnologia (Server, X-Powered-By)
- CORS restritivo (whitelist de origins, não wildcard)
- Error handling sem stack traces/SQL/nomes de classes
- TLS 1.2+ obrigatório, HSTS habilitado

### API9:2023 — Improper Inventory Management
- Documentar TODOS os endpoints (OpenAPI/Swagger atualizado)
- Versionar APIs (/api/v1/, /api/v2/)
- Deprecar com headers (Deprecation: true, Sunset: date)
- Remover versões antigas após prazo (min 6 meses)
- Não expor endpoints internos publicamente (separar por network/gateway)

### API10:2023 — Unsafe Consumption of APIs
- Validar TODAS as respostas de APIs externas (não confiar)
- Timeout e circuit breaker para chamadas a terceiros
- Sanitizar dados recebidos de APIs externas antes de usar
- TLS obrigatório para comunicação entre serviços
- Implementar retry com backoff exponencial (não retry infinito)

---

## 15. PHP — Padrões de Código Seguro

> Regras específicas para PHP (Laravel, Symfony, WordPress, APIs).

### SQL Injection
- SEMPRE usar PDO com prepared statements ou Eloquent ORM (Laravel)
- NUNCA concatenar variáveis em queries SQL
- Usar query builder com bindings: `DB::table('users')->where('email', $email)`
- WordPress: usar `$wpdb->prepare()` para queries customizadas

### XSS
- Laravel Blade: `{{ $var }}` escapa automaticamente — NUNCA usar `{!! $var !!}` com input
- Symfony Twig: `{{ var }}` escapa automaticamente — NUNCA usar `{{ var|raw }}` com input
- WordPress: usar `esc_html()`, `esc_attr()`, `esc_url()` em todo output
- PHP puro: `htmlspecialchars($input, ENT_QUOTES, 'UTF-8')` obrigatório

### Command Injection
- NUNCA usar `exec()`, `system()`, `shell_exec()`, `passthru()` com input do usuário
- Se necessário: `escapeshellarg()` + `escapeshellcmd()` em TODOS os argumentos
- Preferir APIs nativas (ex: `unlink()` em vez de `exec('rm ...')`)
- Desabilitar funções perigosas no `php.ini`: `disable_functions = exec,system,shell_exec,passthru,proc_open`

### Code Injection
- NUNCA usar `eval()`, `assert()`, `preg_replace` com flag `/e`
- NUNCA usar `include`/`require` com path controlável pelo usuário
- Desabilitar `allow_url_include` e `allow_url_fopen` em produção

### Autenticação e Sessão
- Hash de senhas: `password_hash($pwd, PASSWORD_ARGON2ID)` ou `PASSWORD_BCRYPT`
- Verificar: `password_verify($input, $hash)`
- Sessão: `session.cookie_httponly = 1`, `session.cookie_secure = 1`, `session.use_strict_mode = 1`
- Regenerar session ID após login: `session_regenerate_id(true)`
- CSRF: usar token em formulários (Laravel `@csrf`, Symfony CSRF component)

### Upload de Arquivos
- Validar MIME type real (não confiar em extensão): `finfo_file()`
- Limitar tamanho: `upload_max_filesize` e validação no código
- Armazenar fora do webroot (NUNCA em `public/`)
- Renomear arquivo (UUID, não nome original)
- Bloquear extensões perigosas: `.php`, `.phtml`, `.php5`, `.phar`

### Configuração Segura (php.ini produção)
- `display_errors = Off`
- `log_errors = On`
- `expose_php = Off`
- `allow_url_include = Off`
- `session.cookie_httponly = 1`
- `session.cookie_secure = 1`
- `session.cookie_samesite = Strict`
- `open_basedir` configurado para restringir acesso a diretórios

### Desserialização
- NUNCA usar `unserialize()` com dados do usuário
- Se necessário: usar `allowed_classes` parameter
- Preferir JSON: `json_decode()` / `json_encode()`

### SSRF
- Validar URLs antes de `file_get_contents()` ou `curl`
- Bloquear IPs internos (127.0.0.1, 10.x, 172.16-31.x, 192.168.x)
- Usar whitelist de hosts permitidos
- Desabilitar `allow_url_fopen` se não necessário

### Dependências (Composer)
- `composer.lock` SEMPRE commitado
- Usar versões exatas quando possível
- `composer audit` obrigatório no CI
- Verificar pacotes antes de instalar (packagist.org stats, repo, mantenedores)

---

## 16. WordPress — Segurança em Plugins e Temas

> Regras específicas para desenvolvimento seguro de plugins e temas WordPress.

### Funções OBRIGATÓRIAS (usar SEMPRE)

| Contexto | Função Obrigatória |
|---|---|
| Query SQL customizada | `$wpdb->prepare($sql, $args)` |
| Output em HTML | `esc_html($var)` |
| Output em atributo | `esc_attr($var)` |
| Output em URL | `esc_url($var)` |
| Output em JS inline | `esc_js($var)` |
| Sanitizar input texto | `sanitize_text_field($input)` |
| Sanitizar email | `sanitize_email($input)` |
| Sanitizar filename | `sanitize_file_name($input)` |
| Sanitizar HTML rico | `wp_kses($html, $allowed_tags)` |
| Verificar permissão | `current_user_can('capability')` |
| Criar nonce | `wp_nonce_field('action', 'nonce_name')` |
| Verificar nonce | `wp_verify_nonce($nonce, 'action')` ou `check_ajax_referer('action')` |

### Funções PROIBIDAS em Plugins

| Função | Motivo | Alternativa |
|---|---|---|
| `$wpdb->query("...{$var}...")` | SQL Injection | `$wpdb->prepare()` |
| `echo $variable` (sem escape) | XSS | `echo esc_html($variable)` |
| `eval()`, `assert()` | Code Injection | Whitelist de operações |
| `unserialize($user_data)` | Object Injection | `json_decode()` ou `maybe_unserialize()` com cuidado |
| `exec()`, `system()`, `shell_exec()` | Command Injection | APIs nativas do WP |
| `include($user_input)` | LFI/RFI | Paths hardcoded ou whitelist |
| `file_get_contents($user_url)` | SSRF | `wp_remote_get()` com validação |
| `update_option()` sem cap check | Privilege Escalation | Verificar `current_user_can()` antes |

### SQL Injection em WordPress
- SEMPRE usar `$wpdb->prepare()` para queries com variáveis
- NUNCA concatenar variáveis em `$wpdb->query()`, `$wpdb->get_results()`, `$wpdb->get_var()`
- Usar `absint()` para IDs numéricos
- Usar `esc_sql()` apenas como último recurso (prepare é preferido)

### XSS em WordPress
- TODA saída DEVE usar função de escape apropriada ao contexto
- `esc_html()` para conteúdo texto
- `esc_attr()` para atributos HTML
- `esc_url()` para URLs
- `wp_kses()` ou `wp_kses_post()` para HTML rico permitido
- NUNCA usar `echo $var` sem escape em templates

### CSRF em WordPress
- TODO formulário admin DEVE ter nonce: `wp_nonce_field('meu_action', 'meu_nonce')`
- TODO handler DEVE verificar nonce: `if (!wp_verify_nonce($_POST['meu_nonce'], 'meu_action')) die('Unauthorized')`
- AJAX: usar `check_ajax_referer('action', 'nonce')`
- Links com ação: usar `wp_nonce_url($url, 'action')`

### Controle de Acesso em WordPress
- TODA ação admin DEVE verificar capability: `if (!current_user_can('manage_options')) wp_die('Unauthorized')`
- AJAX handlers: verificar capability + nonce
- REST API endpoints: usar `permission_callback` (NUNCA `__return_true` para endpoints sensíveis)
- Hooks de ação: verificar permissão antes de executar operações privilegiadas

### Upload de Arquivos em WordPress
- Usar `wp_handle_upload()` com `$overrides['test_form'] = true`
- Validar tipo MIME: `wp_check_filetype($filename, $mimes)`
- Restringir extensões permitidas via `upload_mimes` filter
- NUNCA permitir upload de `.php`, `.phtml`, `.phar`, `.php5`
- Armazenar em `wp-content/uploads/` (nunca em diretório de plugins)

### REST API Segura
- SEMPRE definir `permission_callback` em `register_rest_route()`
- Sanitizar parâmetros com `sanitize_callback` no schema
- Validar com `validate_callback`
- Rate limiting via plugin ou .htaccess
- Desabilitar endpoints desnecessários (ex: `/wp/v2/users` se não usado)

### Configuração Segura (wp-config.php)
- `DISALLOW_FILE_EDIT` = true (impede edição de plugins/temas via admin)
- `DISALLOW_FILE_MODS` = true (impede instalação de plugins via admin em produção)
- `WP_DEBUG` = false em produção
- `FORCE_SSL_ADMIN` = true
- Mover `wp-config.php` um nível acima do webroot
- Prefixo de tabela customizado (não `wp_`)
- Salts e keys únicas (gerar em api.wordpress.org/secret-key)

### Plugins PROIBIDOS/Arriscados em Produção

| Plugin/Prática | Risco | Alternativa |
|---|---|---|
| Plugins nulled/pirata | Backdoors, malware | Usar apenas plugins oficiais/licenciados |
| Plugins abandonados (2+ anos sem update) | CVEs não corrigidos | Substituir por alternativa mantida |
| Plugins com < 1000 instalações ativas | Baixa auditoria | Preferir plugins populares e auditados |
| File Manager plugins | RCE, upload arbitrário | Usar SFTP/SSH |
| Database admin plugins (Adminer, phpMyAdmin) | Exposição total do BD | Acesso via CLI/SSH apenas |
| Plugins de backup que armazenam em /uploads | Backup acessível publicamente | Armazenar fora do webroot ou em cloud |

---

## 17. Memory Safety — CWE-787, CWE-125, CWE-416, CWE-119, CWE-190

> Vulnerabilidades de memória em contexto de linguagens managed. Embora Java/C#/Python/JS tenham garbage collector, existem cenários onde memory safety pode ser comprometida.

### CWE-787 / CWE-125 / CWE-119 — Buffer Overflow / Out-of-bounds

#### C# (.NET)
- NUNCA usar `unsafe` blocks em código de produção sem revisão de segurança
- Se `unsafe` necessário: validar bounds explicitamente antes de pointer arithmetic
- Preferir `Span<T>` e `Memory<T>` (bounds-checked) sobre raw pointers
- `stackalloc` com tamanho variável: validar que não excede stack size
- `Marshal.Copy` e P/Invoke: validar tamanhos de buffer

#### Node.js / TypeScript
- `Buffer.allocUnsafe()`: NUNCA expor ao cliente sem `.fill(0)` primeiro (pode conter dados de memória anteriores)
- Preferir `Buffer.alloc(size)` (zero-filled) sobre `Buffer.allocUnsafe(size)`
- Validar offset e length em `Buffer.copy()`, `Buffer.slice()`, `Buffer.write()`
- TypedArrays: validar bounds antes de acesso por index

#### Java
- `sun.misc.Unsafe`: PROIBIDO em código de aplicação (apenas frameworks internos)
- JNI (Java Native Interface): tratar como código C — validar todos os buffers
- `ByteBuffer.allocateDirect()`: liberar explicitamente quando não mais necessário

### CWE-416 — Use After Free

#### C# (.NET)
- `IDisposable`: NUNCA usar objeto após `Dispose()` — usar `using` statement
- `WeakReference<T>`: verificar `TryGetTarget()` antes de usar
- Unmanaged resources: implementar Dispose pattern corretamente

#### Node.js
- Streams: NUNCA ler de stream após `destroy()` ou `end()`
- Worker threads: NUNCA acessar `SharedArrayBuffer` após worker terminar sem sync

### CWE-190 — Integer Overflow

#### Todas as linguagens
- Validar que operações aritméticas não excedem limites do tipo
- JavaScript/TypeScript: `Number.MAX_SAFE_INTEGER` (2^53 - 1) — usar `BigInt` para valores maiores
- Java: `Math.addExact()`, `Math.multiplyExact()` (lançam ArithmeticException em overflow)
- C#: `checked { }` block para detectar overflow em runtime
- Python: integers têm precisão arbitrária (sem overflow), mas atenção com `numpy` arrays

#### Cenários de risco em linguagens managed
- Cálculos financeiros: usar tipos decimais (BigDecimal, decimal, Decimal.js)
- Tamanho de arrays/buffers calculado a partir de input: validar antes de alocar
- Conversão entre tipos (int32 → int16): verificar que valor cabe no tipo destino
- IDs sequenciais: considerar overflow em sistemas de longa duração
