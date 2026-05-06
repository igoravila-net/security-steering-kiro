# Políticas de Segurança - Classificação, Manuseio e Descarte de Informações (Grupo COGNA)

> Baseado no Procedimento de Classificação e Manuseio de Informações (Segurança da Informação_001 v2) do Grupo COGNA

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Informação Confidencial/Restrita armazenada em nuvem pessoal → PROIBIDO (usar SharePoint corporativo)
- Informação Confidencial em pen drive → PROIBIDO
- Documentos sensíveis sem descarte seguro → Triturar/deletar permanentemente
- Informação compartilhada com pessoa não autorizada → Manter sigilo conforme classificação
- Dados pessoais retidos além da finalidade → Excluir ao término do prazo
- Diretório com dados Confidenciais/Restritos sem restrição de acesso → Obrigatório restringir

## Manuseio por Nível de Classificação

| Situação | Confidencial | Restrito | Interno | Público |
|---|---|---|---|---|
| Deixar em impressora | PROIBIDO | PROIBIDO | Não recomendado | — |
| Armazenar em pen drive | PROIBIDO | Não recomendado | Não recomendado | — |
| Deixar em veículo/ambiente externo | PROIBIDO | PROIBIDO | Não recomendado | — |
| Deixar sobre mesa sem monitoramento | PROIBIDO | Não recomendado | — | — |
| Senha para abertura de documento | Recomendado | Recomendado | — | — |
| Restrição de acesso ao diretório | OBRIGATÓRIO | OBRIGATÓRIO | Recomendado | — |
| Comentar em espaços públicos/família | PROIBIDO | PROIBIDO | Não recomendado | — |
| Armazenar em nuvem pessoal | PROIBIDO | PROIBIDO | PROIBIDO | — |

## Regras para Código - OBRIGATÓRIO

### Armazenamento de Dados por Classificação
- Dados Confidenciais/Restritos: APENAS em repositórios corporativos com controle de acesso
- NUNCA armazenar em serviços pessoais ou não homologados
- Restrição de acesso: OBRIGATÓRIO para Confidencial e Restrito
- Criptografia: OBRIGATÓRIA para Confidencial e Restrito em repouso

### Transporte de Informações
- Manter sigilo do conteúdo e nível de classificação
- Criptografia obrigatória para Confidencial e Restrito em trânsito
- Autorização do responsável necessária para transporte

### Classificação de Dados no Código

**PÚBLICO:** Material de divulgação aprovado, dados anonimizados

**INTERNO:** Materiais de treinamento, dados profissionais (nome, email corporativo, ramal)

**RESTRITO:** Dados pessoais de clientes (exceto sensíveis), CPF, RG, endereço, contratos

**CONFIDENCIAL:** Dados sensíveis (saúde, biometria), dados financeiros de clientes, dados de menores, estratégias, auditorias

## Descarte de Informações - OBRIGATÓRIO

| Nível | Eletrônico | Físico | Hardware |
|---|---|---|---|
| Confidencial | Deleção permanente (irrecuperável) | Triturador | Desmagnetizar |
| Restrito | Deleção permanente (irrecuperável) | Triturador | Desmagnetizar |
| Interno | Deletar | Triturador recomendado | Formatação |
| Público | Sem restrições | Sem restrições | Sem restrições |

### Regras de Descarte no Código
- Dados pessoais: excluir após atingir finalidade (LGPD)
- Garantir período de retenção definido
- Exclusão em TODOS os ambientes (produção, homologação, backups)
- Implementar mecanismo de exclusão/anonimização automatizado
- Logs de descarte para auditoria

## Sanitização de Dispositivos de TI - OBRIGATÓRIO

> Baseado no Procedimento de Descarte e Remoção de Dados (SI-1 v1) do Grupo COGNA

### Cenários de Remoção de Dados

| Cenário | Método |
|---|---|
| Permanência interna (reutilização) | Formatação de todas as partições; se Confidencial, usar ferramenta de sanitização definida por I&O/SI |
| Sucateamento | Destruição física do dispositivo de armazenamento |
| Venda ou doação | Ferramenta de sanitização definida por I&O/SI |
| Cloud/fornecedores externos | Contrato deve exigir remoção total; fornecedor demonstra método |

### Regras de Sanitização
- Toda mídia DEVE ser sanitizada quando não mais necessária para uso operacional
- Respeitar período de guarda ANTES de sanitizar
- Equipamentos criptografados: avaliar antes de decidir sobre processo padrão
- Registro obrigatório de toda remoção/destruição (Formulário de Remoção de Dados)
- Formulário: dados do usuário, dados do dispositivo, processo executado, data, evidências

### Regras para Código (Descarte em Sistemas)
- Implementar exclusão definitiva para dados com prazo expirado
- Garantir exclusão em TODOS os ambientes (prod, staging, backups)
- Contratos com fornecedores cloud: cláusula de remoção e transferência total
- Logs de descarte imutáveis para auditoria
- Respeitar temporalidade de guarda antes de excluir

### Fornecedores Cloud e Serviços Externos
- Contrato DEVE estabelecer requisitos de remoção e transferência de dados
- Fornecedor DEVE demonstrar que remoção foi feita por método aprovado
- Supervisão adequada para descartes realizados por terceiros

## Impacto da Não Observância
- Vazamento de informações a pessoas não autorizadas
- Perdas financeiras
- Penalidades jurídicas (Art. 52 da LGPD)

## Referências
- Procedimento de Classificação e Manuseio de Informações (v2) - Grupo COGNA
- Procedimento de Descarte e Remoção de Dados (SI-1 v1) - Grupo COGNA
- Política de Classificação das Informações - Grupo COGNA
- LGPD (Lei 13.709/2018)
- ISO/IEC 27000
- NIST CSF
