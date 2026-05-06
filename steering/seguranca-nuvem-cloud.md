# Políticas de Segurança - Segurança em Nuvem (Grupo COGNA)

> Baseado na Política de Segurança em Nuvem (N1, v01) do Grupo COGNA

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Recurso de nuvem publicado diretamente na Internet (SSH, RDP, banco) → Usar bastion/VPN
- Dados em repouso sem criptografia AES-256 → Criptografar obrigatoriamente
- Conexão sem TLS 1.2+ → Habilitar TLS em toda comunicação
- Acesso a ambiente cloud sem MFA → MFA obrigatório para todos
- Ambientes dev/staging com acesso a produção → Segregar completamente
- Aplicação pública sem WAF → Publicar via WAF + proteção DDoS
- Backups sem criptografia → Criptografar e habilitar imutabilidade
- Provedor de nuvem sem avaliação de segurança → Avaliar antes de adotar

## Gerenciamento de Identidade em Cloud - OBRIGATÓRIO

- MFA obrigatório para TODOS os acessos a ambientes em nuvem
- Gestão de contas privilegiadas (root, domain admins): políticas rigorosas
- Revogação imediata de acessos desnecessários
- Monitoramento contínuo de atividades dos usuários
- Revisão e auditoria periódica de permissões
- Contas privilegiadas: expiração frequente, histórico extenso, bloqueio imediato

### Políticas de Senha para Cloud
- Senhas fortes e únicas (maiúsculas, minúsculas, números, especiais)
- Verificar contra bases de dados vazados
- Proibir reutilização de credenciais conhecidas
- Proibir senhas com informações previsíveis (nome, empresa, marcas)
- Auto-desbloqueio: tempo de espera superior a 30 minutos
- Contas privilegiadas: políticas ainda mais rigorosas

## Proteção de Dados em Cloud - OBRIGATÓRIO

### Criptografia
- Dados em repouso: AES-256 (mínimo)
- Dados em trânsito: TLS 1.2+ (preferencialmente TLS 1.3)
- Gestão de chaves: geração segura, armazenamento em KMS, rotação regular
- Monitoramento contínuo das práticas de criptografia

### LGPD em Cloud
- Minimização de dados (coletar apenas o necessário)
- Controle de acesso baseado no menor privilégio
- Gestão do ciclo de vida: eliminação ou anonimização ao término da finalidade

## Proteção de Infraestrutura - OBRIGATÓRIO

### Segregação de Ambientes
- Desenvolvimento, Homologação, Staging e Produção: SEM acesso entre si
- Cada ambiente com suas próprias credenciais e permissões
- Dados de produção NUNCA em ambientes inferiores (usar dados sintéticos)

### Exposição de Serviços
- Infraestrutura cloud NUNCA publicada diretamente na Internet
- Portas sensíveis (SSH 22, RDP 3389, DB 3306/5432/27017): acesso apenas via VPN/bastion
- Aplicações públicas: publicar via WAF (Web Application Firewall)
- Proteção contra DDoS obrigatória (AWS Shield, Azure DDoS Protection)

## Backups e Recuperação - OBRIGATÓRIO

- Cronograma regular: completos + incrementais + diferenciais
- Backups DEVEM ser criptografados
- Imutabilidade habilitada sempre que tecnicamente possível
- Testes de restore periódicos
- Armazenamento em região/conta separada

## Regras para Código em Cloud - OBRIGATÓRIO

### Terraform / IaC
- Security Groups: NUNCA 0.0.0.0/0 em portas sensíveis
- Recursos de banco: publicly_accessible = false, storage_encrypted = true
- S3/Buckets: block_public_access = true, encryption habilitada
- Outputs sensíveis: sensitive = true
- Credenciais: via secrets manager (NUNCA hardcoded)

### Kubernetes em Cloud
- Pods: runAsNonRoot, readOnlyRootFilesystem, drop ALL capabilities
- Imagens: digest (sha256), nunca :latest
- Secrets: via secretKeyRef ou external secrets operator
- NetworkPolicy: restringir comunicação entre namespaces
- Resource limits obrigatórios

### Aplicações em Cloud
- Conexões a serviços cloud: via SDK com credenciais do IAM role (não API keys)
- Logs: enviar para serviço centralizado (CloudWatch, Azure Monitor)
- Secrets: buscar de Secrets Manager/Key Vault em runtime
- Health checks e readiness probes configurados

## Monitoramento e Resposta a Incidentes em Cloud

### Monitoramento Contínuo
- Ferramentas automatizadas para análise de logs e eventos
- SIEM para agregação e correlação de dados de segurança
- Alertas claros, relevantes e acionáveis
- Auditorias periódicas do sistema de monitoramento

### Resposta a Incidentes Cloud
- Plano de resposta específico para eventos em nuvem
- Responsabilidades e procedimentos definidos
- Canais de comunicação estabelecidos
- Simulações e treinamentos regulares

## Avaliação de Provedores - OBRIGATÓRIO

Antes de adotar qualquer serviço em nuvem:
- Verificar certificações do provedor (SOC 2, ISO 27001)
- Avaliar mecanismos de controle de acesso
- Revisar relatórios de auditoria
- Avaliar planos de resposta a incidentes do provedor
- Verificar conformidade com LGPD/GDPR

## Boas Práticas para Usuários
- Manter dispositivos atualizados (patches, OS)
- Usar apenas conexões seguras (evitar Wi-Fi públicas)
- VPN para acessos em redes potencialmente inseguras
- Logout ao finalizar sessões em serviços cloud
- Reportar atividades suspeitas imediatamente

## Referências
- Política de Segurança em Nuvem (N1, v01) - Grupo COGNA
- NIST Cybersecurity Framework
- CIS Controls
- ISO 27001:2022
- LGPD (Lei 13.709/2018)
