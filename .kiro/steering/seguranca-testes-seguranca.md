---
inclusion: auto
---

# Testes de Segurança - Geração Automática

> Ao criar qualquer endpoint ou componente que receba input, SEMPRE gerar testes de segurança junto com o código.

## REGRA: Testes de Segurança São OBRIGATÓRIOS

## Categorias de Testes Obrigatórios

### 1. Autenticação (401 Unauthorized)
- Requisição sem token/cookie → 401
- Token expirado → 401
- Token inválido/malformado → 401

### 2. Autorização (403 Forbidden)
- Usuário sem role necessária → 403
- Usuário acessando recurso de outro (IDOR) → 403 ou 404
- Escalação de privilégio → 403
- Acesso admin com conta comum → 403

### 3. Validação de Input (400 Bad Request)
- Campo obrigatório ausente → 400
- Campo excedendo limite de caracteres → 400
- Campo com formato inválido → 400
- Caracteres maliciosos → 400 ou sanitizar
- Body vazio → 400

### 4. Injeção
- SQL injection em parâmetros → não executar SQL
- XSS em campos de texto → escapar/sanitizar
- Command injection → não executar comando
- Path traversal → bloquear
- CRLF injection → sanitizar

### 5. Rate Limiting (429)
- Múltiplas requisições rápidas → 429 após limite
- Múltiplas tentativas de login falhadas → bloqueio

### 6. Dados Sensíveis
- Resposta NÃO contém passwordHash, tokens internos
- Erro NÃO expõe stack trace
- Headers NÃO expõem tecnologia

### 7. Paginação
- size > 100 → limitar a 100
- page negativo → 400 ou usar 0

## Nomenclatura

```
should_return_401_when_no_auth_token
should_return_403_when_user_not_owner
should_return_400_when_name_exceeds_100_chars
should_not_execute_sql_when_input_contains_injection
should_return_429_when_rate_limit_exceeded
should_not_expose_stack_trace_on_error
```

## Inputs Maliciosos para Testes Parametrizados

### SQL Injection
- ' OR '1'='1
- '; DROP TABLE users; --

### XSS
- <script>alert(1)</script>
- <img src=x onerror=alert(1)>

### Command Injection
- ; ls -la
- $(whoami)

### Path Traversal
- ../../../etc/passwd

### Limites
- String com 10.000 caracteres
- String vazia
- Null
- Apenas espaços

## Cobertura Mínima

| Componente | Testes Obrigatórios |
|---|---|
| Controller | Auth (401), Authz (403), Validation (400), Rate Limit (429) |
| Service | Business rules, ownership, error handling |
| Repository | SQL parametrizado |
| DTO/Model | Validação de campos, limites |

## Referências
- OWASP Testing Guide
- Política de Desenvolvimento Seguro - Grupo COGNA
