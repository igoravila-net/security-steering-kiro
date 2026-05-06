# Aprendizado Contínuo - Bibliotecas e Dependências Inseguras

> Este arquivo é atualizado automaticamente pelo hook `learn-from-insecure-dependencies` sempre que o hook de verificação de dependências detecta bibliotecas com CVEs ou versões inseguras.

## Como Funciona

1. Desenvolvedor edita arquivo de dependências (package.json, pom.xml, etc.)
2. Hook `check-dependency-security` pesquisa CVEs na web
3. Se encontrar vulnerabilidades, sugere versão segura ao desenvolvedor
4. Hook `learn-from-insecure-dependencies` registra a ocorrência aqui
5. Periodicamente, os dados são analisados para:
   - Identificar bibliotecas mais problemáticas (reincidentes)
   - Atualizar lista de bibliotecas proibidas no steering
   - Adicionar novas versões mínimas seguras
   - Identificar padrões por ecossistema

## Métricas

### Bibliotecas Mais Problemáticas

| Biblioteca | Ecossistema | Ocorrências | Último CVE | Status |
|---|---|---|---|---|
| (preenchido automaticamente) | | | | |

### Resumo por Ecossistema

| Ecossistema | Total Detecções | Biblioteca Mais Afetada |
|---|---|---|
| npm | 0 | — |
| Maven | 0 | — |
| pip | 0 | — |
| NuGet | 0 | — |
| Outros | 0 | — |

## Registro de Bibliotecas Inseguras Detectadas

<!-- Novas entradas adicionadas automaticamente abaixo -->
<!-- Formato: Data | Biblioteca | Versão Insegura | CVE | Versão Segura | Ecossistema -->

## Candidatas a Proibição

<!-- Bibliotecas que devem ser adicionadas à lista de PROIBIDAS -->
<!-- Critérios: EOL, abandonada, múltiplos CVEs críticos, sem manutenção -->

| Biblioteca | Motivo | Alternativa Sugerida | Adicionada ao Steering? |
|---|---|---|---|
| (preenchido automaticamente) | | | |

## Ações de Melhoria Realizadas

<!-- Registrar quando steering de dependências for atualizado com base nos dados -->
<!-- Formato: Data | Ação | Biblioteca | Detalhes -->
