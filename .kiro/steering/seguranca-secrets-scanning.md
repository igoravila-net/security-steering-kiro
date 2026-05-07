---
inclusion: auto
---

# Secrets Scanning - Padrões de Detecção

> Detectar e bloquear segredos antes de serem escritos no código.

## REGRA: Bloquear Qualquer Segredo no Código

Se detectar qualquer padrão abaixo, BLOQUEAR e instruir a usar vault/env.

## Padrões de API Keys
- Prefixo sk- (Stripe, OpenAI)
- Prefixo pk- (Stripe public)
- Prefixo api_ ou api-
- AWS: AKIA seguido de 16 caracteres
- Google: AIza seguido de 35 caracteres
- GitHub: ghp_ seguido de 36 caracteres
- GitLab: glpat- seguido de 20+ caracteres

## Padrões de Tokens
- Bearer token com valor literal
- JWT hardcoded (eyJ...)
- OAuth tokens com valor literal

## Padrões de Senhas/Connection Strings
- password/senha/pwd = valor literal
- connectionString com credenciais embutidas
- mongodb/postgres/mysql/redis:// com user:pass@host

## Padrões de Chaves Privadas
- BEGIN RSA/EC/PRIVATE/OPENSSH PRIVATE KEY
- Conteúdo de .pem/.key/.p12 inline no código

## Padrões Cloud (AWS/Azure/GCP)
- AWS Secret Access Key (40 chars base64)
- Azure Storage Key (86 chars + ==)
- Azure Service Bus SharedAccessKey
- GCP Service Account JSON com private_key

## Variáveis Suspeitas

Bloquear quando variável com estes nomes receber valor literal:
- password, passwd, pwd, senha, secret
- api_key, apikey, api_secret, token
- access_token, refresh_token, private_key
- encryption_key, connection_string, client_secret

## Ação ao Detectar
1. BLOQUEAR a escrita
2. Informar: "Segredo detectado. Use variável de ambiente ou cofre PAM."
3. Sugerir alternativa segura para a linguagem em uso
