---
inclusion: auto
---

# Consulta Automática de CVEs e Vulnerabilidades

> Ao mencionar, usar ou recomendar qualquer biblioteca/framework, SEMPRE verificar CVEs recentes na web antes de sugerir.

## REGRA: Verificar CVEs Antes de Usar Biblioteca

Quando o código incluir ou referenciar uma biblioteca:
1. Pesquisar na web se a versão possui CVEs conhecidos
2. Se CVE crítico/alto: alertar e sugerir versão segura
3. Se EOL: alertar e sugerir alternativa

## Quando Verificar (Obrigatório)
- Ao adicionar import/require/using de biblioteca
- Ao sugerir biblioteca para resolver problema
- Ao criar arquivo de dependências
- Ao responder sobre qual biblioteca usar

## O que Verificar

### Bibliotecas
- CVEs com CVSS >= 7.0
- Se está EOL ou abandonada
- Se existe versão corrigida
- Se foi comprometida (supply chain)

### Padrões de Código
- Se o padrão tem CVE associado (Log4j JNDI, Jackson defaultTyping)
- Se existe forma mais segura de implementar
- Se framework tem config insegura por padrão

## Padrões que SEMPRE Verificar
- Serialização/desserialização → CVEs de RCE
- Parser XML → XXE
- Template engine → SSTI
- Biblioteca JWT → Algorithm confusion
- ORM → SQL injection em versões antigas
- Biblioteca de imagem → RCE via processamento
- Biblioteca de compressão → Zip slip / DoS
- Biblioteca de logging → Injection (Log4Shell)

## Formato de Alerta

```
⚠️ ALERTA: [biblioteca] v[versão]
- CVE: [número] | Severidade: [CVSS]
- Tipo: [RCE/XSS/DoS/etc.]
- Versão segura: [versão]
- Ação: Atualizar
```

```
🚫 EOL: [biblioteca]
- Alternativa: [alternativa]
- Ação: Migrar
```

## Fontes
- nvd.nist.gov
- github.com/advisories
- cve.org
- Advisories oficiais dos projetos

## Integração com Aprendizado
- Registrar CVEs encontrados em seguranca-aprendizado-bibliotecas.md
- Atualizar steerings se padrão de código afetado
- Atualizar lista de proibidas se necessário
