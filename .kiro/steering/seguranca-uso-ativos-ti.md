# Políticas de Segurança - Uso Seguro de Ativos de TI (Grupo COGNA)

> Baseado na Política de Uso Seguro de Ativos de TI (Segurança da Informação_008 v3) do Grupo COGNA

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Instalação de software não homologado → Apenas software aprovado por Arquitetura/SI
- Estação sem bloqueio automático (máx 5 min) → Configurar timeout obrigatório
- Arquivos corporativos armazenados localmente sem backup → Usar SharePoint/OneDrive
- Recurso pessoal conectado à rede interna sem autorização → PROIBIDO
- Compartilhamento de diretórios de estação de trabalho → PROIBIDO
- Informações classificadas divulgadas na internet → PROIBIDO
- Tentativa de acesso não autorizado a sistemas → PROIBIDO

## Regras Gerais - OBRIGATÓRIO

### Propriedade e Controle
- Todos os recursos de TI são propriedade exclusiva do Grupo COGNA
- Sujeitos a controle, vigilância e auditoria a qualquer momento sem aviso prévio
- Devolver todos os ativos ao término da relação de trabalho

### Estação de Trabalho
- Bloquear ao ausentar-se (mesmo brevemente)
- Bloqueio automático: máximo 5 minutos de inatividade
- Armazenar informações no SharePoint (não localmente)
- Antivírus atualizado obrigatório
- Patches de segurança instalados
- Software de gerenciamento de estações ativo
- Instalação/remoção de software: apenas TI Field Service via ITSM
- Dispositivos pessoais: NÃO conectar à rede interna sem autorização de SI

### Mídias Removíveis
- Preferir OneDrive/SharePoint sobre mídias removíveis
- Gravação em mídia removível: extrema cautela, apenas contexto profissional
- NUNCA entregar mídia com dados corporativos a terceiros
- Acesso à informação não confere direitos sobre ela

### Descarte de Ativos
- Sanitização completa antes de transferir/descartar
- Descarte seguro para informação sensível
- Seguir procedimento IT_Operations_PR_01

## Regras para Código - OBRIGATÓRIO

### Aplicações e Sistemas
- Implementar timeout de sessão (máx 5 min para estações, 30 min para web)
- Logs de todas as operações e acessos (auditáveis a qualquer momento)
- Controle de execução de arquivos (whitelist de software)
- Não permitir compartilhamento de diretórios entre estações

### E-mail e Comunicação
- Filtros anti-spam e anti-vírus obrigatórios
- Controle de anexos (tipo e tamanho)
- Backup de mensagens em servidores
- Prestadores: conta de e-mail apenas quando estritamente necessário

### Internet e Navegação
- Filtros de controle de conteúdo ativos
- Bloqueio de downloads de arquivos maliciosos
- Auditoria de acessos
- PROIBIDO divulgar informações internas/restritas/confidenciais na internet

### Acesso Remoto
- Apenas usuários formalmente autorizados
- Canal criptografado obrigatório (VPN)
- Autenticação mínima: conta + senha (preferencialmente MFA)

### Proteção de Informação
- Toda informação corporativa: protegida contra criação/alteração/acesso/destruição indevida
- Apenas recursos corporativos para manipular informações corporativas
- Termo de Confidencialidade assinado por todos

## Proibições Explícitas
- Tentar obter acesso não autorizado a outros sistemas
- Burlar sistemas de segurança
- Acessar informações restritas sem autorização
- Vigiar secretamente outra pessoa via dispositivos/softwares
- Interromper serviços, servidores ou redes (ataques DoS)
- Instalar software sem licença ou não homologado
- Copiar software da Cogna para dispositivos pessoais
- Armazenar arquivos pessoais em máquina corporativa
- Abrir arquivos/links de origem desconhecida em e-mails
- Enviar e-mails com conteúdo não profissional
- Acessar conteúdo obsceno, ilegal ou ofensivo
- Publicar conteúdo ofensivo à Cogna em redes sociais

## Referências
- Política de Uso Seguro de Ativos de TI (Segurança da Informação_008 v3) - Grupo COGNA
- Política de Segurança da Informação - Grupo COGNA
- Política de Classificação da Informação - Grupo COGNA
- ISO 27002:2013
- NIST CSF
