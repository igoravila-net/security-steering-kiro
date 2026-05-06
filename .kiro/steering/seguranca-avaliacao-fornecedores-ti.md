# Políticas de Segurança - Avaliação de Fornecedores de TI (Grupo COGNA)

> Baseado no Procedimento de Avaliação de Controles de Segurança da Informação para Fornecedores de TI (Segurança da Informação_PR007 v1) do Grupo COGNA

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Software/serviço de TI contratado sem avaliação de SI → Avaliação obrigatória antes da contratação
- Fornecedor com score abaixo de 70 sem Carta de Risco assinada → Obter aprovação da VP
- Fornecedor reprovado em uso no ambiente → Bloquear até regularização
- Biblioteca/serviço de terceiro sem avaliação de segurança → Submeter à avaliação TPRM
- Plano de ação de fornecedor não cumprido no prazo → Escalar para SI

## Processo de Avaliação - OBRIGATÓRIO

### Fluxo
1. Área solicitante requisita contratação de software/serviço de TI
2. Segurança da Informação gera relatório de score via ferramenta TPRM
3. Classificação do fornecedor (A a F)
4. Avaliação detalhada via formulário (se score >= 70)
5. Aprovação ou reprovação com justificativa

### Classificação de Score TPRM

| Nota | Pontuação | Status |
|---|---|---|
| A | > 90 | Aprovado (baixo risco) |
| B | 80-89 | Aprovado (risco aceitável) |
| C | 70-79 | Aprovado (com possível plano de ação) |
| D | 60-69 | Reprovado (requer Carta de Risco para prosseguir) |
| F | < 60 | Reprovado (alto risco) |

### Score >= 70 (A, B ou C)
- Formulário de avaliação enviado ao fornecedor (prazo: 4 dias úteis)
- Análise de preenchimento e evidências pela SI
- Se aprovado: pode ter plano de ação para mitigar pontos críticos
- Se reprovado: formalizar justificativa para Suprimentos

### Score < 70 (D ou F)
- SI formaliza para Suprimentos que fornecedor não possui score mínimo
- Compartilhar relatório detalhado com pontos críticos
- Se área solicitante decidir prosseguir: Carta de Risco assinada pela VP
- Plano de ação obrigatório para mitigar riscos

## Regras para Código - OBRIGATÓRIO

### Ao Integrar com Serviços de Terceiros
- Verificar se o fornecedor/serviço foi avaliado e aprovado pela SI
- Não integrar com serviços não homologados
- Bibliotecas e SDKs de terceiros: verificar se passaram por SCA
- APIs externas: validar certificações e práticas de segurança do provedor

### Ao Desenvolver Integrações
- Toda comunicação com terceiros: TLS 1.2+ obrigatório
- Credenciais de integração: via cofre PAM (nunca hardcoded)
- Validar e sanitizar TODOS os dados recebidos de APIs externas
- Implementar circuit breaker e timeout (máx 5s)
- Logar todas as chamadas a serviços externos para auditoria
- Rate limiting nas integrações

### Ao Usar Bibliotecas de Terceiros
- Verificar se a biblioteca está na lista de aprovadas
- Verificar CVEs conhecidos antes de adicionar dependência
- Usar versões fixas (pinned) — nunca ranges abertos
- Manter inventário de dependências atualizado

## Plano de Ação para Fornecedores

Quando SI atribui plano de ação:
- Prazo definido pela SI
- Fornecedor reporta status a cada quinzena
- Área solicitante responsável por cobrar cumprimento
- Reuniões de status com SI

## Carta de Risco

Necessária quando:
- Fornecedor com score < 70 e área decide prosseguir
- Deve ser assinada pela VP da área solicitante
- Documenta riscos identificados e aceite formal
- Não elimina necessidade de plano de ação

## Aprovações Necessárias para Contratação

Toda contratação de software/serviço de TI requer aprovação de:
- Segurança da Informação
- Privacidade de Dados
- Arquitetura de TI
- Suprimentos

## Referências
- Procedimento de Avaliação de Controles de SI para Fornecedores de TI (PR007 v1) - Grupo COGNA
- Política de Segurança da Informação - Grupo COGNA
- Política de Suprimentos/Compras - Grupo COGNA
