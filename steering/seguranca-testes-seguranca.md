---
inclusion: auto
---

# Testes de Segurança - Geração Automática Obrigatória

> Para 300+ desenvolvedores: ao criar QUALQUER endpoint, service ou componente, SEMPRE gerar testes de segurança JUNTO com o código.

## REGRA ABSOLUTA

Todo código que recebe input externo DEVE ter testes de segurança gerados automaticamente como parte obrigatória da entrega.

## 1. Autenticação (401)
- Sem token → 401
- Token expirado → 401
- Token inválido/malformado → 401
- Token com chave errada → 401
- Token com algorithm none → 401
- Header Authorization com formato incorreto → 401

## 2. Autorização (403)
- Sem role necessária → 403
- Acessando recurso de outro usuário (IDOR) → 403/404
- Escalação de privilégio → 403
- Admin com conta comum → 403
- Alteração de role própria → 403
- Acesso a outro tenant/BU → 403
- Manipulação de userId no body/path → 403

## 3. Validação de Input (400)
- Campo obrigatório ausente → 400
- Excede limite de caracteres → 400
- Email/CPF/telefone inválido → 400
- Número negativo/acima do máximo → 400
- String vazia/apenas espaços → 400
- Body vazio → 400
- Content-Type incorreto → 415
- JSON malformado → 400
- Array acima do limite → 400
- Tipo errado (string onde espera number) → 400

## 4. SQL Injection
- ' OR '1'='1 → Não executar SQL
- '; DROP TABLE → Tabela intacta
- UNION SELECT → Não retornar dados de outra tabela
- 1; DELETE FROM → Não executar delete

## 5. XSS
- <script>alert(1)</script> → Escapar na resposta
- <img src=x onerror=alert(1)> → Escapar/remover
- javascript:alert(1) → Rejeitar/sanitizar
- Payload em header refletido → Não refletir sem escape

## 6. Command Injection
- ; ls -la → Não executar
- | cat /etc/passwd → Não executar
- $(whoami) → Não executar

## 7. Path Traversal
- ../../../etc/passwd → Bloquear (400/403)
- ..\\..\\windows\\system32 → Bloquear
- URL encoded (%2e%2e%2f) → Bloquear

## 8. CRLF Injection
- %0d%0aInjected-Header: value → Não injetar header
- \r\nSet-Cookie: malicious → Não injetar cookie

## 9. Rate Limiting (429)
- 100+ req/min mesmo IP → 429
- 5+ login falhados → 429/bloqueio
- Burst em endpoint sensível → 429
- Headers X-RateLimit-* presentes → Sim

## 10. Dados Sensíveis na Resposta
- passwordHash na resposta → NÃO
- Token interno na resposta → NÃO
- CPF sem mascarar → NÃO
- Stack trace em erro → NÃO
- Query SQL em erro → NÃO
- Header Server com tecnologia → NÃO
- Header X-Powered-By → NÃO

## 11. CORS
- Origin não autorizada → Sem CORS headers
- Origin: null → Rejeitar
- Wildcard (*) com credenciais → NÃO permitir

## 12. Timeout e DoS
- Body de 100MB → 413
- Header muito grande → 431
- Query retornando milhões → Paginação forçada (máx 100)
- JSON 100+ níveis aninhado → Rejeitar
- Chamada externa > 5s → Timeout gracioso
- Regex com input ReDoS → Timeout/rejeição

## 13. Upload de Arquivos
- Arquivo > 10MB → 413
- Extensão proibida (.exe, .sh) → 400
- MIME type não corresponde extensão → 400
- Nome com path traversal → Sanitizar
- Múltiplos uploads acima do limite → 429

## 14. Sessão e Cookies
- Cookie sem Secure → FALHA
- Cookie sem HttpOnly → FALHA
- Cookie sem SameSite → FALHA
- Sessão não invalidada no logout → FALHA
- Session fixation → FALHA (deve regenerar)
- Sessão ativa após timeout → FALHA

## 15. Headers de Segurança
- X-Content-Type-Options: nosniff → Presente
- X-Frame-Options: DENY → Presente
- Strict-Transport-Security → Presente
- Content-Security-Policy → Presente
- Referrer-Policy → Presente
- Server/X-Powered-By → AUSENTE

## 16. CSRF
- POST/PUT/DELETE sem token CSRF (se usa cookies) → 403
- Token CSRF inválido → 403
- Token de outra sessão → 403

## 17. Mass Assignment
- Campo "role" no body de criação → Ignorado
- Campo "isAdmin" no body → Ignorado
- Campo "balance" em atualização → Ignorado
- Campos extras não definidos no DTO → Ignorados/400

## 18. Business Logic
- Quantidade negativa → 400
- Preço zero/negativo → 400
- Desconto > 100% → 400
- Operação duplicada → Idempotente
- Recurso deletado → 404

## 19. Desserialização
- JSON com __proto__ → Ignorar/rejeitar
- XML com DTD externa (XXE) → Rejeitar
- YAML com tag de execução → Rejeitar

## 20. Criptografia e Tokens
- JWT algorithm: none → Rejeitar
- JWT sem validar issuer → FALHA
- JWT sem validar audience → FALHA
- JWT sem validar expiration → FALHA
- Senha em MD5/SHA1 → FALHA (usar Argon2id/BCrypt)
- Conexão banco sem SSL → FALHA

## Nomenclatura Padrão
```
should_return_401_when_no_auth_token_provided
should_return_403_when_user_accesses_other_users_resource
should_return_400_when_name_exceeds_100_characters
should_not_execute_sql_when_input_contains_injection
should_not_reflect_xss_payload_in_response
should_return_429_when_rate_limit_exceeded
should_not_expose_stack_trace_on_error
should_have_secure_httponly_samesite_on_cookies
should_include_security_headers_in_response
should_reject_jwt_with_none_algorithm
should_ignore_role_field_in_creation_request
should_timeout_external_call_after_5_seconds
```

## Payloads para Testes Parametrizados

### SQL: ' OR '1'='1 | '; DROP TABLE users; -- | ' UNION SELECT *
### XSS: <script>alert(1)</script> | <img src=x onerror=alert(1)>
### CMD: ; ls -la | $(whoami) | | cat /etc/passwd
### Path: ../../../etc/passwd | %2e%2e%2f
### CRLF: %0d%0aHeader: value
### Proto: {"__proto__": {"isAdmin": true}}
### Limites: 10000 chars | "" | null | "   " | MAX_INT+1

## Cobertura Mínima por Componente

| Componente | Testes |
|---|---|
| Controller | Auth(401), Authz(403), Validation(400), RateLimit(429), CORS, Headers, CSRF |
| Service | Business logic, ownership, idempotência, race conditions |
| Repository | SQL parametrizado, paginação |
| DTO | Validação, limites, mass assignment |
| Upload | Tipo, tamanho, nome, conteúdo |
| Integração | Timeout, circuit breaker, validação resposta |
| Auth | JWT, session, cookies |

## Referências
- OWASP Testing Guide v4.2
- OWASP Web Security Testing Guide
- Política de Desenvolvimento Seguro - Grupo COGNA
