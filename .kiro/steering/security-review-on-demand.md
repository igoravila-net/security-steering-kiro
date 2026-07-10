---
inclusion: manual
description: "Revisão completa de segurança sob demanda. O desenvolvedor aciona manualmente para obter análise profunda do arquivo ativo contra todas as 20 categorias de testes de segurança."
---

Execute revisão COMPLETA de segurança no arquivo ativo. Aplique TODAS as 20 categorias:

1. Autenticação (tokens, sessões, MFA)
2. Autorização (RBAC, ownership, IDOR)
3. Validação de input (limites, sanitização, tipos)
4. SQL/Code/Command Injection
5. XSS (output encoding, CSP)
6. SSRF (whitelist de URLs, bloqueio de IPs internos)
7. CSRF (tokens, SameSite)
8. Rate limiting
9. Criptografia (algoritmos, chaves, TLS)
10. Secrets management (hardcoded, vault)
11. Error handling (sem stack traces, mensagens genéricas)
12. Logging (GELF, CorrelationID, sem PII)
13. CORS (whitelist, não wildcard)
14. Timeout/DoS (limites de body, timeouts)
15. Upload (validação de tipo, tamanho, path)
16. Sessão/Cookies (Secure, HttpOnly, SameSite)
17. Headers de segurança (HSTS, X-Frame-Options, CSP)
18. Mass Assignment (DTOs separados, campos protegidos)
19. Desserialização (formatos seguros, whitelist)
20. Directory Traversal (canonical path, base dir check)

Para cada categoria aplicável, indique: OK ou PROBLEMA + correção.
Ignore categorias não aplicáveis ao contexto do arquivo.
