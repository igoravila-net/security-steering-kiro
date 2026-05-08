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

### Supply Chain Security — npm/Node.js

#### Ataques Conhecidos e Mitigações

| Ataque | Descrição | Mitigação |
|---|---|---|
| Typosquatting | Pacotes com nomes similares (ex: `lodahs` em vez de `lodash`) | Verificar nome exato antes de instalar, usar `npm info` |
| Dependency Confusion | Pacote interno publicado no registry público com versão maior | Configurar registry privado com scoped packages (@org/) |
| Malicious Postinstall | Scripts de instalação executam código malicioso | Usar `--ignore-scripts` no CI, auditar scripts manualmente |
| Protestware | Mantenedor injeta código destrutivo em atualização | Pinnar versões exatas, revisar changelogs antes de atualizar |
| Account Takeover | Conta de mantenedor comprometida publica versão maliciosa | Monitorar advisories, usar lockfile com integridade |
| Starjacking | Pacote aponta para repo popular mas contém código diferente | Verificar repo real vs registry, auditar código-fonte |

#### Regras OBRIGATÓRIAS para npm

1. **Lockfile commitado e verificado**
   - `package-lock.json` SEMPRE commitado no repositório
   - CI DEVE usar `npm ci` (não `npm install`) — respeita lockfile exato
   - Verificar integridade: `npm audit signatures`

2. **Versões exatas (pinned)**
   - `.npmrc` com `save-exact=true`
   - NUNCA usar ranges abertos (`^`, `~`, `*`, `>=`)
   - Atualizar dependências de forma controlada (PR dedicado com review)

3. **Scoped packages para código interno**
   - Pacotes internos DEVEM usar scope: `@cogna/nome-pacote`
   - Configurar `.npmrc` com registry privado para scope interno
   - NUNCA publicar pacote interno no registry público

4. **Scripts de instalação**
   - CI: executar com `--ignore-scripts` e rodar scripts explicitamente após auditoria
   - Auditar `preinstall`, `install`, `postinstall` de novas dependências
   - Bloquear pacotes que executam binários externos no postinstall sem justificativa

5. **Auditoria e monitoramento**
   - `npm audit --audit-level=high` obrigatório no CI (falhar build se encontrar)
   - Revisar `npm outdated` semanalmente
   - Monitorar GitHub Advisories e Snyk para dependências do projeto
   - Usar `npm sbom` para gerar Software Bill of Materials

6. **Overrides para dependências transitivas**
   - Usar campo `overrides` no package.json para forçar versões seguras de dependências indiretas
   - Documentar motivo de cada override

7. **Verificação antes de instalar novo pacote**
   - Verificar: downloads semanais, última atualização, issues abertas, mantenedores
   - Desconfiar de: pacotes com < 1000 downloads/semana, sem atualizações há 2+ anos, mantenedor único
   - Verificar se nome é similar a pacote popular (typosquatting)
   - Preferir pacotes com provenance attestation (npm provenance)

8. **Pacotes PROIBIDOS (supply chain risk)**

   | Pacote | Motivo | Alternativa |
   |---|---|---|
   | event-stream | Comprometido (2018) — crypto mining | Streams nativos do Node.js |
   | ua-parser-js < 0.7.30 | Comprometido (2021) — crypto miner | ua-parser-js >= 1.0.33 |
   | colors >= 1.4.1 | Protestware (2022) — loop infinito | colors 1.4.0 ou chalk |
   | faker >= 6.6.6 | Protestware (2022) — dados apagados | @faker-js/faker |
   | node-ipc >= 10.1.1 | Protestware (2022) — wiper | node-ipc 9.x ou alternativa |
   | coa >= 2.0.3 | Comprometido (2021) | coa 2.0.2 |
   | rc >= 1.2.9 | Comprometido (2021) | rc 1.2.8 |
   | peacenotwar | Malware (wiper) | Remover |

9. **Configuração .npmrc segura**
   - save-exact=true
   - audit=true
   - fund=false
   - package-lock=true
   - @cogna:registry=https://npm.pkg.github.com

