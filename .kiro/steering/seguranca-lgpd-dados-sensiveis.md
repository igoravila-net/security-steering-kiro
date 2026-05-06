# Políticas de Segurança - LGPD/GDPR e Dados Sensíveis

> Baseado em: [OWASP User Privacy Protection](https://cheatsheetseries.owasp.org/cheatsheets/User_Privacy_Protection_Cheat_Sheet.html), Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)

## VIOLAÇÕES CRÍTICAS (Falha automática)
- PII (dados pessoais) em logs → Mascarar ou remover
- Dados sensíveis sem criptografia em repouso → Criptografar com AES-256
- Coleta de dados sem finalidade definida → Coletar apenas o necessário
- Sem mecanismo de exclusão de dados → Implementar direito ao esquecimento
- Dados de produção em ambientes não-produtivos → Anonimizar
- Compartilhamento de dados sem consentimento → Registrar consentimento

## Classificação de Dados

| Categoria | Exemplos | Tratamento |
|---|---|---|
| Dados Pessoais | Nome, email, telefone, endereço | Criptografar, mascarar em logs |
| Dados Sensíveis | CPF, RG, dados de saúde, biometria | Criptografar, acesso restrito, auditoria |
| Dados Financeiros | Cartão de crédito, conta bancária | PCI-DSS, tokenização, nunca armazenar CVV |
| Credenciais | Senhas, tokens, API keys | Hash (Argon2id/BCrypt), nunca em plaintext |
| Dados Públicos | Nome da empresa, CNPJ público | Tratamento padrão |

## Princípios OBRIGATÓRIOS

1. **Minimização**: Coletar APENAS dados necessários para a finalidade
2. **Finalidade**: Usar dados APENAS para o propósito declarado
3. **Transparência**: Informar ao titular como seus dados são usados
4. **Segurança**: Proteger dados contra acesso não autorizado
5. **Retenção limitada**: Definir prazo de retenção e excluir após
6. **Portabilidade**: Permitir exportação dos dados do titular

## Mascaramento de Dados - OBRIGATÓRIO em Logs e Respostas

### Todas as linguagens devem implementar classe/módulo DataMasker com:
- maskEmail(email) → "j***n@example.com"
- maskCpf(cpf) → "***.456.***-**"
- maskPhone(phone) → "(11)****-89"
- maskCreditCard(card) → "****-****-****-1234"

### Regra de Log
```
// ✅ CORRETO
log.info("Usuário {} realizou operação {}", userId, action);

// ❌ ERRADO - PII em logs
log.info("Login: {} CPF: {} email: {}", nome, cpf, email);
```

## Retenção de Dados - OBRIGATÓRIO

| Tipo de Dado | Prazo Máximo de Retenção |
|---|---|
| Logs de acesso | 6 meses |
| Dados de sessão | 30 dias após expiração |
| Dados de usuário inativo | 2 anos (depois anonimizar) |
| Dados financeiros | 5 anos (obrigação legal) |
| Backups com PII | 90 dias |
| Dados de consentimento | Enquanto relação existir + 5 anos |

## Ambientes Não-Produtivos - OBRIGATÓRIO

- NUNCA usar dados reais de produção em dev/staging/QA
- Usar dados sintéticos ou anonimizados
- Se necessário copiar produção, anonimizar ANTES de restaurar

## Direito ao Esquecimento - OBRIGATÓRIO

Toda aplicação que armazena dados pessoais DEVE implementar:
1. Endpoint/processo de exclusão de dados do titular
2. Anonimização de dados que precisam ser mantidos (auditoria)
3. Propagação da exclusão para sistemas externos
4. Registro da exclusão para compliance

## Consentimento - OBRIGATÓRIO

Registrar para cada consentimento:
- ID do usuário
- Tipo de consentimento (marketing, analytics, compartilhamento)
- Status (concedido/revogado)
- Timestamp de concessão/revogação
- IP e user-agent
- Versão do termo aceito

## Referências
- [OWASP User Privacy Protection](https://cheatsheetseries.owasp.org/cheatsheets/User_Privacy_Protection_Cheat_Sheet.html)
- [LGPD - Lei 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
