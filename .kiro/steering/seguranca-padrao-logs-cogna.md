---
inclusion: auto
---

# Padrão de Logs - Arquitetura de Referência (Grupo COGNA)

> Baseado na Arquitetura de Referência de Logs do Grupo COGNA. Este steering instrui o Kiro a implementar logs automaticamente seguindo o padrão corporativo.

## REGRA: Implementar Logs Automaticamente

Ao criar ou modificar código, SEMPRE implementar logs seguindo este padrão. Não esperar o desenvolvedor pedir — incluir logs por default em:
- Funções críticas para o negócio (INFO)
- Início/fim de métodos (DEBUG)
- Erros tratados (DEBUG)
- Erros não tratados (ERROR com stack trace)
- Chamadas a serviços externos (INFO/WARN)

## Classificação de Ocorrências

### Ocorrência Sistêmica
- Registro de execuções técnicas no código, infraestrutura ou ambiente
- Exemplos: falha de conexão com banco, sucesso de chamada de API externa
- Tratamento: logar de acordo com o nível de log do contexto

### Ocorrência de Negócio
- Situações esperadas e previstas pelas regras de negócio
- Exemplos: saldo insuficiente, CPF inválido, operação não permitida
- Tratamento: comunicar ao usuário, pode ser logado como DEBUG
- NÃO logar como ERROR (não é erro do sistema)

## Níveis de Log - OBRIGATÓRIO

| Nível | Propósito | Quando Usar | Exemplo |
|---|---|---|---|
| ERROR | Falhas críticas que impedem execução | Exceções não tratadas, falhas em transações, perda de dados | Falha ao salvar no banco |
| WARN | Alerta que não quebra o sistema | Retentativas, obsolescência, queda de serviço externo | API externa não respondeu, usando fallback |
| INFO | Eventos normais e relevantes | Início/fim de processos, status, decisões de negócio | Pedido 1234 processado com sucesso |
| DEBUG | Diagnóstico com mais contexto | Fluxos de negócio, valores de variáveis, execução de métodos | Entrando no método A |
| TRACE | Detalhamento minucioso | Debug profundo, rastreamento de chamadas internas | Entrando no método A com valores (conta:1) |

## Campos Obrigatórios do Log (Padrão GELF/COGNA)

| Campo | Descrição | Obrigatório |
|---|---|---|
| Severity | Nível de log (ERROR, WARN, INFO, DEBUG, TRACE) | Sim |
| Time | Data e hora em UTC | Sim |
| app | Nome do ativo/solução | Sim |
| env | Ambiente (LOCAL, DEV, HOMO, PROD) | Sim |
| CorrelationID | ID para correlacionar chamadas entre microsserviços | Sim |
| full_message | Mensagem da ocorrência | Sim |
| SourceClassName | Caminho completo do arquivo/classe | Sim |
| SourceMethodName | Nome do método | Sim |
| SourceLineNumber | Linha do arquivo | Recomendado |
| Stacktrace | Pilha de chamadas (para ERROR) | Quando ERROR |
| Thread | Nome da thread | Recomendado |
| facility | Tipo de aplicação | Recomendado |

## Onde Aplicar Logs - OBRIGATÓRIO

### Funções Críticas para o Negócio
- Ao menos uma entrada INFO informando etapa executada com sucesso

### Classes e Métodos
- DEBUG no início e/ou fim de execução de métodos

### Erros Tratados
- DEBUG informando o erro tratado
- NÃO usar ERROR para erros de negócio esperados

### Erros Não Tratados
- ERROR incluindo stack trace completo
- Incluir contexto suficiente para diagnóstico

### Chamadas Externas
- INFO no sucesso
- WARN quando fallback é acionado
- ERROR quando falha definitiva

## Implementação - Padrão por Linguagem

### Java/Kotlin: SLF4J + MDC
- Usar MDC para campos de contexto (correlationId, app, env)
- Placeholders SLF4J para mensagens (nunca concatenação)
- MDC.clear() no finally

### C#/.NET: ILogger + BeginScope
- Usar BeginScope para campos de contexto
- LogDebug/LogInformation/LogError com template strings
- Incluir exception como último parâmetro em LogError

### TypeScript/JavaScript: Winston ou Pino
- Logger com campos padrão configurados
- Contexto como segundo parâmetro (objeto)
- Stack trace em campo separado para ERROR

### Python: structlog
- Campos de contexto como kwargs
- exc_info=True para ERROR
- Binding de contexto no início do método

## Recomendações - OBRIGATÓRIO

### O que FAZER
- Formatar mensagens de forma padronizada
- Incluir CorrelationID em TODAS as chamadas
- Usar operações assíncronas para logs
- Armazenar em repositório central
- Fornecer SEMPRE informações de contexto

### O que NÃO FAZER
- NÃO usar log como auditor de processos
- NÃO logar comportamentos esperados como ERROR
- NÃO incluir dados sensíveis sem mascaramento (PII, senhas, tokens)
- NÃO logar excessivamente

### Dados Sensíveis em Logs
- NUNCA logar: senhas, tokens, API keys, cartões de crédito
- MASCARAR: CPF, email, telefone (usar DataMasker)
- PERMITIDO: IDs de usuário, IDs de pedido, nomes de métodos, timestamps

## CorrelationID - OBRIGATÓRIO

- Gerar no ponto de entrada (API Gateway, primeiro serviço)
- Propagar em TODAS as chamadas entre microsserviços
- Incluir em TODOS os logs da cadeia
- Formato: UUID v4
- Header HTTP: X-Correlation-ID

## Referências
- Arquitetura de Referência de Logs - Grupo COGNA
- Padrão GELF (GrayLog Extended Log Format)
- OWASP Logging Cheat Sheet
