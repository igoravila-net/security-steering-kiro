---
inclusion: manual
description: "Verificação completa sob demanda: dependências desatualizadas, deprecated e com vulnerabilidades. Detecta problemas transitivos e propõe atualização da dependência direta."
---

Execute verificação completa de saúde das dependências do projeto:

1. `npm outdated --long` — liste dependências diretas desatualizadas com tipo (dependencies vs devDependencies)
2. `npm audit --audit-level=moderate` — liste vulnerabilidades com severidade
3. `npm install --dry-run 2>&1` — capture TODOS os warnings de deprecated
4. `npx depcheck` — identifique dependências não utilizadas (superfície de ataque desnecessária)

Para CADA problema encontrado:
- Identifique a dependência DIRETA que causa o problema (use `npm ls <pacote>`)
- Verifique se existe versão mais recente que resolve
- Proponha atualização com versão exata (sem ^ ou ~)
- Se deprecated sem substituto direto, sugira alternativa

Priorização:
🔴 CVEs HIGH/CRITICAL → corrigir imediatamente
🟠 CVEs MODERATE → corrigir neste sprint
🟡 Deprecated com 'security'/'vulnerability'/'no longer maintained' → prioridade alta
🟡 Deprecated sem security issue → próximo sprint
🔵 Outdated (major) → avaliar breaking changes
⚪ Outdated (minor/patch) → atualizar quando conveniente
🗑️ Não utilizadas → remover (reduz superfície de ataque)

Se não for projeto npm, adapte para o ecossistema:
- pip: pip-audit + pip list --outdated + pip-extra-reqs
- Maven: mvn dependency-check:check + mvn versions:display-dependency-updates + mvn dependency:analyze
- NuGet: dotnet list package --vulnerable --deprecated --outdated
- Composer: composer audit + composer outdated + composer-unused
