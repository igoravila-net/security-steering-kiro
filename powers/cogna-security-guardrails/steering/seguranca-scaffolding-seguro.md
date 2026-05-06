---
inclusion: auto
---

# Scaffolding Seguro - Padrões por Default

> Quando o desenvolvedor solicitar criação de componentes (controller, API, service, repository, etc.), SEMPRE gerar com todos os controles de segurança incluídos por padrão.

## REGRA: Segurança Embutida por Default

Ao criar qualquer componente novo, INCLUIR automaticamente:

### Controller / Handler / Route
- Autenticação (middleware/annotation)
- Autorização (verificação de role/ownership)
- Validação de input com limites de caracteres
- Chamada a InputSanitizer em parâmetros recebidos
- Rate limiting
- Paginação com limites (page >= 0, size entre 1 e 100)
- Retorno via DTO (nunca entidade)
- Error handling sem exposição de detalhes internos
- Logging de auditoria (userId, action, timestamp)

### Service / Use Case
- Verificação de ownership/autorização no nível de negócio
- Validação de regras de negócio
- Transações para operações críticas
- Logging estruturado (sem PII)

### Repository / Data Access
- Consultas parametrizadas (NUNCA concatenação)
- Filtro por userId/tenantId quando aplicável
- Paginação no banco (LIMIT/OFFSET)
- Conexão com SSL/TLS

### Model / Entity / DTO
- DTOs separados para request e response
- Campos sensíveis NUNCA no DTO de resposta
- Validação em todos os campos string (limite de caracteres)
- Formato e tipo validados

### Configuração / Infraestrutura
- HTTPS/TLS obrigatório
- CORS restritivo (whitelist)
- Headers de segurança
- Timeout configurado
- Body size limitado

### Testes
- Teste de autenticação (401 sem token)
- Teste de autorização (403 sem permissão)
- Teste de validação (400 com input inválido)
- Teste de limite de caracteres
