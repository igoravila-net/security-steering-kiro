---
inclusion: manual
---

# Políticas de Segurança - Cofre de Senhas e PAM (Grupo COGNA)

> Baseado na Política de Cofre de Senhas (Segurança da Informação_003 v1) do Grupo COGNA

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Senhas/credenciais hardcoded no código-fonte → Obter do cofre PAM dinamicamente
- Senhas em arquivos de configuração commitados → Usar vault/secrets manager
- Contas privilegiadas sem MFA → MFA obrigatório para acesso ao cofre
- Credenciais padrão de fornecedor em produção → Alterar antes do deploy
- Tokens/senhas sem expiração → Definir TTL e rotação automática
- Credenciais em repositórios (público ou privado) → NUNCA armazenar em repos

## Regras para Código - OBRIGATÓRIO

### Eliminação de Senhas Codificadas
- PROIBIDO codificar senhas, tokens, API keys ou qualquer credencial no código-fonte
- Credenciais DEVEM ser obtidas dinamicamente do cofre PAM em runtime
- Inclui: código, scripts, arquivos de configuração, Dockerfiles, pipelines CI/CD

### Priorização de Tokens
- Usar tokens OAuth gerados em tempo real pelo cofre PAM
- Tokens devem ter tempo de vida mínimo necessário
- Preferir tokens de curta duração sobre credenciais estáticas

### Contas de Aplicativos e Serviços
- Toda conta usada por aplicação/serviço com privilégios elevados DEVE estar no cofre PAM
- Inclui: DevOps, containers, microsserviços, jobs, scripts automatizados
- Cada aplicação/serviço DEVE ter sua própria conta de serviço (não compartilhar)

### Ambientes de Teste
- Após desenvolvimento/testes, TODAS as contas e permissões de teste DEVEM ser removidas
- Credenciais de teste NUNCA devem funcionar em produção

## Implementação no Código

### Padrão de Acesso a Segredos

Credenciais DEVEM ser buscadas do vault em runtime:
- Java: @Value com referência a vault/env
- .NET: IConfiguration com Azure Key Vault provider
- Node.js: process.env injetado pelo orquestrador (K8s, Docker)
- Python: pydantic-settings com integração vault

NUNCA declarar valores literais de credenciais no código-fonte.

### Rotação de Credenciais
- Credenciais gerais: rotação a cada 60-90 dias
- Credenciais críticas: rotação inferior a 30 dias
- Rotação DEVE ser automatizada (não manual)
- Aplicação DEVE suportar rotação sem downtime (reconectar automaticamente)

### Controles de Segurança no Código
- Princípio do menor privilégio: conta de serviço com permissões mínimas
- Conexões a bancos/APIs: usar credenciais com escopo limitado
- Logs: NUNCA logar credenciais, tokens ou segredos (nem parcialmente)
- Variáveis de ambiente: preferir injeção pelo orquestrador (K8s secrets, Docker secrets)

## Contas Privilegiadas - Regras

| Tipo | Descrição | Controle |
|---|---|---|
| Conta de serviço | Aplicações/jobs automatizados | Cofre PAM, rotação automática |
| Conta de aplicativo | Acesso a banco, APIs, jobs | Cofre PAM, conta individual por app |
| Admin de sistema | Gerência de sistemas individuais | MFA + cofre PAM + auditoria |
| Admin de domínio | Gerência de rede/AD/IAM | MFA + cofre PAM + aprovação + auditoria |
| Conta root | Privilégios ilimitados Unix/Linux | Cofre PAM + break glass + gravação de sessão |

## Regras de Desativação
- Contas privilegiadas inativas por 2 meses → Desativação automática
- Notificação ao proprietário 15 dias antes da desativação
- Reativação sujeita a revisão de segurança
- Revisão de acessos privilegiados: pelo menos a cada 2 meses

## Auditoria - OBRIGATÓRIO
- Toda ação com conta privilegiada DEVE ser atribuída a um usuário específico
- Logs devem incluir: data, hora, usuário, conta privilegiada, ativo acessado, ação, resultado
- Sessões privilegiadas DEVEM ser gravadas
- Análise mensal de logs via relatórios gerenciais
- Integração com SIEM para correlação de eventos

## Referências
- Política de Cofre de Senhas (Segurança da Informação_003 v1) - Grupo COGNA
- Procedimento de Uso de Senhas - Grupo COGNA
- ISO 27001:2022, ISO 27002:2022
- NIST SP 800-53 (Rev. 5)

