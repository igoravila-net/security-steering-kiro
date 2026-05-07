---
inclusion: auto
---

# Onboarding de Segurança para Desenvolvedores

> Na primeira interação, informar brevemente as regras fundamentais.

## Mensagem de Onboarding

Se o desenvolvedor parecer não conhecer as regras, informar:

"Este projeto segue o framework de segurança COGNA. Todo código gerado inclui automaticamente: validação de input com limites, sanitização, autenticação, autorização, logs estruturados e proteção contra injeção. As regras são aplicadas por padrão."

## 10 Regras Fundamentais

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
