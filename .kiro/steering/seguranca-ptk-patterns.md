---
inclusion: auto
---

# Padrões PTK (OWASP Penetration Testing Kit) - Detecção Preventiva

> Baseado nos padrões do OWASP PTK. Prevenir ANTES de escrever o código.

## SAST Patterns - Sinks Perigosos JavaScript/TypeScript

### Execução de Código Dinâmico - PROIBIDO
- eval() → NUNCA
- new Function(string) → NUNCA
- setTimeout(string) → Usar apenas com função
- setInterval(string) → Usar apenas com função
- document.write() → NUNCA
- document.writeln() → NUNCA

### Manipulação Insegura de DOM - PROIBIDO sem sanitização
- innerHTML/outerHTML → textContent ou DOMPurify
- insertAdjacentHTML → Sanitizar com DOMPurify
- setAttribute('on*') → NUNCA com dados do usuário
- style.cssText com input → Sanitizar (CSS injection)
- location.href/assign/replace com input → Validar URL whitelist
- window.open com input → Validar URL

### Criptografia Insegura - PROIBIDO
- Math.random() para segurança → crypto.getRandomValues()
- MD5/SHA1 para senhas → Argon2id/BCrypt
- btoa()/atob() como criptografia → Web Crypto API
- DES/RC4/3DES → AES-256-GCM
- Chave criptográfica hardcoded → Via vault

### Armazenamento Inseguro - PROIBIDO
- localStorage com tokens → HttpOnly cookie ou memória
- Cookie sem Secure/HttpOnly → Flags obrigatórias
- IndexedDB com dados sensíveis sem criptografia → Criptografar

### Comunicação Insegura - PROIBIDO
- fetch/XHR para http:// → Apenas https://
- WebSocket ws:// → Apenas wss://
- postMessage sem validar origin → Validar event.origin
- Script de CDN sem SRI → Usar integrity hash

## IAST Patterns - Fluxo de Dados Tainted

### Sources (Dados Não Confiáveis)
- window.location (hash, search, pathname)
- document.referrer, document.cookie, window.name
- postMessage event.data
- URL parameters, form inputs, File API
- WebSocket messages, localStorage/sessionStorage

### Sinks (Destinos Perigosos)
- DOM: innerHTML, outerHTML, document.write
- Execução: eval, Function, setTimeout(string)
- Navegação: location.href, location.assign
- jQuery: .html(), .append() com HTML
- React: dangerouslySetInnerHTML
- Angular: bypassSecurityTrust*
- SQL: concatenação em queries
- OS: exec/spawn com shell
- File: paths sem validação
- Regex: new RegExp com input (ReDoS)

### Regra de Fluxo
- SOURCE → SANITIZAÇÃO → SINK (obrigatório)
- Sem sanitização entre source e sink = VULNERABILIDADE
- Sanitização contextual: HTML encode para DOM, SQL param para DB, URL encode para URLs

## JWT Attacks - Prevenção
- Algorithm none → REJEITAR
- Sem validar exp/iss/aud → SEMPRE validar
- Secret < 256 bits → Mínimo 256 bits
- Em localStorage → HttpOnly cookie
- Sem refresh rotation → Implementar rotação
- Dados sensíveis no payload → Minimizar claims

## Cookie Security
- Secure: true (apenas HTTPS)
- HttpOnly: true (não acessível via JS)
- SameSite: Strict ou Lax
- Path: restrito
- Max-Age definido

## CSP (Content Security Policy) - Obrigatório
- default-src 'self'
- script-src 'self' (sem unsafe-inline, sem unsafe-eval)
- style-src 'self'
- img-src 'self' data: https:
- connect-src 'self' + APIs permitidas
- frame-ancestors 'none'
- base-uri 'self'
- form-action 'self'

### CSP Inseguro - PROIBIDO
- unsafe-inline → Usar nonces/hashes
- unsafe-eval → Remover eval do código
- default-src * → Muito permissivo
- CSP ausente → Adicionar obrigatoriamente

## SCA Frontend - Bibliotecas Vulneráveis
- jQuery < 3.5.0 → XSS
- Angular.js (1.x) → EOL
- Lodash < 4.17.21 → Prototype pollution
- Moment.js → EOL (usar date-fns/dayjs)
- DOMPurify < 3.0 → XSS bypass
- Usar SRI para CDN imports
- Versões fixas (save-exact)

## Referências
- OWASP Penetration Testing Kit (PTK)
- OWASP DOM XSS Prevention Cheat Sheet
- OWASP CSP Cheat Sheet
- OWASP JWT Security Cheat Sheet
