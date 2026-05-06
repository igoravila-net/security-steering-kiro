---
inclusion: fileMatch
fileMatchPattern: "**/*.tf,**/*.tfvars,**/Dockerfile,**/docker-compose*.yml,**/docker-compose*.yaml,**/k8s/*,**/kubernetes/*,**/helm/*,**/*deployment*,**/*networkpolicy*"
---

# Regras de Segurança para Infraestrutura como Código

> Ativado automaticamente ao editar Terraform, Docker, Kubernetes ou Helm.

## OBRIGATÓRIO neste contexto

### Terraform
- Security Groups: NUNCA 0.0.0.0/0 em portas sensíveis
- RDS/Banco: publicly_accessible=false, storage_encrypted=true
- S3/Storage: block_public_access=true, encryption habilitada
- Outputs sensíveis: sensitive=true
- Credenciais: via secrets manager (NUNCA hardcoded)
- deletion_protection=true em produção

### Docker
- USER não-root obrigatório
- Multi-stage build
- Imagem base mínima (alpine, distroless)
- HEALTHCHECK configurado
- Nenhum segredo na imagem
- Tag específica (NUNCA :latest)

### Kubernetes
- runAsNonRoot: true
- allowPrivilegeEscalation: false
- readOnlyRootFilesystem: true
- capabilities: drop ALL
- Resource limits obrigatórios
- Imagens com digest (sha256)
- Secrets via secretKeyRef
- NetworkPolicy aplicada

### Docker Compose
- user: UID:GID não-root
- read_only: true
- security_opt: no-new-privileges
- cap_drop: ALL
- deploy.resources.limits definidos
- ports: bind em 127.0.0.1 quando possível
