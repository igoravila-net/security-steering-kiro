---
inclusion: auto
---

# Padrão de Logs - Arquitetura de Referência (Grupo COGNA)

> Baseado na Arquitetura de Referência de Logs do Grupo COGNA

## REGRA: Implementar Logs Automaticamente

Ao criar ou modificar código, SEMPRE implementar logs seguindo este padrão. Logs devem ser inseridos automaticamente em:
- Funções críticas para o negócio (INFO)
- Início/fim de métodos (DEBUG)
- Erros tratados (DEBUG)
- Erros não tratados (ERROR com stack trace)
- Chamadas a serviços externos (INFO/ERROR)

## Classificação de Ocorrências

### Ocorrência Sistêmica
- Registro de execuções técnicas no código
- Exemplos: falha de conexão com banco, sucesso de chamada de API externa
- Tratamento: logar de acordo com o nível de log do contexto

### Ocorrência de Negócio
- Situações esperadas pelas regras de negócio
- Exemplos: saldo insuficiente, CPF inválido
- Tratamento: comunicar ao usuário, pode ser logado como DEBUG
- NÃO logar como ERROR (não é erro do sistema)

## Níveis de Log - OBRIGATÓRIO

| Nível | Propósito | Quando Usar |
|---|---|---|
| ERROR | Falhas críticas que impedem execução | Exceções não tratadas, falha em transações |
| WARN | Alerta que não quebra o sistema | Retentativas, queda de serviço externo |
| INFO | Eventos normais e relevantes | Início/fim de processos, decisões de negócio |
| DEBUG | Diagnóstico com contexto | Fluxos, valores de variáveis, execução de métodos |
| TRACE | Detalhamento minucioso | Debug profundo, rastreamento interno |

## Campos Obrigatórios (Padrão GELF)

| Campo | Descrição |
|---|---|
| Severity | Nível (ERROR, WARN, INFO, DEBUG, TRACE) |
| Time | Data/hora UTC |
| app | Nome do ativo/solução |
| env | Ambiente (LOCAL, DEV, HOMO, PROD) |
| facility | Tipo de aplicação (api, worker, scheduler) |
| CorrelationID | ID para rastrear chamadas distribuídas (UUID) |
| SourceClassName | Caminho completo da classe |
| SourceMethodName | Nome do método |
| SourceLineNumber | Linha do arquivo |
| full_message | Mensagem da ocorrência |
| Thread | Nome da thread |
| Stacktrace | Pilha de chamadas (opcional, para ERROR) |

## Onde Aplicar Logs - OBRIGATÓRIO

### Funções Críticas para o Negócio
- Ao menos uma entrada INFO por etapa executada com sucesso

### Classes e Métodos
- DEBUG no início e/ou fim de execução

### Erros Tratados
- DEBUG informando o erro tratado

### Erros Não Tratados
- ERROR incluindo stack trace completo

### Chamadas Externas
- INFO no sucesso, ERROR na falha
- Incluir: serviço chamado, tempo de resposta, status code

## Recomendações - OBRIGATÓRIO

### FAZER
- Mensagens objetivas e informativas
- Operações assíncronas para escrita de logs
- Solução única de logging por tecnologia
- CorrelationID em TODAS as requisições (propagar entre serviços)
- Armazenar em repositório central
- Informações de contexto sempre presentes

### NÃO FAZER
- NÃO logar dados sensíveis (PII, senhas, tokens, cartões)
- NÃO logar comportamentos esperados como ERROR
- NÃO usar log como auditor de processos
- NÃO logar excessivamente
- NÃO omitir contexto

### Dados Sensíveis
- NUNCA logar: senhas, tokens, API keys, cartões, CPF completo
- Mascarar ANTES de incluir no log
- TRACE: atenção especial ao mascaramento

## Implementação por Linguagem

### Java/Kotlin
- SLF4J + Logback, placeholders {} (nunca concatenação)
- MDC para CorrelationID e contexto
- Output JSON estruturado

### C# (.NET)
- Serilog ou Microsoft.Extensions.Logging
- Structured logging com templates
- Enrichers para contexto, Activity/TraceId para correlation

### TypeScript/JavaScript
- Winston ou Pino, JSON format obrigatório
- Child loggers com contexto
- Middleware para CorrelationID automático

### Python
- structlog ou logging com JSON formatter
- Context vars para CorrelationID
- Processadores para enriquecimento

## Referências
- Arquitetura de Referência de Logs - Grupo COGNA
- Padrão GELF (GrayLog Extended Log Format)
- OWASP Logging Cheat Sheet
