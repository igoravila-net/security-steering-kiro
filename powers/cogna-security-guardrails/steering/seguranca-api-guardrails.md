# Políticas de Segurança - API Security Guardrails

> Baseado em: [OWASP API Security Top 10 2023](https://owasp.org/API-Security/), [OWASP REST Security](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Endpoint sem autenticação exposto → Proteger com JWT/OAuth2
- Endpoint sem autorização (qualquer autenticado acessa tudo) → Verificar ownership/role
- Sem rate limiting → Implementar throttling por IP/usuário
- Sem validação de input (body, query, path, headers) → Validar e sanitizar TUDO
- Dados excessivos na resposta → Retornar apenas campos necessários (DTOs)
- Sem paginação em listagens → Limitar resultados (máx 100 por página)
- Operações em massa sem limite → Limitar batch size
- Sem timeout em chamadas externas → Definir timeout (máx 5s)
- CORS permissivo (origin: *) → Whitelist de origens permitidas

## OWASP API Security Top 10 - Regras

### API1 - Broken Object Level Authorization (BOLA/IDOR)
- TODA operação em recurso DEVE verificar que o usuário autenticado tem acesso
- Usar UUIDs em vez de IDs sequenciais em URLs públicas
- Filtrar queries por userId do autenticado

### API2 - Broken Authentication
- JWT com validação completa (issuer, audience, expiration, algorithm)
- Rate limiting em endpoints de autenticação (máx 5 tentativas/minuto)
- Tokens com TTL curto (access: 15min, refresh: 7d)

### API3 - Broken Object Property Level Authorization
- Nunca expor entidades de banco diretamente (usar DTOs)
- DTOs de resposta diferentes de DTOs de request
- Campos sensíveis (role, isAdmin, balance) nunca alteráveis pelo usuário

### API4 - Unrestricted Resource Consumption
- Rate limiting por IP e por usuário
- Limitar tamanho do body (1MB para JSON)
- Limitar upload (10MB)
- Paginação obrigatória (máx 100 itens)
- Timeout em todas as operações (5s padrão)
- Circuit breaker para dependências externas

### API5 - Broken Function Level Authorization
- Endpoints admin separados (/api/admin/*) com role check
- Deny-by-default: tudo bloqueado, liberar explicitamente
- Verificar autorização em CADA endpoint, não apenas no gateway

### API6 - Unrestricted Access to Sensitive Business Flows
- Rate limiting diferenciado por endpoint crítico
- CAPTCHA para operações sensíveis (criação de conta, pagamento)
- Monitorar padrões de abuso (muitas requisições sequenciais)

### API7 - Server Side Request Forgery (SSRF)
- Whitelist de URLs/hosts permitidos para chamadas externas
- Bloquear acesso a redes internas (127.0.0.1, 10.x, 172.16-31.x, 192.168.x)
- Validar e sanitizar URLs fornecidas pelo usuário

### API8 - Security Misconfiguration
- Desabilitar endpoints de debug em produção
- Remover headers que expõem tecnologia
- CORS restritivo (whitelist de origens)
- Error handling sem stack traces

### API9 - Improper Inventory Management
- Documentar TODOS os endpoints (OpenAPI/Swagger)
- Versionar APIs (/api/v1/, /api/v2/)
- Deprecar e remover versões antigas
- Não expor endpoints internos publicamente

### API10 - Unsafe Consumption of APIs
- Validar respostas de APIs externas (não confiar)
- Timeout e circuit breaker para chamadas externas
- Sanitizar dados recebidos de APIs terceiras
- TLS obrigatório para comunicação entre serviços

## Checklist por Endpoint - OBRIGATÓRIO

Todo endpoint de API DEVE ter:

```
[ ] Autenticação (quem está chamando?)
[ ] Autorização (tem permissão para esta ação neste recurso?)
[ ] Validação de input (todos os campos com tipo, formato, limite de caracteres)
[ ] Sanitização de input (função de sanitização chamada)
[ ] Rate limiting (limite de requisições por período)
[ ] Paginação (se retorna lista, máx 100 itens)
[ ] DTO de resposta (nunca entidade direta)
[ ] Error handling (sem exposição de detalhes internos)
[ ] Logging de auditoria (quem fez o quê, quando)
[ ] Timeout (para chamadas externas, máx 5s)
```

## Padrão de Controller Seguro - Todas as Linguagens

Todo controller/handler DEVE seguir este padrão:
1. Middleware de autenticação (verificar token válido)
2. Middleware de rate limiting
3. Validação de input com limites de caracteres (@Size, max, .slice())
4. Chamada a InputSanitizer nos parâmetros recebidos
5. Verificação de autorização/ownership no service
6. Retorno via DTO (nunca entidade de banco)
7. Paginação com limites (page >= 0, size entre 1 e 100)

## Headers de Segurança - OBRIGATÓRIO em Toda Resposta

```
Content-Type: application/json; charset=utf-8
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
Cache-Control: no-store
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## CORS - Configuração OBRIGATÓRIA

- Allowed Origins: lista explícita (NUNCA *)
- Allowed Methods: apenas os necessários (GET, POST, PUT, DELETE, PATCH)
- Allowed Headers: Authorization, Content-Type (apenas necessários)
- Max Age: 3600 (1 hora)
- Credentials: true apenas se necessário (com origin explícita)

## Rate Limiting - Limites Recomendados

| Endpoint | Limite |
|---|---|
| Login/Auth | 5 req/min por IP |
| Registro | 3 req/hora por IP |
| API geral (autenticado) | 100 req/min por usuário |
| API geral (anônimo) | 20 req/min por IP |
| Upload | 10 req/hora por usuário |
| Operações sensíveis (pagamento) | 5 req/min por usuário |
| Busca | 30 req/min por usuário |

## Versionamento - OBRIGATÓRIO

- Versionar via URL path: /api/v1/, /api/v2/
- Manter compatibilidade dentro da mesma versão major
- Deprecar com header: Deprecation: true, Sunset: (date)
- Prazo mínimo de 6 meses antes de remover versão antiga

## Respostas de Erro - Formato Padrão

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Dados inválidos",
  "timestamp": "2025-01-01T00:00:00Z",
  "path": "/api/v1/users"
}
```

NUNCA incluir: stack trace, query SQL, nomes de classes internas, versão do framework.

## Referências
- [OWASP API Security Top 10](https://owasp.org/API-Security/)
- [OWASP REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)
- [OWASP GraphQL Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/GraphQL_Cheat_Sheet.html)
