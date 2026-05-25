# Security Guardrails Power — COGNA

**22/05/2026** | v2.3.0 | Segurança da Informação

---

## Números

| | |
|---|---|
| CWEs cobertas | 46 (Top 25 MITRE 2024 completo + 21 adicionais) |
| Linguagens | 14 (13 homologadas + PHP) |
| Políticas COGNA automatizadas | 12 |
| Proteção em código de produção | 100% |
| SCA (Supply Chain) | 5 ecossistemas — 26+ pacotes proibidos, CVE check automático |
| Correção automática | Ao criar ou editar código — sem intervenção manual |
| Observabilidade/Logs | Padrão GELF COGNA, CorrelationID, mascaramento PII |
| Hooks ativos | 25 |

---

## Últimas atualizações (v2.3.0)

- Correção automática de vulnerabilidades ao criar ou editar código (sem intervenção manual)
- Cobertura completa do CWE Top 25 MITRE 2024 (100%) + 21 CWEs adicionais
- CVEs 2025-2026 adicionados: Next.js (auth bypass), React Server Components (RCE), Spring Cloud Gateway, Spring AI
- Novos ataques supply chain cobertos: Mini Shai-Hulud (worm npm, 314+ pacotes), PhantomRaven (Remote Dynamic Dependencies)
- PHP e WordPress com regras dedicadas (SQL injection, XSS, CSRF, upload, REST API, plugins proibidos)
- Templates de testes de segurança prontos para 6 linguagens (TypeScript, Java, Python, C#, PHP, Kotlin)
- Detecção automática de framework (Spring Boot, Laravel, NestJS, Express)
- Verificação de dependências deprecated e não utilizadas
- Regra absoluta: agente verifica CVEs via web antes de escrever versões de pacotes

---

## Próximos passos

- Piloto com squads selecionados
- Métricas de adoção (hook automático coleta dados por sessão)
- Feedback loop com findings Veracode
