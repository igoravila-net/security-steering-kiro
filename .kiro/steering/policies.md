---
inclusion: always
description: "Políticas corporativas COGNA: SI geral, LGPD, acessos, incidentes, IA segura, criptografia, cloud"
---

# Policies — Políticas Corporativas COGNA

> Políticas de Segurança da Informação do Grupo COGNA aplicáveis ao desenvolvimento de software.
> Baseado em: ISO 27001:2022, ISO 42001:2024, NIST CSF, LGPD (Lei 13.709/2018).

---

## 1. Política Geral de SI (SI_001 v07)

### Princípios CID
- **Confidencialidade**: somente autorizados acessam a informação
- **Integridade**: informação íntegra, verdadeira e completa
- **Disponibilidade**: disponível para autorizados quando necessário

### Regras Gerais
- TODA informação gerada/armazenada pelo Grupo COGNA é propriedade intelectual da empresa
- Proteger conforme classificação (Pública, Interna, Restrita, Confidencial)
- TODOS devem relatar eventos que comprometam CID
- Nenhum usuário deve tomar ação própria sobre eventos de segurança — comunicar SI
- Terceiros com acesso a dados: avaliação de SI obrigatória antes de produção

---

## 2. Classificação da Informação

| Nível | Exemplos | Controles |
|---|---|---|
| Pública | Site institucional, CNPJ | Sem restrição |
| Interna | Processos internos, manuais | Acesso apenas colaboradores |
| Restrita | Dados pessoais (nome, email, telefone) | Criptografia + controle de acesso |
| Confidencial | Dados sensíveis (saúde, biometria), financeiros | Criptografia + acesso mínimo + auditoria |

---

## 3. LGPD e Dados Sensíveis

### Princípios OBRIGATÓRIOS
1. **Minimização**: coletar APENAS dados necessários
2. **Finalidade**: usar APENAS para propósito declarado
3. **Transparência**: informar ao titular como dados são usados
4. **Segurança**: proteger contra acesso não autorizado
5. **Retenção limitada**: definir prazo e excluir após
6. **Portabilidade**: permitir exportação dos dados do titular

### Mascaramento — OBRIGATÓRIO em Logs e Respostas
- maskEmail: j***n@example.com
- maskCpf: ***.456.***-**
- maskPhone: (11)****-89
- maskCreditCard: ****-****-****-1234

### Retenção de Dados

| Tipo | Prazo Máximo |
|---|---|
| Logs de acesso | 6 meses |
| Dados de sessão | 30 dias após expiração |
| Dados de usuário inativo | 2 anos (depois anonimizar) |
| Dados financeiros | 5 anos (obrigação legal) |
| Backups com PII | 90 dias |

### Direito ao Esquecimento — OBRIGATÓRIO
- Endpoint/processo de exclusão de dados do titular
- Anonimização de dados mantidos para auditoria
- Propagação da exclusão para sistemas externos

### Ambientes Não-Produtivos
- NUNCA usar dados reais de produção em dev/staging/QA
- Usar dados sintéticos ou anonimizados

---

## 4. Gestão de Acessos Lógicos (SI_004 v3)

### Princípios
- **Menor privilégio**: apenas permissões mínimas necessárias
- **Segregação de funções**: quem aprova não executa, quem desenvolve não faz deploy em produção
- **Identificação individual**: toda ação rastreável a um indivíduo

### Tipos de Conta

| Tipo | Controles |
|---|---|
| Conta comum | Nominal, senha pessoal, atividades diárias |
| Conta privilegiada | Cofre PAM, MFA, aprovação SI + gestor + dono app |
| Conta de serviço | Cofre PAM, sem logon interativo, permissões limitadas |

### Regras para Código
- Todo sistema DEVE implementar RBAC com perfis granulares
- Verificar permissão em CADA operação (não apenas no login)
- Sessões inativas: timeout max 30 min para sistemas críticos
- Contas inativas 60+ dias: suspensão automática
- Sistemas DEVEM permitir extração de usuários/perfis (suporte à revisão anual)

### Ciclo de Vida
- Concessão: via ITSM com aprovação do gestor
- Desligamento: bloqueio IMEDIATO de todos os acessos
- Revisão: mínimo anual para sistemas críticos

