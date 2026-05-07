---
inclusion: auto
---

# Arquitetura de Resiliência e Observabilidade

> Padrões obrigatórios para circuit breaker, retry, health check e observabilidade.

## Health Check - OBRIGATÓRIO
- GET /health — status do serviço
- Verificar: banco, cache, filas, serviços críticos
- 200 se saudável, 503 se degradado
- NÃO expor detalhes internos em produção
- Usar para liveness/readiness probes (K8s)

## Circuit Breaker - OBRIGATÓRIO em Integrações
- Abrir após 5 falhas consecutivas em 60s
- OPEN: falha imediata sem chamar serviço
- HALF-OPEN: testar após 30s
- Log WARN ao abrir, INFO ao fechar
- Fallback quando possível

## Retry com Backoff - OBRIGATÓRIO
- Máximo 3 tentativas
- Backoff exponencial (1s, 2s, 4s) + jitter
- NÃO retry em 400/401/403/404
- Retry em 500/502/503/504/timeout
- Log WARN em cada retry

## Timeout - OBRIGATÓRIO

| Tipo | Timeout |
|---|---|
| API REST síncrona | 5s |
| Banco de dados | 3s |
| Cache (Redis) | 1s |
| Fila (Kafka/RabbitMQ) | 5s |
| Serviço externo | 10s |
| Upload | 30s |

## Observabilidade - OBRIGATÓRIO
- CorrelationID em TODAS as requisições (X-Correlation-ID)
- Métricas: duration, total requests, error rate, circuit state
- Tracing distribuído com spans por operação
- Alertas: error rate > 5%, latência p99 > 3s, circuit aberto, health falhando

## Graceful Degradation
- Dependência não-crítica falha: continuar com funcionalidade reduzida
- Dependência crítica falha: 503 com mensagem clara
- Cache como fallback para leituras
