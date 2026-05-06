# Políticas de Segurança - Desenvolvimento Seguro / SSDLC (Grupo COGNA)

> Baseado na Política de Desenvolvimento Seguro (Segurança da Informação_001 v3) do Grupo COGNA

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Código sem passar por SAST antes de merge → Executar análise estática obrigatória
- Dados pessoais reais em ambiente de desenvolvimento → Usar dados mascarados/sintéticos
- Credenciais no código-fonte → Obter do cofre PAM
- Código compartilhado em IA não aprovada → PROIBIDO compartilhar código em LLMs não autorizados
- Deploy sem DAST em homologação → Executar testes dinâmicos antes de produção
- Repositório sem gates de segurança → Configurar gates com AppSec

## Ciclo de Desenvolvimento Seguro (SSDLC) - OBRIGATÓRIO

Toda solução desenvolvida pelo Grupo COGNA DEVE seguir o SSDLC, incluindo plataformas Low Code e No Code.

### Fases do SSDLC

| Fase | Atividades de Segurança |
|---|---|
| 1. Análise de Requisitos | Requisitos de segurança e privacidade no planning |
| 2. Desenho da Solução | Modelagem de ameaças, arquitetura segura |
| 3. Implementação | SAST, SCA, IaC scan, gates de segurança |
| 4. Verificação | DAST em homologação, fuzzing, revisão manual |
| 5. Liberação | Validação final, scan de vulnerabilidades |

## Regras para Implementação - OBRIGATÓRIO

### Análise Estática (SAST)
- Executar em TODOS os repositórios antes de merge/deploy
- Ferramentas aprovadas pelo time de Segurança da Informação
- Findings críticos e altos DEVEM ser corrigidos antes do merge
- Alinhamento com Security Champions para gates pré-definidos

### Análise de Composição (SCA)
- Verificar vulnerabilidades em dependências de terceiros
- Dependências com CVE crítico: atualizar antes do merge
- Manter inventário de dependências atualizado

### Análise de Infraestrutura (IaC)
- Scan de segurança em Terraform, Kubernetes, Dockerfiles
- Validar contra CIS Benchmarks

### Análise Dinâmica (DAST)
- Executar em ambiente de Homologação/Staging
- Validar funcionalidades antes da liberação para produção
- Identificar falhas de processamento de dados inseridos

### Fuzzing
- Testes com entradas inválidas ou aleatórias
- Objetivo: induzir falhas ou comportamentos inesperados
- Executar durante desenvolvimento

### Revisão Manual de Código
- Foco em componentes críticos e tratamento de PII
- Executada por colaborador capacitado em segurança
- Complementar às ferramentas automatizadas

### Teste de Intrusão (Pentest)
- Pelo menos uma vez ao ano
- Simular ações de atacante real
- Resultados com roteiro de exploração, impacto e correção
- Correções seguem SLA por criticidade

## SLAs de Correção de Vulnerabilidades

| Nível de Risco | SLA Máximo |
|---|---|
| Crítico (8+) | 1 semana (ou emergencial) |
| Alto (6-7) | 15 dias |
| Médio (4-5) | 1 mês |
| Baixo (2-3) | 6 meses |

## Regras de Ambiente - OBRIGATÓRIO

### Segregação
- Bancos de desenvolvimento DEVEM ser segregados de produção
- Ambiente de desenvolvimento sem conexão a pontos externos ao Grupo COGNA
- Ambiente restrito apenas a partes autorizadas

### Dados
- Dados em ambiente de desenvolvimento DEVEM ser mascarados
- NUNCA conter informações reais de colaboradores, parceiros ou clientes
- Usar dados sintéticos gerados por factories/seeders

### Código-Fonte
- Ativo controlado: versões, dependências e modificações por pessoas autorizadas
- Acesso controlado e monitorado
- PROIBIDO compartilhar código (parcial ou total) em ferramentas de IA não aprovadas
- Usar lojas oficiais para hospedagem de aplicativos (Microsoft, Google, Apple)

### Controle de Versão
- Sistema de controle de versão com controle de acesso
- Repositório controlado por SRE
- Recuperação da aplicação em caso de falhas
- Canal de comunicação com integridade (criptografia, VPN)

## Regras para Credenciais no Código
- Dados pessoais sensíveis e confidenciais NUNCA no código-fonte
- Logins, senhas, credenciais: PROIBIDO no código
- Todos os usuários administrativos: sob controle do Cofre de Senhas oficial
- Métodos de criptografia: respeitar integridade e particularidades dos dados

## Logs e LGPD
- Toda aplicação que tratar dados pessoais DEVE atender requisitos de logs da LGPD
- Logar: quem acessou, quando, qual dado, qual operação
- NUNCA logar o conteúdo dos dados pessoais em si

## Exclusão de Repositórios
- Repositórios desnecessários DEVEM ser excluídos
- Solicitar ao time de AppSec via formulário oficial
- Reduz superfície de ataque

## Melhoria Contínua (PDCA)
- Plan: Planejar melhorias no SSDLC
- Do: Implementar melhorias
- Check: Verificar eficácia
- Act: Ajustar e padronizar

## Terceiros e Fábricas de Software
- RFPs DEVEM assegurar conformidade com desenvolvimento seguro
- Contratos DEVEM refletir compromisso com SSDLC
- Terceiros DEVEM seguir as mesmas regras deste documento

## SLAs para Varreduras Externas

| Nível de Risco | SLA Máximo |
|---|---|
| Crítico | Emergencial/imediato |
| Alto | 1 mês |
| Médio | 2 meses |
| Baixo | 6 meses |

## Referências
- Política de Desenvolvimento Seguro (Segurança da Informação_001 v3) - Grupo COGNA
- Microsoft Security Development Lifecycle Process 5.2
- NIST 800-64
- Política de Segurança da Informação - Grupo COGNA
- Política de Proteção de Dados e Privacidade - Grupo COGNA
