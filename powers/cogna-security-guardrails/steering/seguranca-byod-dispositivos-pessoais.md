# Políticas de Segurança - BYOD e Dispositivos Pessoais (Grupo COGNA)

> Baseado na Política de Uso de Dispositivos Pessoais - BYOD (SI_003 v03) do Grupo COGNA

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Dados sensíveis/confidenciais armazenados localmente em dispositivo pessoal → Armazenar no Office 365
- Dispositivo pessoal sem senha/bloqueio de tela → Configurar bloqueio automático (2 min)
- Acesso a dados corporativos sem VPN em notebook pessoal → VPN obrigatória
- Dispositivo com jailbreak/root acessando dados corporativos → PROIBIDO
- Sem segundo fator de autenticação para acesso a dados da Cogna → MFA obrigatório
- Roubo/furto/perda não comunicado → Comunicar Service Desk imediatamente

## Regras de Uso - OBRIGATÓRIO

### Proibições
- PROIBIDO armazenar informações sensíveis da Cogna em dispositivo pessoal
- PROIBIDO usar dispositivos com sistema operacional modificado (jailbreak/root)
- PROIBIDO usar e-mail corporativo para fins pessoais
- PROIBIDO copiar/sincronizar informações corporativas diretamente no dispositivo

### Obrigações do Usuário
- Bloqueio de tela automático após 2 minutos de inatividade
- Senha segura conforme Procedimento de Senha Segura
- Antivírus instalado e atualizado
- Correções de segurança do fabricante aplicadas
- VPN para acesso via notebook pessoal
- MFA (segundo fator) para acesso a dados corporativos
- Armazenar dados corporativos apenas no Office 365
- Criptografia quando possível (conforme classificação da informação)
- Habilitar monitoramento remoto e bloqueio (quando disponível pelo fabricante)

## Regras para Código - OBRIGATÓRIO

### Aplicações Acessadas por Dispositivos Pessoais
- Implementar MFA obrigatório para acesso
- Não permitir cache/armazenamento local de dados sensíveis
- Implementar timeout de sessão (máx 30 min de inatividade)
- Suportar wipe remoto de dados corporativos
- Separar dados corporativos de dados pessoais (containerização)
- Validar integridade do dispositivo (detectar jailbreak/root)

### APIs e Serviços Acessados por BYOD
- Autenticação via OAuth2/OIDC com MFA
- Tokens com TTL curto (máx 15 min)
- Não armazenar tokens em storage inseguro do dispositivo
- Implementar device trust verification quando possível
- Rate limiting por dispositivo

### Dados em Aplicações Mobile
- Dados classificados como Restrito/Confidencial: NUNCA em cache local
- Usar armazenamento seguro do SO (Keychain iOS, EncryptedSharedPreferences Android)
- Limpar dados ao logout
- Suportar wipe remoto via MDM

## Roubo, Furto ou Perda

### Procedimento
1. Colaborador comunica Service Desk imediatamente
2. Service Desk executa wipe remoto dos dados corporativos
3. Colaborador bloqueia dispositivo junto à operadora
4. Comunicar csirt@cogna.com.br
5. Novo dispositivo: seguir todo processo novamente

### Para Aplicações (regra de código)
- Implementar endpoint de revogação de sessão/token por dispositivo
- Suportar invalidação remota de todas as sessões do usuário
- Logar device ID para rastreabilidade

## Desligamento do Colaborador
- Wipe remoto de dados corporativos em até 24 horas (sem aviso prévio)
- Chips corporativos: bloqueio imediato
- Revogação de todos os acessos e tokens

## Monitoramento
- Cogna pode monitorar APENAS dados corporativos (não pessoais)
- Pode bloquear acesso a rede/sistemas em caso de atividade suspeita
- Privacidade do usuário preservada (sem acesso a dados pessoais)

## Referências
- Política de Uso de Dispositivos Pessoais - BYOD (SI_003 v03) - Grupo COGNA
- Política de Segurança da Informação - Grupo COGNA
- Política de Classificação da Informação - Grupo COGNA
- ISO 27002:2013
- NIST CSF
- LGPD (Lei 13.709/2018)
