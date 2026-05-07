---
inclusion: manual
---

# Políticas de Segurança - Segurança Física e do Ambiente (Grupo COGNA)

> Baseado na Política de Segurança Física e do Ambiente (Segurança da Informação_006 v03) do Grupo COGNA

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Acesso a área sensível (datacenter, CPD) sem autorização → Acesso apenas com aprovação prévia
- Equipamento sem proteção física adequada → Proteger contra perda, furto e dano
- Informação confidencial visível/audível externamente → Proteger contra exposição
- Gravação não autorizada em áreas seguras → PROIBIDO sem autorização
- Documentos confidenciais abandonados em impressoras/mesas → Mesa limpa obrigatória
- Tela desbloqueada sem supervisão → Tela limpa obrigatória

## Classificação de Áreas

| Tipo | Exemplos | Controle de Acesso |
|---|---|---|
| Áreas Comuns | Recepção, lobby, salas de reunião | Livre para colaboradores, controlado para visitantes |
| Áreas Sensíveis | CPD, Datacenter, salas técnicas, IDF | Apenas pessoal autorizado com aprovação prévia de TI |

## Regras para Código e Infraestrutura - OBRIGATÓRIO

### Segurança de Datacenters e Ambientes Críticos
- Acesso físico controlado por crachá + biometria + autorização prévia
- Trilha de auditoria de todos os acessos
- Localização que minimize riscos de desastres naturais
- Proteção contra incêndio, enchente, explosão
- Monitoramento por câmeras

### Equipamentos e Ativos de TI
- Proteção contra acesso não autorizado, perda, dano e furto
- Retirada de ativos: registrar na ferramenta de ITSM
- Roubo/furto/perda: registrar B.O. + comunicar csirt@cogna.com.br
- Devolução obrigatória ao término da relação de trabalho

### Segurança em Camadas
- Combinar múltiplas medidas (física + lógica + administrativa)
- Perímetro → Edifício → Andar → Sala → Rack → Equipamento

## Mesa Limpa e Tela Limpa - OBRIGATÓRIO

### Mesa Limpa
- Informações confidenciais/restritas em papel: guardar em cofre/armário quando não em uso
- Trancar armários e gavetas com documentos sensíveis
- Remover documentos de impressoras imediatamente
- Não deixar anotações com informações sensíveis expostas

### Tela Limpa
- Computadores/terminais: travamento de tela quando sem supervisão
- Mecanismos de autenticação para desbloqueio
- Timeout automático de tela (máx 5 minutos de inatividade)
- Logout ao finalizar sessão

## Regras para Desenvolvimento - OBRIGATÓRIO

### Aplicações com Dados Sensíveis
- Implementar timeout de sessão por inatividade
- Forçar re-autenticação para operações críticas
- Não exibir dados confidenciais em tela sem necessidade (mascarar por padrão)
- Implementar controle de acesso baseado em localização quando aplicável

### Logs de Acesso Físico
- Sistemas de controle de acesso DEVEM gerar logs auditáveis
- Integrar com SIEM quando possível
- Reter logs conforme política de retenção

### Proteção de Informações em Tela
- Não exibir dados Restrito/Confidencial em áreas públicas
- Implementar funcionalidade de ocultar dados sensíveis (toggle de visibilidade)
- Considerar proteção contra shoulder surfing em aplicações mobile

## Áreas Seguras - Regras
- Acesso apenas ao necessário para as atividades (need-to-know)
- Trabalho não supervisionado de terceiros: evitar
- Gravação (foto, vídeo, áudio): PROIBIDA sem autorização

## Referências
- Política de Segurança Física e do Ambiente (Segurança da Informação_006 v03) - Grupo COGNA
- Política de Gestão de Ativos - Grupo COGNA
- ISO 27002:2013
- NIST CSF (800-53)

