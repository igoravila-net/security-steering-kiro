---
inclusion: manual
description: "Hook manual que o time de AppSec pode acionar para buscar CVEs recentes na web (cve.org, NVD, GitHub Advisories) e atualizar os steerings com novas vulnerabilidades encontradas em bibliotecas e padrões de código."
---

O time de AppSec solicitou atualização de CVEs. Execute as seguintes ações:

1. Pesquise na web por CVEs recentes (últimos 30 dias) que afetem as bibliotecas utilizadas pela empresa (Spring Boot, Jackson, Netty, React, Next.js, Express, Django, Flask, .NET, Lodash, axios, etc.)

2. Para cada CVE encontrado:
   - Identifique a biblioteca afetada e versão vulnerável
   - Identifique a versão corrigida
   - Classifique a severidade (CVSS)
   - Determine o tipo de vulnerabilidade (RCE, XSS, SQL Injection, DoS, etc.)

3. Atualize o arquivo .kiro/steering/seguranca-aprendizado-bibliotecas.md com os novos CVEs encontrados

4. Se encontrar padrões de código vulneráveis novos (não cobertos pelos steerings existentes):
   - Adicione ao steering apropriado (seguranca-erros-comuns-linguagem.md, seguranca-ptk-patterns.md, etc.)
   - Ou crie entrada no seguranca-aprendizado-vulnerabilidades.md na seção Gaps

5. Se encontrar bibliotecas que devem ser adicionadas à lista de PROIBIDAS:
   - Atualize seguranca-dependencias.md

6. Apresente um resumo do que foi encontrado e atualizado.

Fontes para pesquisar: cve.org, nvd.nist.gov, github.com/advisories, snyk.io/vuln
