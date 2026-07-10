---
inclusion: manual
description: "Hook manual para o time de AppSec. Ao receber findings do Veracode, mapeia CWEs para steerings específicos e sugere melhorias nas regras."
---

O time de AppSec solicitou mapeamento de findings Veracode. Analise os CWEs reportados e para cada um:

1. Identifique o steering que deveria ter prevenido (constraints, implementation, validation, policies, infrastructure, observability, conditional)
2. Verifique se a regra correspondente existe e está adequada
3. Se a regra existe mas não preveniu: sugira melhoria no prompt/exemplo
4. Se a regra NÃO existe: sugira adição ao steering apropriado

Mapeamento CWE → Steering:
- CWE-89 (SQL Injection) → implementation.md seção 1
- CWE-79 (XSS) → implementation.md seção 2
- CWE-918 (SSRF) → implementation.md seção 3
- CWE-502 (Desserialização) → implementation.md seção 3
- CWE-327 (Crypto fraca) → implementation.md seção 4
- CWE-798 (Credenciais hardcoded) → constraints.md Secrets Scanning
- CWE-611 (XXE) → implementation.md seção 3
- CWE-22 (Path Traversal) → implementation.md seção 9
- CWE-862 (Missing Auth) → implementation.md seção 6
- CWE-1035 (Supply Chain) → constraints.md Supply Chain

Registre o mapeamento no arquivo VERACODE-MAPPING.md (crie se não existir).
