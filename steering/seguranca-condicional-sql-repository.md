---
inclusion: fileMatch
fileMatchPattern: "**/*Repository*,**/*repository*,**/*Repo*,**/*repo*,**/*DAO*,**/*dao*,**/migrations/*,**/*.sql"
---

# Regras de Segurança para Repositórios e SQL

> Ativado automaticamente ao editar arquivos de repository/DAO/migrations/SQL

## OBRIGATÓRIO neste contexto

- NUNCA concatenar strings para montar queries
- SEMPRE usar consultas parametrizadas
- Filtrar por userId/tenantId quando dados são por usuário
- Paginação obrigatória em listagens (LIMIT/OFFSET)
- Conexão com SSL/TLS habilitado
- Validar input ANTES de passar para a query
- Limitar tamanho de parâmetros de busca (máx 200 chars)
