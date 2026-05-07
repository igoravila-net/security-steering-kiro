---
inclusion: manual
---

# Políticas de Segurança - Política Geral de Segurança da Informação (Grupo COGNA)

> Baseado na Política de Segurança da Informação (SI_001 v07) do Grupo COGNA

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Informação da empresa tratada como pessoal → Toda informação é propriedade intelectual do Grupo COGNA
- Incidente de segurança não reportado → Comunicar imediatamente à SI
- Recurso computacional usado para fins não autorizados → Uso compatível com atividades profissionais
- Terceiro sem avaliação de SI acessando ambiente → Avaliação obrigatória antes de produção
- Ação própria sobre evento de segurança sem comunicar SI → PROIBIDO, reportar à área de SI

## Princípios Fundamentais (CID)

| Princípio | Definição | Regra |
|---|---|---|
| **Confidencialidade** | Somente pessoas autorizadas acessam a informação | Controle de acesso em todo sistema |
| **Integridade** | Informação íntegra, verdadeira e completa | Validação de dados, auditoria |
| **Disponibilidade** | Informação disponível para autorizados quando necessário | Redundância, backups, monitoramento |

## Regras Gerais - OBRIGATÓRIO

### Propriedade da Informação
- TODA informação gerada, adquirida, utilizada ou armazenada pelo Grupo COGNA é propriedade intelectual da empresa
- Deve ser protegida conforme classificação (Pública, Interna, Restrita, Confidencial)
- Uso compatível com ética, confidencialidade e finalidade das atividades

### Gestão de Riscos
- Riscos identificados por processo de análise de vulnerabilidades, ameaças e impactos
- Avaliação nos aspectos de Confidencialidade, Integridade e Disponibilidade
- Todos os riscos reportados à SI para análise e tratamento
- Metodologia de riscos cibernéticos aprovada pela Alta Administração

### Gestão de Incidentes
- TODOS os usuários devem relatar eventos que comprometam CID
- Nenhum usuário deve tomar ação própria sobre eventos de segurança
- Comunicar via Portal do Colaborador ou canais definidos
- Áreas de Controles Internos, Auditoria e Compliance informadas periodicamente

### Gestão de Terceiros
- Contratação de terceiros que processem/armazenem informações: avaliação de SI obrigatória
- Gestor contratante deve envolver SI antes do ambiente de produção
- Monitoramento periódico da avaliação de terceiros
- Cláusulas contratuais sobre Política de SI obrigatórias

## Regras para Código - OBRIGATÓRIO

### Proteção de Ativos de Informação
- Todo sistema DEVE implementar controles de CID
- Confidencialidade: autenticação + autorização + criptografia
- Integridade: validação de dados + checksums + auditoria
- Disponibilidade: health checks + redundância + graceful degradation

### Avaliação de Segurança
- Toda nova tecnologia/sistema DEVE ser avaliada pela SI antes de implementação
- Aquisição de software/hardware: acionar SI via Suprimentos
- Terceiros com acesso a dados: avaliação de riscos obrigatória

### Treinamento e Conscientização
- Desenvolvedores devem realizar treinamento de SI ao ingressar
- Conhecer e seguir esta política e suas derivadas
- Reportar vulnerabilidades e incidentes identificados

## Conformidade e Penalidades

### Para Código e Sistemas
- Não-conformidade pode resultar em:
  - Bloqueio de deploy
  - Revisão obrigatória pelo time de AppSec
  - Escalação para Diretoria de SI

### Para Colaboradores
- Tratamento justo com medidas proporcionais
- Responsabilidade civil e criminal na extensão da lei
- Possível rescisão contratual
- Sanções conforme Código de Conduta

## Documentos Derivados (Steerings Relacionados)

Esta política é a base para todos os demais steerings de segurança:
- Classificação das Informações
- Desenvolvimento Seguro / SSDLC
- Gestão de Acessos Lógicos
- Gestão de Incidentes
- Gestão de Vulnerabilidades
- Cofre de Senhas / PAM
- Criptografia em Banco de Dados
- Gestão de Firewalls
- Inteligência Artificial Segura

## Referências
- Política de Segurança da Informação (SI_001 v07) - Grupo COGNA
- ISO 27002:2013
- NIST CSF
- Política Nacional de Segurança da Informação
- Código de Conduta do Grupo Cogna

