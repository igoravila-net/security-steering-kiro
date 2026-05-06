# Políticas de Segurança - Infrastructure as Code (IaC) e Compliance

> Baseado em: [OWASP IaC Security](https://cheatsheetseries.owasp.org/cheatsheets/Infrastructure_as_Code_Security_Cheat_Sheet.html), [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks)

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Segredos em plaintext em arquivos IaC → Usar referências a vault/secrets manager
- Security groups com 0.0.0.0/0 em portas sensíveis → Restringir CIDRs
- Containers rodando como root → Usar runAsNonRoot
- Recursos sem criptografia habilitada → Habilitar encryption at rest
- Buckets/storage público → Bloquear acesso público por padrão
- Sem logging/auditoria habilitado → Habilitar CloudTrail/audit logs
- Imagens Docker com tag :latest → Usar tags imutáveis com digest

## Terraform (HCL) - Regras

- Security Groups: apenas portas necessárias, SSH restrito a VPN
- RDS: storage_encrypted=true, publicly_accessible=false, deletion_protection=true
- S3: block_public_acls=true, server_side_encryption habilitado
- Outputs sensíveis: sensitive=true obrigatório
- Segredos: sempre via data source de secrets manager

## Kubernetes - Regras

- securityContext: runAsNonRoot=true, allowPrivilegeEscalation=false
- capabilities: drop ALL
- readOnlyRootFilesystem: true
- Resources: limits obrigatórios (memory e cpu)
- Imagens: usar digest (sha256), nunca :latest
- Secrets: via secretKeyRef, nunca em env value direto
- NetworkPolicy: aplicar em todos os namespaces
- automountServiceAccountToken: false (exceto quando necessário)

## Docker - Regras

- Multi-stage builds (sem ferramentas de build na imagem final)
- USER não-root obrigatório
- Imagens base mínimas (alpine, distroless)
- HEALTHCHECK configurado
- Nenhum segredo na imagem (usar secrets em runtime)
- Scan de vulnerabilidades obrigatório (Trivy)

## Docker Compose - Regras

- user: definir UID:GID não-root
- read_only: true
- security_opt: no-new-privileges:true
- cap_drop: ALL
- deploy.resources.limits: definir memory e cpus
- ports: bind em 127.0.0.1 quando possível (não 0.0.0.0)
- secrets: usar Docker secrets (não env vars com valores)

## Checklist CIS Benchmark

### AWS
- [ ] CloudTrail habilitado em todas as regiões
- [ ] S3 com acesso público bloqueado
- [ ] RDS com criptografia e sem acesso público
- [ ] Security Groups sem 0.0.0.0/0 em portas 22, 3389, 3306, 5432
- [ ] IAM com MFA obrigatório
- [ ] VPC Flow Logs habilitados
- [ ] KMS para criptografia em repouso

### Kubernetes
- [ ] Pod Security Standards (Restricted)
- [ ] RBAC configurado (sem cluster-admin para workloads)
- [ ] Network Policies aplicadas
- [ ] Secrets criptografados em repouso
- [ ] Imagens apenas de registries confiáveis
- [ ] Resource limits em todos os containers

### Docker
- [ ] Imagens base mínimas
- [ ] Multi-stage builds
- [ ] Nenhum segredo na imagem
- [ ] USER não-root
- [ ] HEALTHCHECK configurado
- [ ] Scan de vulnerabilidades

## CI/CD - Ferramentas de Scan Obrigatórias

| Ferramenta | Propósito |
|---|---|
| Checkov | Scan de IaC (Terraform, K8s, Docker) |
| tfsec | Análise estática de Terraform |
| Trivy | Scan de imagens e configurações |
| kube-bench | Validação CIS para Kubernetes |
| hadolint | Lint de Dockerfiles |

## Referências
- [OWASP IaC Security](https://cheatsheetseries.owasp.org/cheatsheets/Infrastructure_as_Code_Security_Cheat_Sheet.html)
- [OWASP Docker Security](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
- [OWASP Kubernetes Security](https://cheatsheetseries.owasp.org/cheatsheets/Kubernetes_Security_Cheat_Sheet.html)
- [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks)