10. **Pipeline CI/CD — Verificações npm**
    - Instalar com lockfile: `npm ci --ignore-scripts`
    - Auditar dependências: `npm audit --audit-level=high`
    - Verificar assinaturas: `npm audit signatures`
    - Rebuild controlado: `npm rebuild`
    - Validar lockfile: `npx lockfile-lint --path package-lock.json --type npm --allowed-hosts npm --validate-https`

### Supply Chain Security — pip/Python

#### Ataques Conhecidos e Mitigações

| Ataque | Descrição | Mitigação |
|---|---|---|
| Typosquatting | Pacotes com nomes similares (ex: `reqeusts` em vez de `requests`) | Verificar nome exato com `pip show`, usar requirements pinados |
| Dependency Confusion | Pacote interno com mesmo nome no PyPI público | Usar `--index-url` privado + `--extra-index-url` com prioridade |
| Malicious setup.py | setup.py executa código arbitrário na instalação | Preferir wheels (.whl), auditar setup.py de pacotes novos |
| Namespace Squatting | Pacotes reservam nomes populares sem conteúdo legítimo | Verificar autor, repo, downloads antes de instalar |
| Backdoor em atualização | Mantenedor comprometido publica versão maliciosa | Pinnar versões, usar hash verification, monitorar advisories |

#### Regras OBRIGATÓRIAS para pip/Python

1. **Lockfile pinado e verificado**
   - Usar `requirements.txt` com versões exatas (`==`) ou `poetry.lock`/`Pipfile.lock`
   - CI DEVE usar `pip install --require-hashes -r requirements.txt`
   - NUNCA usar `>=` ou `~=` sem limite superior em produção

2. **Verificação de integridade (hashes)**
   - Gerar hashes: `pip-compile --generate-hashes`
   - CI valida hashes automaticamente com `--require-hashes`
   - Detecta substituição de pacotes no registry

3. **Registry privado para pacotes internos**
   - Pacotes internos DEVEM estar em registry privado (Artifactory, CodeArtifact, GitLab PyPI)
   - Configurar `pip.conf` com `--index-url` apontando para registry privado
   - NUNCA publicar pacote interno no PyPI público

4. **Auditoria e monitoramento**
   - `pip-audit` obrigatório no CI (falhar build em HIGH/CRITICAL)
   - `safety check` como alternativa
   - Monitorar GitHub Advisories e PyPI advisories
   - Gerar SBOM com `pip-licenses` ou `cyclonedx-py`

5. **Verificação antes de instalar novo pacote**
   - Verificar: downloads mensais (PyPI Stats), última release, mantenedores, repo ativo
   - Desconfiar de: pacotes com < 500 downloads/mês, sem release há 2+ anos, sem repo público
   - Verificar se nome é similar a pacote popular (typosquatting)
   - Preferir pacotes com Trusted Publishers (PyPI attestation)

6. **Pacotes PROIBIDOS (supply chain risk)**

   | Pacote | Motivo | Alternativa |
   |---|---|---|
   | jeIlyfish (com I maiúsculo) | Typosquatting de `jellyfish` — stealer | jellyfish |
   | colourama | Typosquatting de `colorama` — malware | colorama |
   | python3-dateutil | Typosquatting de `python-dateutil` | python-dateutil |
   | setup-tools | Typosquatting de `setuptools` | setuptools |
   | urllib | Typosquatting de `urllib3` | urllib3 |
   | reqeusts | Typosquatting de `requests` | requests |

7. **Configuração pip.conf segura**
   - index-url: registry privado como primário
   - extra-index-url: PyPI como fallback (com cuidado)
   - require-virtualenv: true (evitar instalação global)
   - trusted-host: apenas registries internos

8. **Pipeline CI/CD — Verificações pip**
   - Instalar com hashes: `pip install --require-hashes -r requirements.txt`
   - Auditar: `pip-audit --strict --desc`
   - Verificar licenças: `pip-licenses --fail-on="GPL-3.0"`
   - Scan de vulnerabilidades: `safety check --full-report`

