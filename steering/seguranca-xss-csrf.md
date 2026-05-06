# Políticas de Segurança - XSS e CSRF

> Baseado em: [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html), [OWASP DOM XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html), [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Entrada do usuário renderizada sem escape → Usar output encoding do framework
- innerHTML com dados não sanitizados → Usar textContent ou sanitização
- Ausência de Content-Security-Policy → Configurar CSP restritivo
- Endpoints state-changing sem proteção CSRF → Implementar tokens CSRF
- eval() com dados do usuário → Nunca usar eval com entrada externa

## Cross-Site Scripting (XSS) - OBRIGATÓRIO
- Usar output encoding contextual (HTML, JS, URL, CSS)
- Nunca inserir dados não confiáveis em contextos perigosos
- Usar frameworks com escape automático (Thymeleaf, React, Angular)
- Implementar Content-Security-Policy (CSP)
- Validar e sanitizar HTML rico com bibliotecas especializadas

```java
// ✅ CORRETO - Thymeleaf com escape automático
// template.html
// <p th:text="${userInput}">Texto seguro</p>  ← escape automático
// <p th:utext="${sanitizedHtml}">HTML rico</p> ← apenas para conteúdo já sanitizado

// ✅ CORRETO - Sanitização de HTML rico com OWASP Java HTML Sanitizer
@Service
public class ContentService {
    
    private static final PolicyFactory POLICY = new HtmlPolicyBuilder()
        .allowElements("p", "b", "i", "em", "strong", "a", "ul", "ol", "li")
        .allowAttributes("href").onElements("a")
        .allowUrlProtocols("https")
        .requireRelNofollowOnLinks()
        .toFactory();
    
    public String sanitizeUserHtml(String untrustedHtml) {
        return POLICY.sanitize(untrustedHtml);
    }
}

// ❌ ERRADO - Saída sem escape
@GetMapping("/profile")
public String getProfile(Model model, @RequestParam String name) {
    model.addAttribute("name", name); // Perigoso se template usa th:utext
    return "profile";
}
```

```javascript
// ✅ CORRETO - React (escape automático por padrão)
function UserGreeting({ name }) {
    return <h1>Olá, {name}</h1>; // React escapa automaticamente
}

// ❌ ERRADO - dangerouslySetInnerHTML com entrada do usuário
function UnsafeComponent({ userHtml }) {
    return <div dangerouslySetInnerHTML={{ __html: userHtml }} />; // XSS!
}

// ✅ CORRETO - Se necessário HTML rico, usar DOMPurify
import DOMPurify from 'dompurify';

function SafeHtmlComponent({ userHtml }) {
    const clean = DOMPurify.sanitize(userHtml);
    return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

## DOM-Based XSS - OBRIGATÓRIO
- Nunca usar document.write() com dados do usuário
- Evitar innerHTML, outerHTML com dados não confiáveis
- Usar textContent ou createElement para inserção segura
- Sanitizar dados de URL (location.hash, location.search)
- Evitar eval(), setTimeout(string), setInterval(string)

```javascript
// ✅ CORRETO - Inserção segura no DOM
function displayMessage(message) {
    const element = document.getElementById('output');
    element.textContent = message; // Seguro - não interpreta HTML
}

// ❌ ERRADO - innerHTML com dados do usuário
function unsafeDisplay(userInput) {
    document.getElementById('output').innerHTML = userInput; // XSS!
}

// ✅ CORRETO - Manipulação segura de URL params
function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    const value = params.get(name);
    // Validar antes de usar
    if (value && /^[a-zA-Z0-9-]+$/.test(value)) {
        return value;
    }
    return null;
}
```

## Content-Security-Policy (CSP) - OBRIGATÓRIO
- Definir CSP restritivo em todos os responses HTTP
- Usar nonces ou hashes para scripts inline (evitar 'unsafe-inline')
- Bloquear eval e execução dinâmica de código
- Reportar violações para monitoramento

```java
// ✅ CORRETO - CSP com Spring Security
@Configuration
public class SecurityHeadersConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .headers(headers -> headers
                .contentSecurityPolicy(csp -> csp
                    .policyDirectives(
                        "default-src 'self'; " +
                        "script-src 'self' 'nonce-{random}'; " +
                        "style-src 'self' 'nonce-{random}'; " +
                        "img-src 'self' data: https:; " +
                        "font-src 'self'; " +
                        "connect-src 'self'; " +
                        "frame-ancestors 'none'; " +
                        "base-uri 'self'; " +
                        "form-action 'self'"
                    )
                )
                .frameOptions(frame -> frame.deny())
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31536000)
                )
            )
            .build();
    }
}
```

## Cross-Site Request Forgery (CSRF) - OBRIGATÓRIO
- Implementar tokens CSRF em formulários e requisições state-changing
- Usar SameSite=Strict ou Lax em cookies de sessão
- Verificar header Origin/Referer como defesa adicional
- APIs stateless com JWT podem desabilitar CSRF (sem cookies de sessão)
- Nunca usar GET para operações que alteram estado

```java
// ✅ CORRETO - CSRF habilitado para aplicações com sessão
@Configuration
public class CsrfConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
            )
            .build();
    }
}

// ✅ CORRETO - Para APIs REST stateless com JWT (sem cookies)
@Configuration
public class ApiSecurityConfig {
    
    @Bean
    public SecurityFilterChain apiFilterChain(HttpSecurity http) throws Exception {
        return http
            .securityMatcher("/api/**")
            .csrf(csrf -> csrf.disable()) // OK apenas para APIs stateless com Bearer token
            .sessionManagement(session -> session.sessionCreationPolicy(STATELESS))
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
            .build();
    }
}
```

## Headers de Segurança Adicionais - OBRIGATÓRIO
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Strict-Transport-Security (HSTS)
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy (restringir APIs do navegador)

## Referências
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP DOM XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html)
- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP HTTP Headers Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html)
- [OWASP Content Security Policy](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
