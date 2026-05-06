# Políticas de Segurança - Criptografia em Banco de Dados (Grupo COGNA)

> Baseado na Política de Criptografia em Banco de Dados (Segurança da Informação_010 v1) do Grupo COGNA

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Banco de dados sem criptografia em repouso → AES-256 obrigatório (mínimo)
- Conexão ao banco sem TLS → TLS 1.2+ obrigatório
- Chaves criptográficas hardcoded no código → Usar KMS/vault do cloud provider
- Dados classificados como Interno/Restrito/Confidencial sem criptografia → Criptografar
- Acesso a chaves sem controle → Apenas SRE com permissão gerencia chaves

## Regras de Criptografia - OBRIGATÓRIO

### Dados em Repouso
- Algoritmo mínimo: AES-256
- Aplica-se a: SQL Server, MySQL, PostgreSQL, RDS (AWS), MongoDB, Oracle
- Dados PÚBLICOS: não requerem criptografia
- Dados INTERNOS, RESTRITOS ou CONFIDENCIAIS: DEVEM ser criptografados

### Dados em Trânsito
- Protocolo mínimo: TLS 1.2
- Quando possível: TLS 1.3
- Toda conexão aplicação-banco DEVE usar canal criptografado
- Toda conexão entre serviços DEVE usar TLS

### Gerenciamento de Chaves
- Usar serviços nativos do cloud provider (AWS KMS, Azure Key Vault)
- Chaves segregadas por Jornada/equipe (vaults separados)
- Administrador do vault: SRE responsável pela jornada
- Rotação de chaves: automatizada
- Contas de serviço individuais por aplicação

## Implementação no Código - OBRIGATÓRIO

### Connection Strings
- SEMPRE usar SSL/TLS na connection string
- NUNCA incluir senha na connection string commitada
- Buscar credenciais do vault em runtime
- Parâmetros obrigatórios: sslmode=require (PostgreSQL), Encrypt=True (SQL Server), tls=true (MongoDB)

### Criptografia em Nível de Coluna
- Dados pessoais sensíveis (saúde, biometria): criptografia em nível de coluna
- CPF, cartão de crédito: considerar tokenização
- Usar bibliotecas do framework para encrypt/decrypt transparente

### Controle de Acesso a Chaves
- Responsabilidade do time de SRE
- Permissões granulares: apenas quem precisa
- Auditoria de acesso às chaves

## Regras por Ambiente

| Ambiente | Criptografia Repouso | Criptografia Trânsito |
|---|---|---|
| Produção | AES-256 obrigatório | TLS 1.2+ obrigatório |
| Staging/Homologação | AES-256 obrigatório | TLS 1.2+ obrigatório |
| Desenvolvimento | Recomendado | TLS recomendado |

## Exceções
- Apenas se latência extremamente baixa for impactada pela criptografia
- Requer documentação e aprovação formal da Segurança da Informação

## Referências
- Política de Criptografia em Banco de Dados (Segurança da Informação_010 v1) - Grupo COGNA
- ISO 27001:2022, ISO 27002:2022
