---
inclusion: manual
---

# Políticas de Segurança - Gestão de Acessos SAP (Grupo COGNA)

> Baseado no Procedimento de Gestão de Acessos SAP (SI-SAP02 v01) do Grupo COGNA

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Acesso SAP sem aprovação do gestor imediato + dono do perfil → Seguir fluxo GRC AC
- Usuário com conflito SoD sem aprovação de Controles Internos → Mitigar antes de provisionar
- Login SAP inativo 45+ dias sem expiração → Expirar automaticamente
- Login bloqueado na rede 35+ dias sem exclusão → Eliminar de todos os ambientes
- Acesso privilegiado SAP sem segregação de funções → Implementar SoD via GRC

## Ciclo de Vida do Acesso SAP

### Criação
1. Usuário abre chamado no ServiceNow
2. Premissas: login de rede + VPN já liberados
3. Cadastro obrigatório: Nome, Sobrenome, Email, CPF, Gestor Imediato
4. Ambientes que requerem aprovação do Gerente de Infra SAP: via MIM
5. Login criado com perfil básico
6. Perfis adicionais: solicitar via GRC AC (Fiori)

### Modificação (Perfis Adicionais)
Fluxo de aprovação em 3 estágios:
1. **Gestor Imediato** (1o estágio): revisa necessidade, verifica conflitos SoD
2. **Dono do Perfil** (2o estágio): avalia alinhamento com atividades
3. **Controles Internos** (3o estágio): analisa e mitiga riscos SoD

Se aprovado sem riscos → perfil provisionado automaticamente

### Inativação (Expiração)
- 45 dias sem acessar S4P → login expirado automaticamente
- Reativação: chamado no ServiceNow → SI SAP processa

### Bloqueio
- Automático quando login bloqueado na rede
- Colaborador desligado: RM → MIM → bloqueio
- Terceiro: término de contrato ou solicitação do gestor

### Exclusão
- 35 dias após bloqueio → grupos MIM removidos automaticamente
- Sincronização AD → Azure → SAP IPS → login eliminado em todos os ambientes

## Segregação de Funções (SoD) - OBRIGATÓRIO

- Toda solicitação analisada contra Matriz de Riscos SAP
- Conflitos SoD identificados pelo GRC AC automaticamente
- Riscos aprovados pelo Dono do Risco
- Controles compensatórios definidos com Controles Internos

## Regras para Código - OBRIGATÓRIO

### Integrações com SAP
- Toda integração DEVE usar conta de serviço dedicada
- Credenciais: via cofre PAM (nunca hardcoded)
- Permissões: mínimas para a tarefa
- Comunicação: TLS 1.2+ obrigatório
- Logar todas as chamadas para auditoria

### Desenvolvimento SAP
- DEV segregado de PROD (nunca transporte direto)
- Perfis de desenvolvedor: apenas em ambientes de desenvolvimento
- Credenciais de teste: NUNCA funcionar em produção
- Dados de produção: NUNCA em ambientes de desenvolvimento

### APIs e Serviços SAP
- Autenticação obrigatória em todas as APIs expostas
- Validar e sanitizar dados recebidos de/para SAP
- Rate limiting em integrações
- Timeout configurado (máx 30s para chamadas RFC/BAPI)

## Ambientes SAP

| Ambiente | Uso | Controle |
|---|---|---|
| S4P 400 (Produção) | Operação real | Acesso restrito, SoD, auditoria |
| S4Q 400 (Qualidade) | Testes | Aprovação Gerente Infra SAP |
| S4D 100/110/120 (Dev) | Desenvolvimento | Aprovação Gerente Infra SAP |
| Solution Manager | Gestão de mudanças | Aprovação Gerente Infra SAP |
| Portal de Ofertas | Portal comercial | Aprovação Gerente Infra SAP |

## Matriz de Responsabilidades

| Atividade | Responsável |
|---|---|
| Solicitar acesso inicial | Usuário final |
| Aprovar perfil (1o estágio) | Gestor Imediato |
| Aprovar perfil (2o estágio) | Dono do Perfil |
| Analisar riscos SoD (3o estágio) | Controles Internos |
| Aprovar controle compensatório | Dono de Risco |
| Informar desligamento colaborador | Capital Humano |
| Informar desligamento terceiro | Gestor Imediato |
| Reativar/desbloquear usuários | Segurança da Informação |

## Referências
- Procedimento de Gestão de Acessos SAP (SI-SAP02 v01) - Grupo COGNA
- Política de Gestão de Acessos Lógicos - Grupo COGNA
- ISO 27002
- NIST 800-53