### Supply Chain Security — Maven/Java

#### Ataques Conhecidos e Mitigações

| Ataque | Descrição | Mitigação |
|---|---|---|
| Dependency Confusion | Artefato interno com mesmo groupId no Maven Central | Usar groupId corporativo único, configurar mirror com prioridade |
| Typosquatting | Artefatos com groupId/artifactId similares | Verificar groupId oficial do projeto antes de adicionar |
| Compromised Repository | Mirror ou proxy comprometido serve artefatos alterados | Verificar checksums SHA-256, usar HTTPS, validar assinaturas GPG |
| Transitive Dependency Attack | Vulnerabilidade em dependência indireta (transitiva) | Usar `dependencyManagement`, OWASP Dependency-Check |
| Build Plugin Attack | Plugin Maven malicioso executa código no build | Usar apenas plugins de fontes confiáveis, pinnar versões |

#### Regras OBRIGATÓRIAS para Maven/Java

1. **Versões fixas e BOM**
   - NUNCA usar ranges `[2.0,)` ou `LATEST`/`RELEASE`
   - Usar `dependencyManagement` para controlar versões transitivas
   - Spring Boot BOM gerencia versões — manter atualizado

2. **Verificação de integridade**
   - Maven verifica checksums automaticamente (SHA-1/MD5)
   - Habilitar verificação de assinaturas GPG com `maven-gpg-plugin`
   - Usar HTTPS para todos os repositories no `settings.xml`

3. **Repository privado para artefatos internos**
   - Artefatos internos DEVEM estar em Nexus/Artifactory corporativo
   - GroupId corporativo: `com.cogna.*` ou `br.com.cogna.*`
   - Configurar mirror no `settings.xml` para interceptar requests ao Central
   - NUNCA publicar artefato interno no Maven Central

4. **OWASP Dependency-Check obrigatório**
   - Plugin `dependency-check-maven` no build
   - `failBuildOnCVSS` >= 7 (falhar em HIGH e CRITICAL)
   - Executar em toda build do CI
   - Suprimir falsos positivos com `suppression.xml` documentado

5. **Auditoria e monitoramento**
   - `mvn dependency:tree` para visualizar transitivas
   - `mvn versions:display-dependency-updates` semanalmente
   - Monitorar GitHub Advisories para dependências Java
   - Gerar SBOM com `cyclonedx-maven-plugin`

6. **Pacotes PROIBIDOS (supply chain risk)**

   | Pacote | Motivo | Alternativa |
   |---|---|---|
   | log4j-core < 2.17.1 | Log4Shell (CVE-2021-44228) — RCE | log4j-core >= 2.24 |
   | commons-collections < 3.2.2 | Desserialização RCE | commons-collections4 >= 4.4 |
   | spring-cloud-function < 3.2.3 | SpEL injection RCE (CVE-2022-22963) | >= 3.2.3 |
   | fastjson < 1.2.83 | Múltiplos RCE via autoType | Jackson ou Gson |
   | struts2-core (qualquer) | Múltiplos RCE históricos | Spring MVC |
   | commons-text < 1.10 | Text4Shell (CVE-2022-42889) | commons-text >= 1.10 |
   | snakeyaml < 2.0 | Desserialização insegura | snakeyaml >= 2.2 |

7. **Configuração settings.xml segura**
   - Mirrors: HTTPS obrigatório, apontar para Nexus/Artifactory interno
   - Servers: credenciais criptografadas com `maven-encryption`
   - Profiles: ativar OWASP Dependency-Check por default
   - NUNCA armazenar senhas em plaintext no settings.xml

8. **Pipeline CI/CD — Verificações Maven**
   - Build com check: `mvn verify -P security`
   - OWASP scan: `mvn dependency-check:check -DfailBuildOnCVSS=7`
   - Verificar atualizações: `mvn versions:display-dependency-updates`
   - Gerar SBOM: `mvn cyclonedx:makeAggregateBom`

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
