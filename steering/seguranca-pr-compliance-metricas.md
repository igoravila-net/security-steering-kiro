---
inclusion: auto
---

# PR Security, Compliance e Métricas

> Regras para PRs, compliance e acompanhamento de adoção.

## PR Description - Segurança

Ao criar commit/PR que envolva segurança, incluir:
- Dados sensíveis envolvidos? (sim/não)
- Endpoints novos? (listar)
- Dependências adicionadas? (listar com versão)
- Classificação da informação afetada?
- Threat model necessário?
- Referência ao ticket (se corrigindo Veracode)

## Compliance as Code

### LGPD
- Consentimento registrado, finalidade definida, retenção com prazo
- Mecanismo de exclusão automática após prazo
- Auditoria de operações em dados sensíveis

### PCI-DSS (se pagamentos)
- Não armazenar CVV, tokenizar cartão
- Logs de transações financeiras
- Segregação de funções

### Dados de Menores
- Classificação CONFIDENCIAL obrigatória
- Consentimento do responsável legal

## Métricas de Adoção
- Vulnerabilidades bloqueadas pelo Power
- Findings do Veracode que passaram (gaps)
- Taxa de redução ao longo do tempo
- Top 5 vulnerabilidades mais bloqueadas
- Feedback dos devs (atrito vs valor)

## Domínios e Squads

| Domínio | Regras Específicas |
|---|---|
| Pagamentos | PCI-DSS, tokenização, SOX |
| Acadêmico/Alunos | LGPD reforçado, menores = CONFIDENCIAL |
| Marketing | Anonimização, consentimento |
| RH/Pessoas | Dados sensíveis = CONFIDENCIAL |
| Infraestrutura | CIS Benchmarks, hardening |

## Integração com Tickets
- Corrigindo Veracode: "fix(security): CWE-XX descrição [TICKET]"
- Requisito de segurança: referenciar user story
