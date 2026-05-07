---
inclusion: auto
---

# Feedback Loop com AppSec e Veracode

> Integração com AppSec da COGNA. Vulnerabilidades do Veracode alimentam este framework.

## Mapeamento Veracode CWE para Steerings

| CWE | Vulnerabilidade | Steering |
|---|---|---|
| CWE-79 | XSS | seguranca-xss-multilinguagem |
| CWE-89 | SQL Injection | seguranca-code-injection-sql |
| CWE-78 | Command Injection | seguranca-code-injection-sql |
| CWE-22 | Path Traversal | seguranca-credentials-directory-traversal |
| CWE-200 | Information Exposure | seguranca-information-leakage |
| CWE-259 | Hard-coded Password | seguranca-cofre-senhas-pam |
| CWE-327 | Broken Crypto | seguranca-criptografia-multilinguagem |
| CWE-352 | CSRF | seguranca-xss-csrf |
| CWE-502 | Deserialization | seguranca-ssrf-desserializacao |
| CWE-611 | XXE | seguranca-ssrf-desserializacao |
| CWE-918 | SSRF | seguranca-ssrf-desserializacao |
| CWE-798 | Hard-coded Credentials | seguranca-cofre-senhas-pam |
| CWE-862 | Missing Authorization | seguranca-authorization-encapsulation-quality |

## Processo de Melhoria
1. AppSec reporta finding do Veracode
2. Verificar se Power deveria ter prevenido
3. Se sim: melhorar steering com regra mais específica
4. Se não: criar nova regra
5. Atualizar versão do Power
6. Registrar no arquivo de aprendizado
