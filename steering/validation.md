---
inclusion: auto
---

# Validation — Testes, Checklist e Threat Modeling

> Testes de segurança são gerados automaticamente junto com o código. Checklist aplicado antes de todo PR.

---

## Testes de Segurança — Geração Automática

Todo código que recebe input externo DEVE ter testes de segurança gerados como parte obrigatória.

### Categorias de Teste Obrigatórias

| # | Categoria | Validação |
|---|---|---|
| 1 | Autenticação (401) | Sem token, token expirado/inválido/malformado, algorithm none |
| 2 | Autorização (403) | Sem role, IDOR, escalação, outro tenant, manipulação userId |
| 3 | Validação Input (400) | Campo ausente, excede limite, formato inválido, tipo errado, body vazio |
| 4 | SQL Injection | OR 1=1, DROP TABLE, UNION SELECT — tabela intacta |
| 5 | XSS | script/img/onerror payloads — escapados na resposta |
| 6 | Command Injection | ; ls, pipe cat, $(whoami) — não executar |
| 7 | Path Traversal | ../../../etc/passwd, URL encoded — bloquear (400/403) |
| 8 | CRLF Injection | %0d%0a header injection — não injetar |
| 9 | Rate Limiting (429) | 100+ req/min, 5+ login falhados — 429 |
| 10 | Dados Sensíveis | passwordHash, stack trace, CPF sem máscara — NUNCA na resposta |
| 11 | CORS | Origin não autorizada, null, wildcard com credentials — rejeitar |
| 12 | Timeout/DoS | Body 100MB (413), JSON aninhado, query sem paginação, ReDoS |
| 13 | Upload | Arquivo maior que 10MB, extensão proibida, MIME mismatch |
| 14 | Sessão/Cookies | Sem Secure/HttpOnly/SameSite, não invalidada no logout |
| 15 | Headers Segurança | X-Content-Type-Options, X-Frame-Options, HSTS, CSP presentes |
| 16 | CSRF | POST/PUT/DELETE sem token CSRF (se usa cookies) — 403 |
| 17 | Mass Assignment | Campo role/isAdmin/balance no body — ignorado |
| 18 | Business Logic | Quantidade negativa, preço zero, desconto acima de 100%, duplicação |
| 19 | Desserialização | proto pollution, XXE com DTD, YAML com execução — rejeitar |
| 20 | Criptografia | JWT algorithm none, sem validar issuer/audience/exp |

### Nomenclatura Padrão
- should_return_401_when_no_auth_token_provided
- should_return_403_when_user_accesses_other_users_resource
- should_return_400_when_name_exceeds_100_characters
- should_not_execute_sql_when_input_contains_injection
- should_not_reflect_xss_payload_in_response
- should_return_429_when_rate_limit_exceeded

### Cobertura Mínima por Componente

| Componente | Testes Obrigatórios |
|---|---|
| Controller | Auth(401), Authz(403), Validation(400), RateLimit(429), CORS, Headers, CSRF |
| Service | Business logic, ownership, idempotência, race conditions |
| Repository | SQL parametrizado, paginação |
| DTO | Validação, limites, mass assignment |
| Upload | Tipo, tamanho, nome, conteúdo |
| Integração | Timeout, circuit breaker, validação resposta |
| Auth | JWT, session, cookies |

---

## Checklist de Segurança Pré-PR

Verificar automaticamente antes de qualquer commit ou pull request:

### Autenticação e Autorização
- [ ] Todo endpoint tem autenticação
- [ ] Todo endpoint verifica autorização (role ou ownership)
- [ ] Operações sensíveis exigem re-autenticação

### Input e Validação
- [ ] TODO input tem limite de caracteres
- [ ] TODO input passa por sanitização
- [ ] Validação de tipo, formato e range

### Dados e Privacidade
- [ ] Nenhum PII em logs
- [ ] Dados sensíveis mascarados em respostas
- [ ] Classificação da informação respeitada

### Credenciais e Segredos
- [ ] Nenhuma credencial hardcoded
- [ ] Segredos via vault/env em runtime
- [ ] Nenhum segredo em logs ou erros

### Injeção e XSS
- [ ] Nenhuma concatenação em SQL
- [ ] Nenhum eval/exec com dados externos
- [ ] Output encoding em saídas HTML

### Dependências
- [ ] Nenhum CVE crítico conhecido
- [ ] Versões fixas (pinned)
- [ ] Nenhuma biblioteca proibida/EOL

### Infraestrutura
- [ ] TLS 1.2+ em todas as conexões
- [ ] Security groups restritivos
- [ ] Containers não-root

### Logging e Error Handling
- [ ] Logs de auth (sucesso e falha)
- [ ] Correlation ID nas requisições
- [ ] Nenhum stack trace ao cliente
- [ ] Nenhuma info de tecnologia em headers

---

## Threat Modeling (STRIDE)

Gerar threat model automaticamente ao criar features significativas (auth, dados pessoais, integração externa, upload, pagamento, admin, API pública).

| Ameaça | Pergunta | Mitigação Padrão |
|---|---|---|
| Spoofing | Alguém pode se passar por outro? | JWT + MFA + rate limiting |
| Tampering | Dados podem ser alterados? | Validação + HMAC + transações |
| Repudiation | Ações podem ser negadas? | Logs + CorrelationID + auditoria |
| Info Disclosure | Dados podem vazar? | Criptografia + mascaramento + DTOs |
| DoS | Serviço pode ser derrubado? | Rate limit + timeout + circuit breaker |
| Elevation | Acesso indevido possível? | RBAC + ownership + menor privilégio |

Ao detectar feature complexa (auth, crypto, upload, pagamento):
- Sugerir revisão por Security Champion
- Indicar que threat model deve ser revisado por AppSec

---

## Métricas de Compliance

### Por PR
- Testes de segurança presentes e passando
- Nenhuma violação crítica detectada
- Checklist completo

### Por Sprint
- Percentual de PRs com testes de segurança
- Tempo médio de correção de vulnerabilidades
- Número de violações bloqueadas pelos hooks
