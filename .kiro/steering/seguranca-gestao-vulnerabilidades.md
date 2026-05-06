# Políticas de Segurança - Gestão de Vulnerabilidades Cibernéticas (Grupo COGNA)

> Baseado na Política de Gestão de Vulnerabilidades Cibernéticas (SI-1 v1) do Grupo COGNA

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Vulnerabilidade crítica não corrigida no prazo → Corrigir conforme SLA
- Código em produção sem SAST executado → Executar análise estática obrigatória
- Aplicação sem DAST em homologação → Executar teste dinâmico antes de produção
- Vulnerabilidade conhecida sem registro no inventário → Registrar em ferramenta própria
- Exceção sem justificativa formal e prazo → Documentar e aprovar com SI
- Correção sem validação de efetividade → Re-testar após implementação

## Processo de Gestão de Vulnerabilidades - Fases

| Fase | Descrição |
|---|---|
| 1. Avaliação | Definir escopo, ativos e tipos de testes |
| 2. Identificação | Executar testes para encontrar vulnerabilidades |
| 3. Priorização | Definir criticidade e prazo de correção |
| 4. Plano de Ação | Definir ações, riscos e impactos |
| 5. Correção | Implementar ações do plano |
| 6. Verificação | Re-testar para validar efetividade da correção |

## Tipos de Testes de Segurança - OBRIGATÓRIO

| Teste | Descrição | Frequência |
|---|---|---|
| Análise de Vulnerabilidades | Scan automatizado em ativos de TI | Mensal |
| Análise de Configuração | Validação de baselines de segurança | Conforme ciclo de scans |
| SAST | Análise estática do código-fonte | A cada alteração de código |
| DAST | Análise dinâmica da aplicação em execução | Antes de deploy em produção |
| Revisão de Código | Validação manual do código-fonte | Componentes críticos |
| Teste de Invasão (Pentest) | Simulação de ataque real | Anual |
| Bug Bounty | Programa de recompensas | Conforme política específica |

## SLAs de Correção de Vulnerabilidades

A criticidade é avaliada considerando:
- Nível de criticidade técnica da falha
- Nível de criticidade do ativo (dados e sistemas que comporta)

| Criticidade | Prazo Máximo de Correção |
|---|---|
| Crítica (CVSS 9.0-10.0) | Imediato / até 1 semana |
| Alta (CVSS 7.0-8.9) | Até 15 dias |
| Média (CVSS 4.0-6.9) | Até 1 mês |
| Baixa (CVSS 0.1-3.9) | Até 6 meses |

## Regras para Código - OBRIGATÓRIO

### SAST (Análise Estática)
- Executar durante desenvolvimento e a cada alteração de código-fonte
- Findings críticos e altos: corrigir ANTES do merge
- Integrar no pipeline CI/CD com gates de segurança
- Ferramentas aprovadas pelo time de Segurança da Informação

### DAST (Análise Dinâmica)
- Executar em ambiente de homologação/staging
- Buscar vulnerabilidades visíveis externamente
- Validar antes de liberar para produção

### Análise de Configuração
- Validar baselines de segurança nos ativos
- Estabelecer baseline seguro para novos ativos
- Aplicar hardening conforme padrões definidos

### Dependências (SCA)
- Verificar vulnerabilidades em bibliotecas de terceiros
- Atualizar dependências com CVEs conhecidos
- Manter inventário de dependências atualizado

## Inventário de Vulnerabilidades - OBRIGATÓRIO

Toda vulnerabilidade identificada DEVE ser registrada com:
- Título da vulnerabilidade
- Descrição e impacto técnico caso explorada
- Recomendação de correção
- Ativo impactado
- Responsável pela correção
- Prazo para resolução
- Status (aberta, em correção, corrigida, exceção)

## Exceções - Regras

Exceções permitidas APENAS nos seguintes casos:
1. **Falso positivo:** vulnerabilidade não existe no ativo (requer evidência)
2. **Risco aceitável:** existem controles compensatórios (requer análise de risco)

Regras:
- NENHUMA exceção pode ser permanente (deve ter prazo)
- Justificativa clara e tipo de exceção obrigatórios
- Aprovação conjunta: SI + responsável do ativo + TI
- Definir controles para minimizar probabilidade de exploração

## Verificação Pós-Correção - OBRIGATÓRIO

Após implementar correção:
- Realizar novo teste com mesma abordagem
- Validar efetividade dos controles implementados
- Documentar resultado da verificação

## Acompanhamento
- Reunião mensal entre SI e responsáveis pela correção
- Acompanhar evolução e identificar atrasos
- Manter controle atualizado de vulnerabilidades

## Regras para Desenvolvedores

### No Pipeline CI/CD
- SAST integrado: bloquear merge se findings críticos/altos
- SCA integrado: alertar sobre dependências vulneráveis
- DAST em staging: executar antes de promote para produção

### No Código
- Corrigir vulnerabilidades dentro do SLA
- Solicitar exceção formal se não for possível corrigir no prazo
- Validar correção com re-teste
- Não desabilitar ou omitir testes de segurança

## Referências
- Política de Gestão de Vulnerabilidades Cibernéticas (SI-1 v1) - Grupo COGNA
- Política de Desenvolvimento Seguro - Grupo COGNA
- Política de Classificação da Informação - Grupo COGNA
- ISO/IEC 29147:2018
- NIST
- SANS Implementing a Vulnerability Management Process
