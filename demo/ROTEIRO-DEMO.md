# Roteiro de Demonstração — Security Guardrails Power

## Preparação
1. Abrir o Kiro com o Power de Segurança ativo
2. Ter este projeto aberto (ou qualquer projeto com o Power instalado)
3. Abrir os arquivos da pasta `demo/` um por um

## Demo 1 — SQL Injection (30s)
1. Abrir `demo/vulneravel-sql-injection.ts`
2. Pedir ao Kiro: "corrija este código"
3. Mostrar que o Power detecta a concatenação SQL e corrige para parametrizado
4. **Ponto-chave:** "O Power bloqueia ANTES de escrever código vulnerável"

## Demo 2 — Credenciais Hardcoded (30s)
1. Abrir `demo/vulneravel-credenciais.ts`
2. Pedir ao Kiro: "corrija este código"
3. Mostrar que o Power detecta API keys e senhas hardcoded
4. **Ponto-chave:** "Segredos nunca entram no código — vault/env obrigatório"

## Demo 3 — XSS (30s)
1. Abrir `demo/vulneravel-xss.ts`
2. Pedir ao Kiro: "corrija este código"
3. Mostrar que o Power detecta innerHTML e dangerouslySetInnerHTML
4. **Ponto-chave:** "Output encoding automático, sanitização obrigatória"

## Demo 4 — Command Injection (30s)
1. Abrir `demo/vulneravel-command-injection.py`
2. Pedir ao Kiro: "corrija este código"
3. Mostrar que o Power detecta shell=True e exec com input
4. **Ponto-chave:** "APIs sem shell, validação whitelist"

## Demo 5 — Supply Chain (30s)
1. Abrir `demo/vulneravel-supply-chain-package.json`
2. Pedir ao Kiro: "verifique as dependências deste package.json"
3. Mostrar que o Power detecta pacotes proibidos e versões com CVEs
4. **Ponto-chave:** "26 pacotes proibidos, CVE check automático"

## Demo 6 — Geração Segura (1min)
1. Pedir ao Kiro: "crie um endpoint POST /api/users que recebe name e email"
2. Mostrar que o código gerado JÁ VEM com:
   - Validação de input (limite de caracteres)
   - Sanitização
   - Autenticação
   - Rate limiting
   - DTO separado
   - Error handling seguro
3. **Ponto-chave:** "Segurança por design — código nasce seguro"

## Demo 7 — Logs Seguros / Observabilidade (1min)
1. Abrir `demo/vulneravel-logs-sem-padrao.ts`
2. Pedir ao Kiro: "corrija este código seguindo o padrão de logs COGNA"
3. Mostrar que o Power:
   - Remove PII dos logs (senha, CPF, cartão)
   - Adiciona CorrelationID
   - Usa formato GELF estruturado
   - Aplica níveis corretos (INFO para sucesso, WARN para falha de auth, ERROR para exceções)
   - Mascara dados sensíveis (email parcial, cartão com últimos 4 dígitos)
4. **Ponto-chave:** "Padrão COGNA de observabilidade aplicado automaticamente — LGPD compliance nos logs"

## Demo 8 — Autenticação e Autorização (1min)
1. Abrir `demo/vulneravel-sem-auth.ts`
2. Pedir ao Kiro: "corrija este código"
3. Mostrar que o Power:
   - Adiciona middleware de autenticação (JWT)
   - Adiciona verificação de role (admin)
   - Adiciona verificação de ownership (IDOR prevention)
   - Adiciona rate limiting
   - Substitui entidade por DTO
   - Corrige mensagem de erro (não revela se email existe)
4. **Ponto-chave:** "Auth + Authz + Rate Limiting + DTO — tudo obrigatório por default"

## Demo 9 — Infraestrutura Segura (30s)
1. Abrir `demo/vulneravel-infra.Dockerfile`
2. Pedir ao Kiro: "corrija este Dockerfile"
3. Mostrar que o Power:
   - Troca :latest por tag específica
   - Adiciona USER não-root
   - Remove segredos do ENV
   - Adiciona multi-stage build
   - Adiciona HEALTHCHECK
   - Remove porta 22
   - Adiciona .dockerignore
4. **Ponto-chave:** "IaC seguro — containers hardened automaticamente"

## Mensagem Final
"O Power protege 100% do código de produção, em 13 linguagens, contra 21+ categorias de ataque. Transparente para o desenvolvedor."
