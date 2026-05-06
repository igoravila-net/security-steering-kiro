# Políticas de Segurança - Gestão de Incidentes de Segurança da Informação e Privacidade (Grupo COGNA)

> Baseado na Política de Gestão de Incidentes de Segurança da Informação e Privacidade (Segurança da Informação_004 v2) do Grupo COGNA

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Incidente de segurança não reportado → Reportar imediatamente via ITSM ou csirt@cogna.com.br
- Evidências de incidente destruídas/manipuladas → Preservar TODAS as evidências
- Vazamento de dados pessoais sem comunicação à ANPD → Comunicar em até 2 dias úteis
- Incidente P1/P2 sem relatório RISI → Preencher relatório obrigatório
- Logs insuficientes para investigação → Garantir logging adequado em todos os sistemas

## Classificação de Incidentes

### Tipos
- **Incidente de Segurança:** Evento adverso que compromete confidencialidade, integridade, disponibilidade ou conformidade
- **Incidente com Dados Pessoais:** Violação que resulte em destruição, perda, alteração, vazamento ou tratamento inadequado de dados pessoais
- **Vazamento de Dados:** Informações confidenciais tornadas públicas sem autorização

### Priorização (Urgência x Impacto x Criticidade)

| Prioridade | SLA | Critério |
|---|---|---|
| **P1 (Crítico)** | 4 horas corridas | Indisponibilidade de sistemas + toda BU + alto impacto |
| **P2 (Alto)** | 8 horas corridas | Combinações de alto impacto/urgência |
| **P3 (Médio)** | 48 horas úteis | Impacto limitado, baixa/média criticidade |

## Regras para Código - OBRIGATÓRIO

### Detecção (Logging para Investigação)
- Todo sistema DEVE gerar logs suficientes para investigação de incidentes
- Logs devem incluir: timestamp, usuário, ação, recurso acessado, IP de origem, resultado
- Logs de autenticação: registrar sucesso E falha
- Logs de acesso a dados pessoais: registrar TODAS as operações
- Retenção mínima de logs: conforme política (mín. 90 dias para firewall, 6 meses para acesso)
- NUNCA logar dados pessoais ou credenciais nos logs

### Contenção (Capacidade de Resposta no Código)
- Aplicações DEVEM suportar bloqueio de sessões/usuários em tempo real
- Implementar mecanismo de revogação de tokens/sessões
- Suportar isolamento de funcionalidades comprometidas (feature flags)
- Endpoints de health check para monitoramento de disponibilidade

### Preservação de Evidências
- Logs DEVEM ser imutáveis (append-only)
- Timestamps em UTC com precisão de milissegundos
- Correlação de eventos via request ID / trace ID
- Armazenar logs em local seguro e separado da aplicação

### Recuperação
- Aplicações DEVEM suportar rollback de alterações
- Backups testados e documentados
- Procedimento de restore validado periodicamente
- Suportar rotação de credenciais sem downtime

## Processo de Resposta a Incidentes

### 1. Detecção
- Monitoramento contínuo de segurança
- Colaboradores reportam comportamentos anômalos
- Agentes externos (mídia, denúncia, terceiros)
- Ferramentas automatizadas (SIEM, IDS/IPS)

### 2. Análise
- Segurança da Informação avalia e classifica
- Determina envolvimento de Privacidade
- Prioriza conforme matriz (P1/P2/P3)
- Para P1/P2: preencher relatório RISI

### 3. Contenção
- Ações imediatas para limitar impacto
- Isolamento de sistemas comprometidos
- Bloqueio de acessos suspeitos
- Preservação de evidências

### 4. Erradicação
- Identificação de causa-raiz
- Remoção da ameaça
- Correção de vulnerabilidades exploradas
- Verificação de ambiente interno vs terceiros

### 5. Recuperação
- Restauração de sistemas afetados
- Validação de integridade
- Monitoramento intensificado pós-incidente

### 6. Lições Aprendidas
- Documentação completa do incidente
- Revisão para evitar recorrência
- Atualização de controles e procedimentos
- Armazenamento seguro de toda documentação

## Comunicação em Incidentes com Dados Pessoais (LGPD)

### Quando Comunicar
- Incidente com dados pessoais que acarrete risco ou dano relevante aos titulares
- Avaliação: natureza, categoria, quantidade dos dados afetados

### Prazos
- Comunicação à ANPD: até 2 dias úteis após ciência do incidente
- Comunicação aos titulares: conforme orientação da ANPD

### Documentação Obrigatória
- Avaliação interna do incidente
- Medidas tomadas e análise de risco
- Formulário da ANPD preenchido

### Comitê de Crises
- Acionado para incidentes de alta criticidade
- Representantes: TI, SI, Privacidade, Compliance, Jurídico, RI, Marketing

## Regras de Implementação para Desenvolvedores

### Logging Adequado
- Formato estruturado (JSON) para facilitar análise
- Correlation ID em todas as requisições
- Separar logs de aplicação, acesso e segurança
- Integrar com SIEM corporativa

### Capacidade de Contenção
- Circuit breakers para isolamento
- Feature flags para desabilitar funcionalidades comprometidas
- Mecanismo de force-logout de todos os usuários
- API de revogação de tokens em massa

### Monitoramento
- Health checks em todos os serviços
- Alertas para padrões anômalos (muitas falhas de auth, picos de acesso)
- Métricas de segurança para monitoramento
- Integração com ferramentas de observabilidade

## Reporte de Incidentes
- Canal: ITSM (ServiceNow) ou csirt@cogna.com.br
- NUNCA omitir, manipular ou destruir informações de investigação
- Colaborar com equipe de resposta

## Referências
- Política de Gestão de Incidentes (Segurança da Informação_004 v2) - Grupo COGNA
- Procedimento de Respostas a Incidentes de Segurança da Informação
- LGPD (Lei 13.709/2018, Art. 48)
- ISO 27002:2013
- NIST 800-53
