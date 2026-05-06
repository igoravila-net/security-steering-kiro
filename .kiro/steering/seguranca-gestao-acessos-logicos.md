# Políticas de Segurança - Gestão de Acessos Lógicos (Grupo COGNA)

> Baseado na Política de Gestão de Acessos Lógicos (Segurança da Informação_004 v3) do Grupo COGNA

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Conta genérica/compartilhada sem aprovação de SI → Usar contas nominais individuais
- Credencial privilegiada usada para atividades do dia a dia → Separar conta admin de conta comum
- Acesso sem aprovação formal (gestor + dono do sistema) → Solicitar via ITSM
- Conta inativa há 60+ dias sem suspensão → Suspender automaticamente
- Perfis de acesso sem revisão anual → Revisar no mínimo anualmente
- Senha de admin compartilhada ou divulgada → PROIBIDO, usar cofre PAM
- Acesso privilegiado sem segregação de funções → Implementar SoD

## Princípios de Acesso - OBRIGATÓRIO

### Menor Privilégio
- Conceder APENAS permissões mínimas necessárias para a função
- Acesso baseado em necessidade comprovada (need-to-know)
- Privilégios elevados apenas quando estritamente necessário

### Segregação de Funções (SoD)
- Nenhum usuário deve acumular atividades conflitantes
- Quem aprova não executa, quem desenvolve não faz deploy em produção
- Separar: criação, aprovação, execução e auditoria

### Identificação Individual
- Toda ação DEVE ser rastreável a um indivíduo específico
- Contas genéricas PROIBIDAS (exceto: contas de serviço, monitoração, uso público aprovado por SI)
- Cada pessoa = uma conta nominal única

## Tipos de Conta

| Tipo | Uso | Controles |
|---|---|---|
| Conta comum | Atividades diárias sem privilégio | Nominal, senha pessoal |
| Conta privilegiada/admin | Configuração, gestão de sistemas | Cofre PAM, MFA, aprovação SI + gestor + dono app |
| Conta de serviço | Integração entre sistemas, jobs | Cofre PAM, sem logon interativo, permissões limitadas |

## Regras para Código - OBRIGATÓRIO

### Autenticação e Autorização em Aplicações
- Todo sistema DEVE implementar controle de acesso baseado em perfis (RBAC)
- Perfis de acesso definidos pelo dono do sistema/PO
- Verificar autorização em CADA endpoint/operação
- Nunca confiar apenas em autenticação — verificar permissão específica

### Contas de Serviço no Código
- Cada aplicação/serviço DEVE ter sua própria conta de serviço
- Credenciais de serviço NUNCA no código-fonte → Cofre PAM
- Permissões da conta de serviço: mínimas para a tarefa
- Rotação automática de credenciais

### Contas Privilegiadas para Desenvolvedores
- Desenvolvedores com acesso admin: usar conta privilegiada SEPARADA da conta comum
- Conta privilegiada apenas em estações permitidas
- NUNCA divulgar, informar ou emprestar senha privilegiada
- Senha de admin é restrita e confidencial à equipe técnica específica

### Auditoria de Acesso
- Todo acesso a informação DEVE ser registrado em trilha de auditoria
- Logs devem permitir identificar: quem, quando, o quê, de onde
- Sistemas críticos: logs detalhados obrigatórios

## Ciclo de Vida do Acesso

### Concessão
- Solicitação formal via ITSM (ServiceNow)
- Aprovação do gestor imediato
- Para acesso privilegiado: aprovação adicional do dono da aplicação + Segurança da Informação
- Princípio do menor privilégio aplicado

### Alteração
- Mudança de função/área: revisar e ajustar perfis
- Solicitar via ITSM com aprovação do novo gestor
- Revogar acessos da função anterior

### Revisão
- Mínimo anual para sistemas críticos
- Sob demanda dos líderes ou donos de sistemas
- Segurança da Informação suporta o processo
- Identificar e remover acessos desnecessários

### Revogação/Cancelamento
- Desligamento: bloqueio IMEDIATO de todos os acessos
- Gestor deve contatar SI e RH imediatamente
- Contas inativas por 60+ dias: suspensão automática

## Regras de Implementação no Código

### Perfis e Roles
- Implementar RBAC com perfis granulares
- Cada funcionalidade mapeada para uma permissão específica
- Perfis agrupam permissões por função de negócio
- Verificar permissão em CADA operação, não apenas no login

### Sessões e Timeout
- Sessões inativas: timeout configurado (máx 30 min para sistemas críticos)
- Forçar re-autenticação para operações sensíveis
- Invalidar sessão no logout (server-side)

### Logs de Acesso
- Registrar: login, logout, falhas de autenticação, mudanças de permissão
- Registrar: acesso a dados classificados como Restrito ou Confidencial
- NUNCA logar credenciais ou dados pessoais nos logs de acesso

## Revisão de Acessos Lógicos - OBRIGATÓRIO

> Baseado no Procedimento de Revisão de Acessos Lógicos em Sistemas Corporativos (Segurança da Informação_003 v2) do Grupo COGNA

### Periodicidade
- Revisão mínima: 1 vez ao ano para sistemas críticos
- Envolvimento: Segurança da Informação + Controles Internos + áreas de negócio
- Escopo definido por Compliance e Controles Internos

### Processo de Revisão

| Etapa | Responsável | Ação |
|---|---|---|
| 1. Extração | Administrador do sistema | Extrair usuários ativos e perfis de acesso |
| 2. Envio | Administrador do sistema | Enviar lista para dono do perfil (PO) revisar |
| 3. Revisão | Dono do perfil (PO) | Indicar manter ou remover cada acesso |
| 4. Execução | Administrador do sistema | Aplicar alterações solicitadas |
| 5. Validação | Administrador do sistema | Nova extração para evidenciar conclusão |

### Regras da Revisão
- Dono do perfil NÃO pode revisar seu próprio acesso (superior imediato revisa)
- Quantidade de usuários revisados DEVE coincidir com quantidade enviada
- Toda extração evidenciada (prints de query + quantidade de retornos)
- Toda solicitação registrada na ferramenta de ITSM (ServiceNow)
- Alterações de perfil: registrar demanda no ITSM para rastreabilidade

### Regras para Código (Suporte à Revisão)
- Sistemas DEVEM permitir extração de usuários ativos e seus perfis
- Sistemas DEVEM suportar desativação/remoção de acessos em massa
- Implementar relatório de usuários por perfil (exportável)
- Implementar log de alterações de permissão (quem alterou, quando, o quê)
- Suportar integração com Active Directory (LDAP) quando aplicável
- Contas inativas por 60+ dias: suspensão automática

### Exceções na Revisão
- Incapacidade sistêmica ou operacional: avaliar com Controles Internos + SI
- Solução proposta deve ser aprovada e formalizada por ambos os times

## Exceções Gerais
- Qualquer exceção DEVE ser avaliada e aprovada pela Segurança da Informação
- Documentar justificativa, prazo e controles compensatórios
- Revisar exceções periodicamente

## Referências
- Política de Gestão de Acessos Lógicos (Segurança da Informação_004 v3) - Grupo COGNA
- Procedimento de Revisão de Acessos Lógicos em Sistemas Corporativos (v2) - Grupo COGNA
- Procedimento de Uso de Senhas - Grupo COGNA
- ISO 27002:2013
- NIST 800-53
