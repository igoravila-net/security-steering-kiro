# Políticas de Segurança - Classificação da Informação (Grupo COGNA)

> Baseado na Política de Classificação das Informações (Segurança da Informação_001 v3) do Grupo COGNA e na LGPD (Lei 13.709/2018)

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Dados pessoais classificados abaixo de RESTRITO → Mínimo RESTRITO
- Dados pessoais sensíveis classificados abaixo de CONFIDENCIAL → Obrigatório CONFIDENCIAL
- Dados de crianças/adolescentes sem classificação CONFIDENCIAL → Obrigatório CONFIDENCIAL
- Dados pessoais em logs sem mascaramento → Mascarar SEMPRE
- Dados RESTRITOS ou CONFIDENCIAIS sem criptografia → Criptografar em repouso e trânsito
- Dados de produção em ambientes dev/staging → Anonimizar ANTES de copiar

## Níveis de Classificação

| Nível | Descrição | Exemplos | Controles Obrigatórios |
|---|---|---|---|
| **PÚBLICA** | Pode ser de conhecimento público | Site institucional, vagas abertas | Nenhum controle especial |
| **INTERNA** | Não divulgar externamente, baixo impacto se vazar | Comunicados internos, organogramas | Acesso autenticado, sem dados pessoais |
| **RESTRITA** | Acesso limitado a grupo/área específica | Dados pessoais de alunos/colaboradores, relatórios financeiros | Criptografia, controle de acesso por role, auditoria |
| **CONFIDENCIAL** | Divulgação causa grande prejuízo financeiro/imagem | Dados sensíveis (saúde, biometria), dados de menores, estratégias | Criptografia forte, acesso mínimo, auditoria completa, DLP |

## Regras de Classificação no Código

### Dados Pessoais → Mínimo RESTRITO
- Nome, email, telefone, endereço, CPF, RG
- Dados de alunos, colaboradores, fornecedores
- Qualquer dado que identifique pessoa natural

### Dados Pessoais Sensíveis → CONFIDENCIAL
- Origem racial/étnica
- Convicção religiosa, opinião política
- Dados de saúde, vida sexual
- Dados genéticos, biométricos
- Filiação a sindicato/organização

### Dados de Crianças e Adolescentes → CONFIDENCIAL
- Mesmo peso de dado pessoal sensível
- Controles adicionais de consentimento (responsável legal)

## Controles por Nível de Classificação

### Acesso
- PÚBLICA: sem restrição
- INTERNA: autenticação obrigatória
- RESTRITA: autenticação + autorização por role + verificação de ownership
- CONFIDENCIAL: autenticação + autorização + justificativa + auditoria completa

### Criptografia

| Nível | Em Repouso | Em Trânsito | Backup |
|---|---|---|---|
| PÚBLICA | Opcional | HTTPS | Padrão |
| INTERNA | Opcional | HTTPS obrigatório | Padrão |
| RESTRITA | AES-256 obrigatório | TLS 1.2+ obrigatório | Criptografado |
| CONFIDENCIAL | AES-256 + KMS | TLS 1.3 preferencial | Criptografado + acesso restrito |

### Mascaramento em Logs e Respostas
- PÚBLICA/INTERNA: sem mascaramento necessário
- RESTRITA: mascaramento parcial (ex: j***n@email.com, ***.456.***-**)
- CONFIDENCIAL: mascaramento total ou não incluir

### Auditoria
- RESTRITA: logar quem acessou, quando
- CONFIDENCIAL: logar quem acessou, quando, de onde, justificativa

## Regras de Compartilhamento

### Com Terceiros/Fornecedores
- PÚBLICOS: sem restrição
- INTERNOS: mediante NDA
- RESTRITOS: contrato com cláusulas de proteção de dados
- CONFIDENCIAIS: aprovação formal + contrato + DPA (Data Processing Agreement)

### Entre Sistemas Internos
- RESTRITOS e CONFIDENCIAIS: apenas via APIs autenticadas com mTLS
- Logar toda transferência de dados classificados
- Princípio do menor privilégio (sistema recebe apenas o necessário)

## Regras para Ambientes

| Ambiente | Dados Permitidos |
|---|---|
| Produção | Todos os níveis (com controles adequados) |
| Staging/Homologação | Apenas PÚBLICOS e INTERNOS, ou dados anonimizados |
| Desenvolvimento | Apenas dados sintéticos/fictícios |
| Testes automatizados | Apenas dados fictícios gerados por factories |

## Sobreposição de Classificações

Quando houver dúvida entre dois níveis, SEMPRE usar o nível mais alto até que a classificação correta seja definida.

Exemplo: relatório com dados internos + CPF → classificar como RESTRITO (nível do CPF).

## Retenção e Descarte

- Dados sem necessidade → Descartar seguindo procedimento
- Descarte digital: sobrescrever dados
- Manter registro de descarte para auditoria
- Respeitar prazos LGPD e direito ao esquecimento

## Incidentes de Segurança

Se detectar vazamento ou acesso indevido a dados classificados:
1. Comunicar imediatamente a área de Segurança da Informação
2. Registrar evidências (logs, timestamps, usuários envolvidos)
3. Não tentar corrigir sozinho sem orientação
4. Dados pessoais vazados: notificar DPO para avaliação LGPD (Art. 48)

## Referências
- Política de Classificação das Informações (Segurança da Informação_001 v3) - Grupo COGNA
- Política de Segurança da Informação - Grupo COGNA
- Política de Proteção de Dados e Privacidade - Grupo COGNA
- LGPD (Lei 13.709/2018)
- NIST CSF
- ISO/IEC 27001
