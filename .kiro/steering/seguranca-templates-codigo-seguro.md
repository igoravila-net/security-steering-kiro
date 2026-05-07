---
inclusion: auto
---

# Templates de Código Seguro

> Ao criar componentes, usar estes templates como base. Todo código gerado DEVE seguir estes padrões.

## Template: Controller/Endpoint
- Autenticação + autorização (role)
- @Valid no body com limites de caracteres
- InputSanitizer nos parâmetros
- Paginação (page >= 0, size 1-100)
- Retorno via DTO (nunca entidade)
- Log INFO sucesso + ERROR falha + CorrelationID
- Rate limiting

## Template: Service
- Verificação de ownership (userId autenticado vs recurso)
- Validação de regras de negócio
- Transação para operações multi-registro
- Log DEBUG início/fim, ERROR exceções
- CorrelationID propagado
- Circuit breaker para chamadas externas
- Timeout para dependências

## Template: Repository
- Consultas parametrizadas (NUNCA concatenação)
- Filtro por userId/tenantId
- Paginação (Pageable/LIMIT+OFFSET)
- Conexão com SSL/TLS

## Template: DTO Request
- @NotBlank/@NotNull em obrigatórios
- @Size(max=N) em TODOS os strings
- @Email/@Pattern para formatos
- @Min/@Max para números
- Sem campos sensíveis (role, isAdmin)

## Template: DTO Response
- Apenas campos necessários
- Sem passwordHash, tokens, CPF completo
- Dados mascarados quando aplicável

## Template: Integração Externa
- Timeout (máx 5s)
- Circuit breaker (abrir após N falhas)
- Retry com backoff (máx 3)
- Log WARN retry, ERROR falha definitiva
- Validar/sanitizar resposta recebida
- TLS 1.2+, credenciais via vault
- CorrelationID no header

## Template: Upload de Arquivo
- Whitelist de extensões
- Validação MIME type real
- Limite tamanho (10MB)
- Renomear com UUID
- Armazenar fora do webroot
- Verificar path traversal

## Template: Login/Auth
- Rate limiting (5 tentativas/min)
- Mensagem genérica para falha
- Não revelar se email existe
- Log tentativas (sucesso + falha + IP)
- Bloqueio temporário
- Token TTL curto (15min access, 7d refresh)

## Template: Error Handler
- Mensagem genérica para erros internos
- Sem stack trace na resposta
- Log ERROR com stack completo (interno)
- CorrelationID na resposta
- Formato: {code, message, timestamp, path}
