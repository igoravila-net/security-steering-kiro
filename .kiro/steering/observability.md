---
inclusion: auto
---

# Observability — Logs, Monitoramento e Auditoria

> Padrão de logs do Grupo COGNA (GELF). Implementar automaticamente em todo código gerado.
> Baseado na Arquitetura de Referência de Logs do Grupo COGNA e OWASP Logging Cheat Sheet.

---

## Regra: Implementar Logs Automaticamente

Ao criar ou modificar código, SEMPRE incluir logs por default em:
- Funções críticas para o negócio (INFO)
- Início/fim de métodos (DEBUG)
- Erros tratados (DEBUG)
- Erros não tratados (ERROR com stack trace)
- Chamadas a serviços externos (INFO sucesso, WARN fallback, ERROR falha)

---

## Níveis de Log

| Nível | Quando Usar | Exemplo |
|---|---|---|
| ERROR | Falhas críticas que impedem execução | Falha ao salvar no banco |
| WARN | Alerta que não quebra o sistema | API externa não respondeu, usando fallback |
| INFO | Eventos normais e relevantes | Pedido 1234 processado com sucesso |
| DEBUG | Diagnóstico com contexto | Entrando no método A |
| TRACE | Detalhamento minucioso | Valores de variáveis internas |

### Classificação de Ocorrências
- **Sistêmica**: falhas técnicas (conexão, timeout) — logar conforme nível
- **Negócio**: situações esperadas (saldo insuficiente, CPF inválido) — DEBUG, NÃO ERROR

---

## Campos Obrigatórios (Padrão GELF/COGNA)

| Campo | Descrição | Obrigatório |
|---|---|---|
| Severity | Nível (ERROR, WARN, INFO, DEBUG, TRACE) | Sim |
| Time | Data/hora UTC | Sim |
| app | Nome do ativo/solução | Sim |
| env | Ambiente (LOCAL, DEV, HOMO, PROD) | Sim |
| CorrelationID | UUID para rastrear chamadas distribuídas | Sim |
| full_message | Mensagem da ocorrência | Sim |
| SourceClassName | Caminho completo da classe/arquivo | Sim |
| SourceMethodName | Nome do método | Sim |
| SourceLineNumber | Linha do arquivo | Recomendado |
| Stacktrace | Pilha de chamadas (para ERROR) | Quando ERROR |
| Thread | Nome da thread | Recomendado |

---

## CorrelationID — OBRIGATÓRIO

- Gerar no ponto de entrada (API Gateway, primeiro serviço)
- Propagar em TODAS as chamadas entre microsserviços
- Incluir em TODOS os logs da cadeia
- Formato: UUID v4
- Header HTTP: X-Correlation-ID

---

## Implementação por Linguagem

### Java/Kotlin
- SLF4J + Logback com output JSON
- MDC para CorrelationID e contexto
- Placeholders {} (NUNCA concatenação de strings)
- MDC.clear() no finally

### C# (.NET)
- Serilog ou Microsoft.Extensions.Logging
- Structured logging com templates
- Enrichers para contexto
- Activity/TraceId para correlation

### TypeScript/JavaScript
- Winston ou Pino com JSON format
- Child loggers com contexto
- Middleware para CorrelationID automático

### Python
- structlog ou logging com JSON formatter
- Context vars para CorrelationID
- Processadores para enriquecimento

---

## Dados Sensíveis em Logs — PROIBIDO

### NUNCA logar
- Senhas, tokens, API keys
- Cartões de crédito
- CPF completo, email completo

### MASCARAR antes de logar
- CPF: ***.456.***-**
- Email: j***n@example.com
- Telefone: (11)****-89
- Cartão: ****-****-****-1234

### PERMITIDO logar
- IDs de usuário, IDs de pedido
- Nomes de métodos, timestamps
- Status codes, tempos de resposta

---

## Logging de Segurança — OBRIGATÓRIO

### Eventos que DEVEM ser logados
- Login (sucesso e falha)
- Logout
- Falhas de autenticação (com IP)
- Acessos não autorizados (403)
- Mudanças de permissão
- Operações administrativas
- Acesso a dados Restritos/Confidenciais

### Formato de Auditoria
- event: tipo do evento (AUTH_SUCCESS, AUTH_FAILURE, ACCESS_DENIED)
- userId: identificador do usuário
- ip: endereço IP
- resource: recurso acessado
- action: ação realizada
- timestamp: momento da ação

### Sanitização para Logs
- Remover caracteres de controle antes de logar input do usuário
- Limitar tamanho do campo logado (max 200 chars)
- Prevenir log injection

---

## Recomendações

### FAZER
- Mensagens objetivas e informativas
- Operações assíncronas para escrita de logs
- Solução única de logging por tecnologia
- Armazenar em repositório central
- Informações de contexto sempre presentes

### NÃO FAZER
- NÃO logar comportamentos esperados como ERROR
- NÃO usar log como auditor de processos
- NÃO logar excessivamente
- NÃO omitir contexto

---

## Monitoramento e Alertas

### Métricas Obrigatórias
- Taxa de erros (5xx) por endpoint
- Latência (p50, p95, p99)
- Taxa de requisições
- Health check status

### Alertas de Segurança
- Pico de 401/403 (possível ataque de força bruta)
- Pico de 429 (rate limiting ativado)
- Erros de certificado TLS
- Falhas de conexão com vault/secrets manager

---

## Referências
- Arquitetura de Referência de Logs - Grupo COGNA
- Padrão GELF (GrayLog Extended Log Format)
- OWASP Logging Cheat Sheet
- OWASP Error Handling Cheat Sheet
