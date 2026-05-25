# Mapeamento CWE → Security Guardrails Power

> Documento de referência — NÃO commitar

---

## CWE Top 25 (2024) — 100% Coberto

| # | CWE | Nome | Steering | Seção |
|---|---|---|---|---|
| 1 | CWE-79 | XSS | implementation.md | Seção 2 |
| 2 | CWE-787 | Out-of-bounds Write | implementation.md | Seção 18 |
| 3 | CWE-89 | SQL Injection | implementation.md | Seção 1 |
| 4 | CWE-352 | CSRF | implementation.md | Seção 7 (API Security) |
| 5 | CWE-22 | Path Traversal | implementation.md | Seção 9 |
| 6 | CWE-125 | Out-of-bounds Read | implementation.md | Seção 18 |
| 7 | CWE-78 | OS Command Injection | implementation.md | Seção 1 |
| 8 | CWE-416 | Use After Free | implementation.md | Seção 18 |
| 9 | CWE-862 | Missing Authorization | implementation.md | Seção 6 |
| 10 | CWE-434 | Unrestricted File Upload | implementation.md | Seções 15, 16 |
| 11 | CWE-94 | Code Injection | implementation.md | Seção 1 |
| 12 | CWE-20 | Improper Input Validation | constraints.md | Todo Input é Malicioso |
| 13 | CWE-77 | Command Injection | implementation.md | Seção 1 |
| 14 | CWE-287 | Improper Authentication | implementation.md | Seção 5 |
| 15 | CWE-269 | Improper Privilege Management | implementation.md | Seção 6 |
| 16 | CWE-502 | Deserialization of Untrusted Data | implementation.md | Seção 3 |
| 17 | CWE-200 | Exposure of Sensitive Information | implementation.md | Seção 10 |
| 18 | CWE-863 | Incorrect Authorization | implementation.md | Seção 6, 14 |
| 19 | CWE-918 | SSRF | implementation.md | Seção 3, 14 |
| 20 | CWE-119 | Buffer Overflow | implementation.md | Seção 18 |
| 21 | CWE-476 | NULL Pointer Dereference | implementation.md | Seção 17 (Go error handling) |
| 22 | CWE-798 | Hardcoded Credentials | constraints.md | Secrets Scanning |
| 23 | CWE-190 | Integer Overflow | implementation.md | Seção 18 |
| 24 | CWE-400 | Uncontrolled Resource Consumption | implementation.md | Seção 14 (API4) |
| 25 | CWE-306 | Missing Auth for Critical Function | implementation.md | Seção 14 (API5) |

---

## CWEs Adicionais Cobertas (além do Top 25)

| CWE | Nome | Steering | Seção |
|---|---|---|---|
| CWE-311 | Missing Encryption of Sensitive Data | implementation.md | Seção 4 (Criptografia) |
| CWE-312 | Cleartext Storage of Sensitive Info | constraints.md | Secrets Scanning |
| CWE-319 | Cleartext Transmission | implementation.md | Seção 4 (TLS 1.2+) |
| CWE-327 | Use of Broken Crypto Algorithm | implementation.md | Seção 4 |
| CWE-328 | Reversible One-Way Hash (MD5/SHA1 para senhas) | implementation.md | Seção 5 |
| CWE-330 | Insufficient Randomness | implementation.md | Seção 4 (CSPRNG) |
| CWE-384 | Session Fixation | implementation.md | Seção 5 (regenerar após login) |
| CWE-532 | Info Exposure Through Log Files | observability.md | Dados sensíveis em logs |
| CWE-601 | Open Redirect | implementation.md | Seção 8 (CRLF/redirect) |
| CWE-611 | XXE | implementation.md | Seção 3 |
| CWE-613 | Insufficient Session Expiration | implementation.md | Seção 5 (timeout 30min) |
| CWE-614 | Sensitive Cookie Without Secure Flag | implementation.md | Seção 5 (Secure+HttpOnly+SameSite) |
| CWE-640 | Weak Password Recovery | implementation.md | Seção 14 (API2) |
| CWE-732 | Incorrect Permission Assignment | infrastructure.md | K8s/Docker (non-root) |
| CWE-776 | Improper Restriction of Recursive Entity References (XML bomb) | implementation.md | Seção 3 (XXE) |
| CWE-829 | Inclusion of Functionality from Untrusted Control Sphere | constraints.md | Supply Chain |
| CWE-915 | Mass Assignment | implementation.md | Seção 14 (API3) |
| CWE-942 | Permissive CORS Policy | implementation.md | Seção 7, 14 (API8) |
| CWE-1021 | Clickjacking (Improper Restriction of Rendered UI) | implementation.md | Seção 7 (X-Frame-Options) |
| CWE-1035 | Using Components with Known Vulnerabilities | constraints.md | Supply Chain (5 ecossistemas) |
| CWE-1104 | Use of Unmaintained Third-Party Components | constraints.md | Bibliotecas PROIBIDAS |

---

## Cobertura por Categoria OWASP

| OWASP Top 10:2025 | CWEs Mapeadas | Status |
|---|---|---|
| A01 Broken Access Control | CWE-862, 863, 22, 601, 352, 269, 306, 915 | ✅ |
| A02 Security Misconfiguration | CWE-732, 942, 1021 | ✅ |
| A03 Supply Chain Failures | CWE-829, 1035, 1104 | ✅ |
| A04 Cryptographic Failures | CWE-311, 312, 319, 327, 328, 330 | ✅ |
| A05 Injection | CWE-79, 89, 78, 77, 94, 611 | ✅ |
| A06 Insecure Design | CWE-502, 918, 400 | ✅ |
| A07 Authentication Failures | CWE-287, 384, 613, 614, 640, 798 | ✅ |
| A08 Software/Data Integrity | CWE-502, 829 | ✅ |
| A09 Logging & Alerting Failures | CWE-532, 200 | ✅ |
| A10 Exceptional Conditions | CWE-476, 190, 400 | ✅ |

---

## Total: 46 CWEs cobertas

- CWE Top 25: **25/25** (100%)
- CWEs adicionais relevantes: **21**
- CWEs não aplicáveis (C/C++ memory-only sem contexto managed): 0 gaps