---

## 5. Cofre de Senhas / PAM

### Senhas (SI_002 v3)
- Mínimo 16 caracteres, 3 de 4 tipos
- Histórico: bloquear últimas 9
- Bloqueio após 5 tentativas, desbloqueio após 10 min
- Troca a cada 60 dias
- Aviso de expiração 10 dias antes
- NUNCA armazenadas em texto claro

### Contas Privilegiadas
- Separar conta admin de conta comum
- NUNCA divulgar/emprestar senha privilegiada
- Credenciais de serviço: rotação automática via cofre

---

## 6. Gestão de Incidentes

- TODOS devem relatar eventos que comprometam CID
- Comunicar via Portal do Colaborador ou canais definidos
- NUNCA tomar ação própria — reportar à SI
- Contato: csirt@cogna.com.br

---

## 7. Gestão de Vulnerabilidades

- Scan periódico de vulnerabilidades
- SLAs de correção conforme CVSS (ver POWER.md)
- Testes de penetração regulares
- Monitoramento contínuo

---

## 8. Desenvolvimento Seguro (SSDLC)

- Segurança incorporada em todas as fases do ciclo de vida
- Threat modeling na fase de design
- Code review com foco em segurança
- Testes de segurança automatizados no CI/CD
- Scan de dependências obrigatório

---

## 9. Inteligência Artificial Segura (SI_005 v1)

### PROIBIDO
- Dados confidenciais/pessoais enviados a IA de terceiros
- Dados reais de clientes/alunos em prompts
- Código-fonte em IAs não aprovadas
- IA para fins pessoais em ativos da empresa

### PERMITIDO
- IAs homologadas pela VP de TI + SI
- Dados de teste (simulados)
- Revisar criticamente TODAS as saídas da IA

### Ao Integrar APIs de IA no Código
- Validar e sanitizar TODAS as respostas da IA (tratar como input não confiável)
- Rate limiting nas chamadas
- API keys via vault (nunca no código)
- Timeout max 30s
- Prompt injection prevention: sanitizar entrada, separar instruções de dados

---

## 10. Criptografia em Banco de Dados (SI_010 v1)

### Dados em Repouso
- AES-256 obrigatório para dados Internos/Restritos/Confidenciais
- Aplica-se a todos os bancos (SQL Server, MySQL, PostgreSQL, MongoDB, etc.)

### Dados em Trânsito
- TLS 1.2+ obrigatório em toda conexão aplicação-banco
- Parâmetros: sslmode=require (PG), Encrypt=True (SQL Server), tls=true (Mongo)

### Gerenciamento de Chaves
- Usar KMS/vault do cloud provider (AWS KMS, Azure Key Vault)
- Chaves segregadas por equipe
- Rotação automática
- Administração: SRE responsável

---

## 11. Segurança em Nuvem

- Princípio do menor privilégio em IAM
- MFA obrigatório para contas privilegiadas
- Criptografia em repouso e trânsito
- Logging e monitoramento habilitados
- Avaliação de segurança antes de adotar novo serviço cloud

---

## 12. Outras Políticas Aplicáveis

### Avaliação de Fornecedores
- Todo fornecedor de TI com acesso a dados: avaliação de SI obrigatória
- Cláusulas contratuais de segurança

### Uso de Ativos de TI
- Recursos computacionais apenas para fins profissionais
- Não instalar software não autorizado

### BYOD
- Dispositivos pessoais: seguir política de segurança
- Dados corporativos: apenas em apps/containers aprovados

### Segurança Física
- Acesso físico controlado a datacenters e áreas restritas
- Clean desk policy

---

## Referências
- Política de Segurança da Informação (SI_001 v07) - Grupo COGNA
- Política de Gestão de Acessos Lógicos (SI_004 v3)
- Procedimento de Uso de Senhas (SI_002 v3)
- Política de Criptografia em Banco de Dados (SI_010 v1)
- Política de Inteligência Artificial Segura (SI_005 v1)
- LGPD (Lei 13.709/2018)
- ISO 27001:2022, ISO 27002:2022, ISO 42001:2024
