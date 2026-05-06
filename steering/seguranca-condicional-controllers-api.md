---
inclusion: fileMatch
fileMatchPattern: "**/*Controller*,**/*controller*,**/*Handler*,**/*handler*,**/*Route*,**/*route*,**/*Endpoint*,**/*endpoint*,**/routes/*,**/controllers/*,**/handlers/*"
---

# Regras de Segurança para Controllers e APIs

> Ativado automaticamente ao editar controllers, handlers ou rotas.

## OBRIGATÓRIO neste contexto

- Autenticação em TODOS os endpoints (exceto health/public explícito)
- Autorização: verificar role E ownership do recurso
- Validação em TODOS os request bodies
- Limite de caracteres em TODOS os parâmetros (query, path, body)
- Chamada a InputSanitizer antes de usar qualquer parâmetro
- Rate limiting configurado
- Paginação com limites (page >= 0, size entre 1 e 100)
- Retorno via DTO (NUNCA entidade de banco)
- Error handling: mensagem genérica, sem stack trace
- Log de auditoria: userId + action + timestamp
- CORS configurado (whitelist, não wildcard)
