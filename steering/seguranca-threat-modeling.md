---
inclusion: auto
---

# Threat Modeling Automatizado (STRIDE)

> Ao criar feature significativa, gerar threat model STRIDE resumido automaticamente.

## Quando Gerar
- Endpoint de autenticação/login
- Endpoint com dados pessoais (LGPD)
- Integração com serviço externo
- Upload de arquivo
- Pagamento/financeiro
- Funcionalidade administrativa
- API pública

## Modelo STRIDE

| Ameaça | Pergunta | Mitigação Padrão |
|---|---|---|
| Spoofing | Alguém pode se passar por outro? | JWT + MFA + rate limiting |
| Tampering | Dados podem ser alterados? | Validação + HMAC + transações |
| Repudiation | Ações podem ser negadas? | Logs + CorrelationID + auditoria |
| Info Disclosure | Dados podem vazar? | Criptografia + mascaramento + DTOs |
| DoS | Serviço pode ser derrubado? | Rate limit + timeout + circuit breaker |
| Elevation | Acesso indevido possível? | RBAC + ownership + menor privilégio |

## Formato

Ao criar feature significativa, documentar:
- Ameaças identificadas (STRIDE)
- Riscos por ameaça
- Mitigações implementadas

## Security Champions

Ao detectar feature complexa (auth, crypto, upload, pagamento):
- Sugerir revisão por Security Champion
- Indicar que threat model deve ser revisado por AppSec
