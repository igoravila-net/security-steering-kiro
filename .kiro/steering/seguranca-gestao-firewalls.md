---
inclusion: manual
---

# Políticas de Segurança - Gestão de Firewalls (Grupo COGNA)

> Baseado na Política de Gestão de Firewalls (Nível N1, v01) do Grupo COGNA

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Security Group/regra com 0.0.0.0/0 em portas sensíveis → Restringir CIDRs
- Portas/serviços não utilizados abertos → Desativar
- Credenciais padrão de firewall/dispositivo → Alterar e adicionar MFA
- Regra de firewall sem justificativa/aprovação formal → Seguir processo de aprovação
- Logs de firewall desabilitados → Habilitar em todos os dispositivos
- Segmentação de rede ausente → Implementar zonas segmentadas
- Acesso administrativo sem MFA → MFA obrigatório

## Princípio Fundamental

**"Negar tudo, permitir apenas o necessário"** — toda regra de firewall deve conceder apenas o acesso mínimo necessário.

## Regras para Código e Infraestrutura - OBRIGATÓRIO

### Configuração de Security Groups / Network Policies

Ao criar regras de rede (Terraform, Kubernetes, AWS, Azure):
- Abrir APENAS portas necessárias para a aplicação
- NUNCA usar 0.0.0.0/0 para portas sensíveis (22, 3389, 3306, 5432, 27017, 6379)
- SSH/RDP: restringir a CIDRs de VPN/rede interna
- Documentar justificativa para cada regra
- Aplicar princípio do menor privilégio em cada regra

### Segmentação de Rede (Zonas)

| Zona | Criticidade | Controles |
|---|---|---|
| Pública (ZN_01) | Muito Baixo | Acesso web, bloqueio a servidores internos |
| Trabalho (ZN_02) | Baixo | ACLs para recursos internos, restrição a sistemas críticos |
| Desenvolvimento (ZN_03) | Médio | Acesso para devs, bloqueio de comunicação com produção |
| Produção (ZN_04) | Alta | MFA, acesso restrito a admins, monitoramento contínuo |
| Backup (ZN_05) | Crítica | Acesso apenas admins, janelas programadas |

### Regras por Zona no Código

- Desenvolvimento NÃO pode se comunicar diretamente com Produção
- Produção: acesso apenas com MFA e monitoramento
- Backup: acesso restrito a administradores autorizados
- Dados sensíveis: isolados em zonas específicas

### Processo Formal para Regras

Toda criação/alteração/remoção de regra de firewall DEVE seguir:
1. Solicitação formal com justificativa
2. Aprovação do gestor responsável
3. Validação pelo time de Segurança da Informação
4. Aprovação do responsável técnico
5. Documentação da regra (porta, protocolo, origem, destino, justificativa)
6. Revisão semestral de todas as regras

### Credenciais de Dispositivos
- Credenciais padrão de fornecedor: ALTERAR antes de produção
- MFA obrigatório para acesso administrativo a firewalls
- Acesso administrativo restrito a colaboradores autorizados

## Monitoramento e Logs - OBRIGATÓRIO

- Habilitar logs em TODOS os dispositivos de firewall (físicos e virtuais)
- Armazenar logs por no mínimo 90 dias
- Monitorar ativamente para identificar atividades suspeitas
- Integrar com SIEM para correlação de eventos
- Alertas 24x7 para anomalias e tentativas de acesso não autorizado
- Anomalias com potencial vazamento de dados: alerta imediato (LGPD)

## Manutenção e Atualização
- Patches de segurança: aplicar assim que disponíveis e validados
- Firmware: atualizar conforme cronograma definido
- Manutenção preventiva e corretiva conforme melhores práticas
- Descarte de dispositivos: remover TODAS as configurações sensíveis antes

## Resposta a Incidentes
- Equipe de resposta com acesso à documentação de redes e firewalls
- Procedimentos de bloqueio e contenção de zonas
- Revisão de ACLs no planejamento de resposta
- Simulações de ataques regulares
- Comunicação adequada aos responsáveis e Alta Direção quando relevante

## Gestão de Riscos
- Inventário atualizado de ativos protegidos pelos firewalls
- Análises de riscos e vulnerabilidades periódicas
- Testes de intrusão (pentest) anuais
- Análise de impacto para embasar regras e restrições

## ACLs em Switches e Roteadores
- Avaliar dispositivos que necessitam ACLs conforme inventário
- Restringir recursos críticos a usuários administrativos
- ACLs refletindo direitos de acesso necessários ao negócio
- Revisão semestral das ACLs
- Remoção imediata de acessos de colaboradores desvinculados
- Proteger dados sensíveis via ACLs restritivas

## Exceções
- Qualquer exceção (incluindo liberação de portas) requer:
  - Justificativa formal
  - Documentação detalhada
  - Avaliação de riscos conjunta (redes + segurança)
  - Aprovação do time de Segurança da Informação

## Referências
- Política de Gestão de Firewalls (N1, v01) - Grupo COGNA
- NIST Cybersecurity Framework (CSF)
- ISO/IEC 27001:2022
- CIS Controls
- LGPD (Lei 13.709)
- Política de Gestão de Incidentes - Grupo COGNA

