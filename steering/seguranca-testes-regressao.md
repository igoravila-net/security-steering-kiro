---
inclusion: auto
---

# Testes de Regressão de Segurança

> Ao refatorar código, NUNCA remover testes de segurança existentes.

## REGRA ABSOLUTA
- NUNCA remover testes de segurança durante refatoração
- NUNCA reduzir cobertura de auth/authz/validation
- Se endpoint muda: atualizar testes (não remover)
- Se endpoint removido: documentar motivo

## Ao Refatorar - Manter Obrigatoriamente
- Testes de autenticação (401)
- Testes de autorização (403)
- Testes de validação (400)
- Testes de injeção (SQL, XSS, Command)
- Testes de rate limiting (429)
- Testes de dados sensíveis

## Ao Alterar Modelo de Dados
- Verificar validação em novos campos
- Verificar se novos campos são sensíveis
- Atualizar testes de mass assignment
- Atualizar testes de DTO

## Indicadores de Regressão (ALERTAR)
- Remoção de annotation de autenticação
- Remoção de validação de input
- Remoção de sanitização
- Remoção de testes com "security" ou "auth" no nome
- Endpoint novo sem testes de segurança

## Versionamento
- Patch (x.x.1): correção de regra existente
- Minor (x.1.0): nova regra ou categoria
- Major (1.0.0): mudança estrutural
