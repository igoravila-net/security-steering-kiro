---
inclusion: always
description: "Regras de segurança para IaC (Terraform, Docker, Kubernetes), deployment, resiliência e secrets scanning"
---

# Infrastructure — IaC, Containers, Cloud e Deployment

> Regras de segurança para Terraform, Docker, Kubernetes, Helm e scripts de deploy.
> Baseado em: OWASP IaC Security, CIS Benchmarks, OWASP Docker/Kubernetes Security.

---

## 1. Terraform (HCL)

### Security Groups
- NUNCA 0.0.0.0/0 em portas sensíveis (22, 3389, 3306, 5432)
- SSH apenas de VPN/rede interna
- Apenas porta 443 aberta ao público (quando necessário)

### RDS / Bancos de Dados
- storage_encrypted = true
- publicly_accessible = false
- deletion_protection = true
- Senha via secrets manager (NUNCA hardcoded)

### S3 / Storage
- block_public_acls = true
- Server-side encryption habilitado
- Versionamento habilitado

### Outputs
- Outputs sensíveis: sensitive = true obrigatório

### Geral
- Credenciais: SEMPRE via data source de secrets manager
- CloudTrail habilitado em todas as regiões
- VPC Flow Logs habilitados
- KMS para criptografia em repouso

---

## 2. Docker

### Dockerfile — Regras OBRIGATÓRIAS
- USER não-root obrigatório
- Multi-stage build (sem ferramentas de build na imagem final)
- Imagem base mínima (alpine, distroless)
- HEALTHCHECK configurado
- Nenhum segredo na imagem (usar secrets em runtime)
- Tag específica com digest (NUNCA :latest)
- Scan de vulnerabilidades obrigatório (Trivy)

### Docker Compose
- user: UID:GID não-root
- read_only: true
- security_opt: no-new-privileges:true
- cap_drop: ALL
- deploy.resources.limits: definir memory e cpus
- ports: bind em 127.0.0.1 quando possível (não 0.0.0.0)
- secrets: usar Docker secrets (não env vars com valores)

---

## 3. Kubernetes

### Pod Security
- runAsNonRoot: true
- allowPrivilegeEscalation: false
- readOnlyRootFilesystem: true
- capabilities: drop ALL
- automountServiceAccountToken: false (exceto quando necessário)

### Recursos
- Resource limits obrigatórios (memory e cpu)
- Requests definidos para scheduling adequado

### Imagens
- Usar digest (sha256), nunca :latest
- Apenas de registries confiáveis

### Secrets
- Via secretKeyRef (nunca em env value direto)
- Criptografados em repouso

### Network
- NetworkPolicy aplicada em todos os namespaces
- Deny-all por padrão, liberar explicitamente

### RBAC
- Sem cluster-admin para workloads
- Princípio do menor privilégio

---

## 4. Deployment Configuration

### Regras Gerais
- Debug/dev mode DESABILITADO em produção
- Portas desnecessárias fechadas
- Imagens com tag específica (nunca :latest em produção)
- Variáveis de ambiente sensíveis via secrets (nunca plaintext)

### Scripts de Deploy
- set -euo pipefail (Bash) / ErrorActionPreference = Stop (PowerShell)
- Verificar que DEBUG=false antes de deploy em produção
- Validar variáveis obrigatórias no início
- Rejeitar tag latest em produção

---

## 5. Server Configuration

### Application Server (Spring Boot, Express, ASP.NET)
- show-sql: false em produção
- include-stacktrace: never
- include-message: never
- Actuator/debug endpoints: desabilitados ou protegidos com auth
- DevTools: NUNCA em produção

### Web Server (Nginx, Apache)
- server_tokens off (ocultar versão)
- Headers de segurança configurados
- Métodos HTTP desnecessários bloqueados
- Acesso a arquivos sensíveis bloqueado (., .env, .git)
- Listagem de diretórios desabilitada
- HTTPS obrigatório (redirect 80 para 443)

---

## 6. Resiliência e Disponibilidade

### Circuit Breaker
- Implementar para todas as dependências externas
- Threshold: 5 falhas consecutivas para abrir
- Timeout: max 5s para chamadas externas
- Fallback definido para degradação graciosa

### Health Checks
- Liveness probe: verificar se aplicação está viva
- Readiness probe: verificar se pode receber tráfego
- Startup probe: para aplicações com inicialização lenta

### Rate Limiting
- Implementar no API Gateway e/ou aplicação
- Limites diferenciados por endpoint e tipo de usuário

---

## 7. CI/CD Security

### Ferramentas de Scan Obrigatórias

| Ferramenta | Propósito |
|---|---|
| Checkov | Scan de IaC (Terraform, K8s, Docker) |
| tfsec | Análise estática de Terraform |
| Trivy | Scan de imagens e configurações |
| kube-bench | Validação CIS para Kubernetes |
| hadolint | Lint de Dockerfiles |

### Pipeline
- Scan de dependências em todo PR
- Scan de IaC em todo PR que altera infra
- Scan de imagens antes de push para registry
- Falhar build se CVSS >= 7

---

## 8. Potential Backdoor — Padrões PROIBIDOS

### Detectar e Bloquear
- Credenciais de bypass hardcoded
- Endpoints ocultos sem auth
- Headers que desabilitam segurança
- Variáveis de ambiente que desabilitam auth
- Código que executa comandos com entrada externa

### Checklist Anti-Backdoor
- Buscar credenciais hardcoded (admin, master, bypass, debug)
- Verificar endpoints não documentados
- Procurar condições que desabilitam segurança
- Auditar variáveis de ambiente que alteram controles
- Verificar dependências com nomes suspeitos

---

## Referências
- OWASP IaC Security Cheat Sheet
- OWASP Docker Security Cheat Sheet
- OWASP Kubernetes Security Cheat Sheet
- CIS Benchmarks (AWS, Kubernetes, Docker)
- OWASP CI/CD Security Cheat Sheet
