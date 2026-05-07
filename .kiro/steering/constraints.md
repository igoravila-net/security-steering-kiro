---
inclusion: auto
---

# Security Constraints — Regras Fundamentais

> Regras absolutas aplicadas a TODA geração de código. Violações resultam em bloqueio automático.

## Execução Automática Obrigatória

Ao escrever qualquer código, DEVE-SE automaticamente:
1. Todo input com limite de caracteres e sanitização
2. Credenciais buscadas de vault/env em runtime
3. Todo endpoint com autenticação + autorização + validação + rate limiting + paginação + DTO
4. Logs implementados (padrão COGNA: GELF, CorrelationID, níveis corretos)
5. SQL parametrizado (NUNCA concatenação)
6. Dados sensíveis mascarados em logs e respostas
7. Conexões externas com TLS 1.2+, timeout (máx 5s) e circuit breaker
8. Containers/IaC non-root, capabilities dropped, resource limits

Código inseguro é corrigido ANTES de apresentar ao usuário.

## Scaffolding Seguro — Padrões por Default

Ao criar qualquer componente novo, INCLUIR automaticamente:

### Controller / Handler / Route
- Autenticação (middleware/annotation)
- Autorização (verificação de role/ownership)
- Validação de input com limites de caracteres
- InputSanitizer em parâmetros recebidos
- Rate limiting + Paginação (page >= 0, size 1-100)
- Retorno via DTO (nunca entidade)
- Error handling sem detalhes internos
- Log de auditoria (userId, action, timestamp)

### Service / Use Case
- Verificação de ownership/autorização
- Validação de regras de negócio
- Transações para operações críticas
- Logging estruturado (sem PII)

### Repository / Data Access
- Consultas parametrizadas (NUNCA concatenação)
- Filtro por userId/tenantId quando aplicável
- Paginação no banco (LIMIT/OFFSET)
- Conexão com SSL/TLS

### Model / DTO
- DTOs separados para request e response
- Campos sensíveis NUNCA no DTO de resposta
- Validação em todos os campos string (limite de caracteres)

---

## Todo Input é Malicioso

### Limites de Caracteres OBRIGATÓRIOS

| Campo | Limite Máximo |
|---|---|
| Nome/título | 100 caracteres |
| Email | 255 caracteres |
| Senha | 128 caracteres |
| Descrição/bio | 500 caracteres |
| Comentário/texto livre | 2.000 caracteres |
| URL | 2.048 caracteres |
| Telefone | 20 caracteres |
| CPF/documento | 14 caracteres |
| Query de busca | 200 caracteres |
| Path parameter | 100 caracteres |
| JSON body total | 1 MB |
| Arquivo upload | 10 MB (configurável) |

### Sanitização Centralizada — Todas as Linguagens

Toda aplicação DEVE ter classe/módulo InputSanitizer com:
- sanitize(input, maxLength) — limitar + remover controle + trim
- sanitizeForHtml(input, maxLength) — escape HTML
- sanitizeForLog(input, maxLength) — remover CRLF

Todo dado de fonte externa (usuário, API, arquivo, header, cookie, query/path/body) DEVE:
1. Ter limite de caracteres definido explicitamente
2. Passar por função de sanitização antes de qualquer uso
3. Ser validado contra formato esperado (whitelist, regex, tipo)

---

## Dependências e Componentes Vulneráveis

### Regra de Verificação
Sempre que uma dependência for adicionada ou atualizada:
1. Verificar CVEs conhecidos (NVD, GitHub Advisories, Snyk)
2. Sugerir versão segura mais recente
3. Alertar sobre bibliotecas EOL
4. Usar versões exatas (pinned)
5. Verificar integridade (checksums)

### Bibliotecas PROIBIDAS

| Biblioteca | Alternativa |
|---|---|
| Log4j 1.x | Log4j2 ou SLF4J + Logback |
| Apache Struts 1.x | Spring MVC |
| AngularJS (1.x) | Angular 17+ |
| moment.js | date-fns ou dayjs |
| request (npm) | axios ou node-fetch |
| Spring Boot 2.x | Spring Boot 3.3+ |
| Node.js < 18 | Node.js 20 LTS+ |
| Python < 3.9 | Python 3.11+ |
| jQuery < 3.5 | jQuery 3.7+ |
| vm2 | isolated-vm |
| express < 4.21 | Express 4.21+ ou 5.x |

### Política de Atualização
- Crítico (CVSS >= 9.0): 24 horas
- Alto (CVSS 7.0-8.9): 7 dias
- Médio (CVSS 4.0-6.9): próximo sprint
- Baixo (CVSS < 4.0): próxima release

---

## Secrets Scanning — Padrões de Detecção

Se detectar qualquer padrão abaixo, BLOQUEAR e instruir a usar vault/env:

### API Keys
- Prefixos: sk-, pk-, api_, AKIA (AWS), AIza (Google), ghp_ (GitHub), glpat- (GitLab)

### Tokens e Senhas
- Bearer token com valor literal
- JWT hardcoded (eyJ...)
- password/senha/pwd = valor literal
- connectionString com credenciais embutidas

### Chaves Privadas
- BEGIN RSA/EC/PRIVATE KEY
- Conteúdo .pem/.key inline

### Variáveis Suspeitas
Bloquear quando variável com estes nomes receber valor literal:
password, passwd, secret, api_key, token, access_token, private_key, encryption_key, connection_string, client_secret

---

## 10 Regras Fundamentais (Onboarding)

1. Todo input é malicioso — limite + sanitização em TUDO
2. Credenciais no vault — nunca hardcoded
3. Auth em todo endpoint — autenticação + autorização + ownership
4. Logs padrão COGNA — INFO/ERROR/DEBUG + CorrelationID
5. SQL parametrizado — nunca concatenar
6. DTOs separados — nunca expor entidade
7. Dados sensíveis mascarados — em logs e respostas
8. Testes de segurança — gerados junto com código
9. Dependências seguras — versões fixas, sem CVEs
10. Classificação da informação — pessoais RESTRITO, sensíveis CONFIDENCIAL

## Canais de Suporte
- Incidentes: csirt@cogna.com.br
- Políticas: SI via ITSM (ServiceNow)
- Acessos: gia-acessos@cogna.com.br
