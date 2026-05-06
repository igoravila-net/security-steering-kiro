---
inclusion: auto
---

# Checklist de Segurança Pré-PR

> Verificar automaticamente antes de qualquer commit ou pull request.

## Checklist OBRIGATÓRIO

### Autenticação e Autorização
- [ ] Todo endpoint tem autenticação
- [ ] Todo endpoint verifica autorização (role ou ownership)
- [ ] Operações sensíveis exigem re-autenticação

### Input e Validação
- [ ] TODO input tem limite de caracteres
- [ ] TODO input passa por sanitização
- [ ] Validação de tipo, formato e range

### Dados e Privacidade
- [ ] Nenhum PII em logs
- [ ] Dados sensíveis mascarados em respostas
- [ ] Classificação da informação respeitada

### Credenciais e Segredos
- [ ] Nenhuma credencial hardcoded
- [ ] Segredos via vault/env em runtime
- [ ] Nenhum segredo em logs ou erros

### Injeção e XSS
- [ ] Nenhuma concatenação em SQL
- [ ] Nenhum eval/exec com dados externos
- [ ] Output encoding em saídas HTML
- [ ] Nenhum innerHTML sem sanitização

### Dependências
- [ ] Nenhum CVE crítico conhecido
- [ ] Versões fixas (pinned)
- [ ] Nenhuma biblioteca proibida/EOL

### Infraestrutura
- [ ] TLS 1.2+ em todas as conexões
- [ ] Security groups restritivos
- [ ] Containers não-root

### Logging
- [ ] Logs de auth (sucesso e falha)
- [ ] Correlation ID nas requisições
- [ ] Health check configurado

### Error Handling
- [ ] Nenhum stack trace ao cliente
- [ ] Mensagens genéricas
- [ ] Nenhuma info de tecnologia em headers
