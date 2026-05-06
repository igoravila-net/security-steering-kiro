# Políticas de Segurança - Inteligência Artificial Segura (Grupo COGNA)

> Baseado na Política de Inteligência Artificial Segura (Segurança da Informação_005 v1) do Grupo COGNA e ISO 42001:2024

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Dados confidenciais ou pessoais enviados a IA de terceiros → PROIBIDO
- Dados reais de clientes/alunos usados em prompts de IA → Usar dados de teste
- IA não homologada utilizada no ambiente corporativo → Apenas IAs aprovadas por TI/SI
- Código-fonte compartilhado em IA não aprovada → PROIBIDO (conforme Política de Dev Seguro)
- IA própria sem criptografia de dados → Criptografar em trânsito e repouso
- Modelo de IA em produção sem validação de segurança → Verificar antes do deploy
- Decisões de IA sem revisão humana → Sempre revisar criticamente

## Regras de Uso de IA - OBRIGATÓRIO

### O que é PROIBIDO
- Fornecer dados confidenciais, restritos ou pessoais a ferramentas de IA
- Usar dados reais de clientes, alunos ou colaboradores em prompts
- Usar IA para fins pessoais no ambiente corporativo e ativos da empresa
- Usar IA para fins injustos ou discriminatórios
- Usar IAs externas não homologadas e aprovadas pela TI
- Compartilhar código-fonte (parcial ou total) em IAs não aprovadas

### O que é PERMITIDO
- Usar IAs homologadas e aprovadas pela VP de TI e Segurança da Informação
- Priorizar IAs internas/próprias do Grupo Cogna
- Usar dados de teste (simulados) quando necessário interagir com IA
- Revisar e validar criticamente todas as saídas da IA antes de usar

### Dados em Prompts de IA
- NUNCA incluir: nomes reais, CPFs, emails, dados de saúde, dados financeiros
- NUNCA incluir: credenciais, tokens, API keys, connection strings
- NUNCA incluir: código-fonte proprietário em IAs não aprovadas
- PERMITIDO: dados fictícios, exemplos genéricos, perguntas conceituais

## Desenvolvimento de IAs Internas - OBRIGATÓRIO

### Segurança de Dados
- Criptografia de dados em trânsito (TLS 1.2+) e em repouso (AES-256)
- Anonimização e pseudonimização de dados sensíveis usados em treinamento
- Controle de acesso rigoroso a dados e sistemas de IA
- Dados de treinamento de fontes confiáveis (evitar envenenamento)

### Segurança do Modelo
- Verificação e validação rigorosa antes do deploy em produção
- Testes contra adversarial attacks
- Avaliação de vieses no modelo
- Atualizações regulares com correções de segurança

### Monitoramento e Auditoria
- Sistemas de monitoramento para detectar atividades suspeitas
- Logs de todas as interações para auditoria
- Gestão de vulnerabilidades com testes de penetração regulares
- Métricas de desempenho e segurança do modelo

### Conformidade
- LGPD: consentimento, finalidade, minimização de dados
- Transparência: documentar como decisões são tomadas pelo modelo
- Revisão humana: decisões críticas SEMPRE revisadas por humano

## Regras para Código com IA - OBRIGATÓRIO

### Ao Integrar APIs de IA no Código
- Validar e sanitizar TODAS as respostas da IA antes de usar (tratar como input não confiável)
- Limitar tamanho de prompts enviados (prevenir abuse/injection)
- Implementar rate limiting nas chamadas à API de IA
- Não expor API keys de serviços de IA no código-fonte (usar vault)
- Implementar timeout nas chamadas (máx 30s)
- Tratar erros graciosamente (não expor detalhes internos)

### Prompt Injection Prevention
- Sanitizar entrada do usuário antes de incluir em prompts
- Separar instruções do sistema de dados do usuário
- Validar e limitar formato de saída da IA
- Não executar código gerado por IA sem revisão humana
- Implementar guardrails para respostas (filtros de conteúdo)

### Dados em Pipelines de IA
- Dados de treinamento: anonimizar PII antes de usar
- Dados de inferência: não logar prompts que contenham dados sensíveis
- Resultados: classificar conforme política de classificação da informação
- Armazenamento: criptografar datasets e modelos

## Riscos Conhecidos

| Risco | Mitigação |
|---|---|
| Exposição de dados em prompts | Usar apenas dados de teste, nunca dados reais |
| Manipulação de dados de treinamento | Validar fontes, monitorar integridade |
| Prompt injection | Sanitizar inputs, separar instruções de dados |
| Adversarial attacks | Testes de robustez, monitoramento contínuo |
| Dependência excessiva | Revisão humana obrigatória para decisões críticas |
| Viés algorítmico | Auditoria de fairness, dados diversos |
| Coleta indevida de dados pessoais | Conformidade LGPD, minimização de dados |

## IAs Aprovadas vs Não Aprovadas
- Apenas IAs homologadas pela VP de TI + Segurança da Informação podem ser usadas
- Lista de IAs aprovadas: consultar time de Segurança da Informação
- Solicitação de nova IA: submeter avaliação de segurança antes do uso
- IAs com controles técnicos de DLP são preferidas

## Referências
- Política de Inteligência Artificial Segura (Segurança da Informação_005 v1) - Grupo COGNA
- ISO 27001:2022
- ISO 42001:2024 (AI Management System)
- ISO 22989:2023 (AI Concepts and Terminology)
- LGPD (Lei 13.709/2018)
