---
inclusion: fileMatch
fileMatchPattern: "**/*.ts,**/*.js,**/*.tsx,**/*.jsx,**/*.py,**/*.java,**/*.kt,**/*.cs,**/*.php,**/*.go,**/*.rb,**/*.swift,**/*logger*,**/*logging*,**/*log*,**/*middleware*,**/*interceptor*,**/*filter*,**/src/**"
description: "Padrão de logs COGNA (GELF, CorrelationID, níveis), monitoramento e auditoria. Ativado ao editar código-fonte ou arquivos relacionados a logging/middleware."
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

## Templates de Middleware — CorrelationID

> Templates prontos para implementar propagação de CorrelationID. Copiar e adaptar ao projeto.

### Express.js / Node.js

```typescript
import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';

const CORRELATION_HEADER = 'x-correlation-id';

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const correlationId = req.headers[CORRELATION_HEADER] as string || randomUUID();
  req.headers[CORRELATION_HEADER] = correlationId;
  res.setHeader(CORRELATION_HEADER, correlationId);

  // Disponibilizar via AsyncLocalStorage ou custom property
  (req as any).correlationId = correlationId;
  next();
}

// Uso com logger (Pino/Winston)
export function createChildLogger(logger: any, req: Request) {
  return logger.child({ correlationId: (req as any).correlationId });
}
```

### NestJS

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { AsyncLocalStorage } from 'async_hooks';

export const correlationStorage = new AsyncLocalStorage<{ correlationId: string }>();
const CORRELATION_HEADER = 'x-correlation-id';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId = (req.headers[CORRELATION_HEADER] as string) || randomUUID();
    req.headers[CORRELATION_HEADER] = correlationId;
    res.setHeader(CORRELATION_HEADER, correlationId);

    correlationStorage.run({ correlationId }, () => next());
  }
}

// Em AppModule:
// configure(consumer: MiddlewareConsumer) {
//   consumer.apply(CorrelationIdMiddleware).forRoutes('*');
// }

// Em qualquer serviço:
// const { correlationId } = correlationStorage.getStore() ?? { correlationId: 'no-context' };
```

### Spring Boot (Java/Kotlin)

```java
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.core.annotation.Order;
import java.io.IOException;
import java.util.UUID;

@Component
@Order(1)
public class CorrelationIdFilter implements Filter {

    private static final String CORRELATION_HEADER = "X-Correlation-ID";
    private static final String MDC_KEY = "correlationId";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String correlationId = httpRequest.getHeader(CORRELATION_HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }

        MDC.put(MDC_KEY, correlationId);
        httpResponse.setHeader(CORRELATION_HEADER, correlationId);

        try {
            chain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }
}
```

Logback config (logback-spring.xml):
```xml
<encoder class="net.logstash.logback.encoder.LoggingEventCompositeJsonEncoder">
  <providers>
    <timestamp/>
    <logLevel fieldName="severity"/>
    <message fieldName="full_message"/>
    <mdc fieldName="correlationId" mdcKeyName="correlationId"/>
    <loggerName fieldName="SourceClassName"/>
    <callerData fieldName="SourceLineNumber"/>
    <stackTrace fieldName="stacktrace"/>
  </providers>
</encoder>
```

### ASP.NET Core (C#)

```csharp
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

public class CorrelationIdMiddleware
{
    private readonly RequestDelegate _next;
    private const string CorrelationHeader = "X-Correlation-ID";

    public CorrelationIdMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ILogger<CorrelationIdMiddleware> logger)
    {
        var correlationId = context.Request.Headers[CorrelationHeader].FirstOrDefault()
                            ?? Guid.NewGuid().ToString();

        context.Items["CorrelationId"] = correlationId;
        context.Response.Headers[CorrelationHeader] = correlationId;

        using (logger.BeginScope(new Dictionary<string, object>
        {
            ["CorrelationId"] = correlationId
        }))
        {
            await _next(context);
        }
    }
}

// Em Program.cs:
// app.UseMiddleware<CorrelationIdMiddleware>();
```

### Python (FastAPI / Flask)

```python
import uuid
from contextvars import ContextVar
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

correlation_id_var: ContextVar[str] = ContextVar('correlation_id', default='no-context')
CORRELATION_HEADER = "x-correlation-id"


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        correlation_id = request.headers.get(CORRELATION_HEADER) or str(uuid.uuid4())
        correlation_id_var.set(correlation_id)

        response = await call_next(request)
        response.headers[CORRELATION_HEADER] = correlation_id
        return response


# Em qualquer módulo:
# from middleware import correlation_id_var
# logger.info("action", extra={"correlationId": correlation_id_var.get()})
```

### Propagação em chamadas HTTP entre serviços

```typescript
// TypeScript — axios interceptor
import axios from 'axios';
import { correlationStorage } from './correlation-middleware';

axios.interceptors.request.use((config) => {
  const store = correlationStorage.getStore();
  if (store?.correlationId) {
    config.headers['X-Correlation-ID'] = store.correlationId;
  }
  return config;
});
```

```java
// Java — RestTemplate interceptor
@Bean
public RestTemplate restTemplate() {
    RestTemplate template = new RestTemplate();
    template.getInterceptors().add((request, body, execution) -> {
        String correlationId = MDC.get("correlationId");
        if (correlationId != null) {
            request.getHeaders().set("X-Correlation-ID", correlationId);
        }
        return execution.execute(request, body);
    });
    return template;
}
```

---

## Referências
- Arquitetura de Referência de Logs - Grupo COGNA
- Padrão GELF (GrayLog Extended Log Format)
- OWASP Logging Cheat Sheet
- OWASP Error Handling Cheat Sheet
