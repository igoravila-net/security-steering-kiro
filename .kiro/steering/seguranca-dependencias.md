# Políticas de Segurança - Dependências e Componentes Vulneráveis

> Baseado em: [OWASP Vulnerable Dependency Management](https://cheatsheetseries.owasp.org/cheatsheets/Vulnerable_Dependency_Management_Cheat_Sheet.html), [OWASP Software Supply Chain Security](https://cheatsheetseries.owasp.org/cheatsheets/Software_Supply_Chain_Security.html)

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Dependência com CVE crítico conhecida → Atualizar imediatamente
- Dependência sem manutenção (abandonada/EOL) → Substituir por alternativa ativa
- Sem verificação de vulnerabilidades no CI/CD → Adicionar scan automático
- Versões sem pin (ranges abertos) → Usar versões exatas
- Dependências de fontes não confiáveis → Usar apenas registros oficiais

## REGRA DE VERIFICAÇÃO DE DEPENDÊNCIAS - OBRIGATÓRIO

Sempre que uma biblioteca ou dependência for adicionada, atualizada ou referenciada no código:

1. **Verificar se a versão utilizada possui CVEs conhecidos** consultando fontes como NVD, GitHub Advisories, Snyk DB
2. **Sugerir a versão segura mais recente** compatível com o projeto
3. **Alertar sobre bibliotecas EOL** (End of Life) e recomendar alternativas mantidas
4. **Usar versões exatas** (pinned) em vez de ranges abertos
5. **Verificar integridade** do pacote (checksums, assinaturas)

### Formato de Sugestão

Ao identificar uma dependência, informar:
- Nome da biblioteca
- Versão utilizada (se identificável)
- Versão mínima segura recomendada
- CVEs críticos evitados pela atualização
- Se a biblioteca está em EOL e qual a alternativa

## Bibliotecas PROIBIDAS (EOL / Abandonadas)

| Biblioteca | Status | Alternativa Recomendada |
|---|---|---|
| Log4j 1.x | EOL, sem patches | Log4j2 ou SLF4J + Logback |
| Apache Struts 1.x | EOL, múltiplos RCE | Spring MVC |
| AngularJS (1.x) | EOL desde 2021 | Angular 17+ |
| moment.js | EOL | date-fns ou dayjs |
| request (npm) | Deprecated | axios ou node-fetch |
| crypto-js < 4.2 | Vulnerável | crypto-js ≥ 4.2 ou Web Crypto API |
| Spring Boot 2.x | EOL | Spring Boot 3.3+ |
| Spring Framework 5.x | EOL | Spring Framework 6.1+ |
| Node.js < 18 | EOL | Node.js 20 LTS ou 22 |
| Python < 3.9 | EOL | Python 3.11+ |
| jQuery < 3.5 | Vulnerável (XSS) | jQuery 3.7+ ou framework moderno |
| lodash.template | Vulnerável (RCE) | Template literals nativos |
| vm2 | Abandonado (sandbox escape) | isolated-vm |
| inflight | Deprecated | Alternativas nativas |
| express < 4.21 | Vulnerável | Express 4.21+ ou 5.x |

## Regras por Ecossistema

### Java/Maven/Gradle
- Usar versões fixas no pom.xml (nunca ranges `[2.10,)`)
- Incluir OWASP Dependency-Check no build: `mvn dependency-check:check`
- Configurar `failBuildOnCVSS` ≥ 7
- Manter Spring Boot BOM atualizado (gerencia versões transitivas)

### Node.js/npm/yarn
- Usar `save-exact=true` no .npmrc
- Manter package-lock.json commitado
- Executar `npm audit --audit-level=high` no CI
- Usar `overrides` para forçar versões seguras de dependências transitivas
- NUNCA instalar pacotes com `--ignore-scripts` desabilitado globalmente

### Python/pip/poetry
- Usar poetry.lock ou requirements.txt com versões pinadas
- Executar `pip-audit` ou `safety check` no CI
- Preferir `>=X.Y.Z,<X+1` para limitar major version

### .NET/NuGet
- Usar versões exatas em .csproj
- Executar `dotnet list package --vulnerable`
- Manter pacotes Microsoft.* alinhados na mesma versão

### Swift/CocoaPods/SPM
- Usar `.exact("X.Y.Z")` em Package.swift
- Verificar advisories no GitHub do pacote

### Kotlin/Gradle (Android)
- Usar version catalogs (libs.versions.toml) com versões fixas
- Incluir dependency-check plugin

## Política de Atualização
- **Crítico (CVSS ≥ 9.0)**: Atualizar em até 24 horas
- **Alto (CVSS 7.0-8.9)**: Atualizar em até 7 dias
- **Médio (CVSS 4.0-6.9)**: Atualizar no próximo sprint
- **Baixo (CVSS < 4.0)**: Atualizar na próxima release

## Pipeline CI/CD com Scan de Segurança

```yaml
# GitHub Actions - Scan de dependências
name: Security Scan
on: [push, pull_request]

jobs:
  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'my-app'
          path: '.'
          format: 'HTML'
          args: '--failOnCVSS 7'
      
      - name: Run npm audit
        run: npm audit --audit-level=high
        
      - name: Run Trivy
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          severity: 'HIGH,CRITICAL'
          exit-code: '1'
```

## Referências
- [OWASP Vulnerable Dependency Management](https://cheatsheetseries.owasp.org/cheatsheets/Vulnerable_Dependency_Management_Cheat_Sheet.html)
- [OWASP Software Supply Chain Security](https://cheatsheetseries.owasp.org/cheatsheets/Software_Supply_Chain_Security.html)
- [OWASP NPM Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/NPM_Security_Cheat_Sheet.html)
