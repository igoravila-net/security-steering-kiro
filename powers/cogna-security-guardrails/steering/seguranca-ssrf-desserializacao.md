# Políticas de Segurança - SSRF, Desserialização e Configuração

> Baseado em: [OWASP SSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html), [OWASP Deserialization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html), [OWASP Security Misconfiguration](https://owasp.org/www-project-top-ten/)

## VIOLAÇÕES CRÍTICAS (Falha automática)
- URL fornecida pelo usuário acessada sem validação → Implementar whitelist de destinos
- Desserialização de dados não confiáveis → Usar formatos seguros (JSON)
- Endpoints de debug/actuator expostos em produção → Restringir acesso
- Configurações padrão inseguras em produção → Hardening obrigatório
- Stack traces expostos ao cliente → Retornar mensagens genéricas

## Server-Side Request Forgery (SSRF) - OBRIGATÓRIO
- Validar e sanitizar todas as URLs fornecidas pelo usuário
- Implementar whitelist de domínios/IPs permitidos
- Bloquear acesso a redes internas (127.0.0.1, 10.x, 172.16-31.x, 192.168.x)
- Bloquear protocolos perigosos (file://, gopher://, dict://)
- Usar DNS resolution para detectar redirecionamentos para IPs internos
- Limitar redirecionamentos HTTP

```java
// ✅ CORRETO - Validação de URL contra SSRF
@Service
public class SafeHttpClient {
    
    private static final Set<String> ALLOWED_HOSTS = Set.of(
        "api.example.com", "cdn.example.com", "partner-api.com"
    );
    
    private static final Set<String> ALLOWED_SCHEMES = Set.of("https");
    
    public ResponseEntity<String> fetchUrl(String userProvidedUrl) {
        URI uri;
        try {
            uri = new URI(userProvidedUrl);
        } catch (URISyntaxException e) {
            throw new InvalidUrlException("URL inválida");
        }
        
        // 1. Validar esquema (apenas HTTPS)
        if (!ALLOWED_SCHEMES.contains(uri.getScheme())) {
            throw new InvalidUrlException("Apenas HTTPS é permitido");
        }
        
        // 2. Validar host contra whitelist
        if (!ALLOWED_HOSTS.contains(uri.getHost())) {
            throw new InvalidUrlException("Host não permitido");
        }
        
        // 3. Resolver DNS e verificar se não é IP interno
        InetAddress address = InetAddress.getByName(uri.getHost());
        if (isInternalAddress(address)) {
            throw new SecurityException("Acesso a rede interna bloqueado");
        }
        
        // 4. Fazer requisição com timeout
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setRequestFactory(createFactory(5000, 5000)); // Timeouts
        
        return restTemplate.getForEntity(uri, String.class);
    }
    
    private boolean isInternalAddress(InetAddress address) {
        return address.isLoopbackAddress()
            || address.isSiteLocalAddress()
            || address.isLinkLocalAddress()
            || address.isAnyLocalAddress();
    }
}

// ❌ ERRADO - SSRF vulnerável
@GetMapping("/fetch")
public String fetchContent(@RequestParam String url) {
    return restTemplate.getForObject(url, String.class); // SSRF!
}
```

## Desserialização Insegura - OBRIGATÓRIO
- Nunca desserializar dados não confiáveis com ObjectInputStream
- Preferir formatos de dados simples (JSON, XML com parser seguro)
- Se necessário usar serialização Java, implementar whitelist de classes
- Manter bibliotecas de serialização atualizadas
- Usar ObjectInputFilter (Java 9+) para restringir classes

```java
// ✅ CORRETO - JSON com Jackson (seguro por padrão)
@RestController
public class ApiController {
    
    private final ObjectMapper objectMapper;
    
    public ApiController() {
        this.objectMapper = new ObjectMapper();
        // Desabilitar features perigosas
        objectMapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        // NÃO habilitar default typing (permite RCE)
        // objectMapper.enableDefaultTyping(); ← NUNCA faça isso
    }
    
    @PostMapping("/process")
    public ResponseDTO process(@Valid @RequestBody RequestDTO request) {
        // Jackson desserializa apenas para o tipo esperado
        return service.process(request);
    }
}

// ✅ CORRETO - Se serialização Java for inevitável, usar ObjectInputFilter
public Object safeDeserialize(byte[] data) throws Exception {
    ByteArrayInputStream bais = new ByteArrayInputStream(data);
    ObjectInputStream ois = new ObjectInputStream(bais);
    
    // Whitelist de classes permitidas (Java 9+)
    ois.setObjectInputFilter(filterInfo -> {
        Class<?> clazz = filterInfo.serialClass();
        if (clazz == null) return ObjectInputFilter.Status.UNDECIDED;
        
        Set<String> allowed = Set.of(
            "com.myapp.dto.SafeDTO",
            "java.lang.String",
            "java.lang.Integer"
        );
        
        if (allowed.contains(clazz.getName())) {
            return ObjectInputFilter.Status.ALLOWED;
        }
        return ObjectInputFilter.Status.REJECTED;
    });
    
    return ois.readObject();
}

// ❌ ERRADO - Desserialização sem filtro
public Object unsafeDeserialize(byte[] data) throws Exception {
    ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(data));
    return ois.readObject(); // RCE possível!
}

// ❌ ERRADO - Jackson com default typing habilitado
ObjectMapper mapper = new ObjectMapper();
mapper.enableDefaultTyping(); // Permite instanciar qualquer classe → RCE
```

## Configuração Segura (Security Misconfiguration) - OBRIGATÓRIO
- Desabilitar endpoints de debug em produção
- Restringir acesso ao Spring Boot Actuator
- Remover headers que expõem tecnologia (Server, X-Powered-By)
- Configurar error handling sem stack traces
- Desabilitar listagem de diretórios
- Remover páginas/endpoints padrão

```java
// ✅ CORRETO - Actuator restrito
// application-prod.yml
// management:
//   endpoints:
//     web:
//       exposure:
//         include: health,info,metrics
//   endpoint:
//     health:
//       show-details: never

// ✅ CORRETO - Segurança do Actuator
@Configuration
public class ActuatorSecurityConfig {
    
    @Bean
    @Order(1)
    public SecurityFilterChain actuatorSecurity(HttpSecurity http) throws Exception {
        return http
            .securityMatcher("/actuator/**")
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/actuator/**").hasRole("ADMIN")
            )
            .httpBasic(Customizer.withDefaults())
            .build();
    }
}

// ✅ CORRETO - Error handling sem exposição de detalhes
// application-prod.yml
// server:
//   error:
//     include-message: never
//     include-stacktrace: never
//     include-binding-errors: never
//     include-exception: false
```

## Prevenção de XML External Entity (XXE) - OBRIGATÓRIO
- Desabilitar DTDs e entidades externas em parsers XML
- Usar parsers configurados de forma segura
- Preferir JSON sobre XML quando possível

```java
// ✅ CORRETO - Parser XML seguro
public Document parseXmlSafely(String xmlInput) throws Exception {
    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
    
    // Desabilitar features perigosas
    factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
    factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
    factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
    factory.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
    factory.setXIncludeAware(false);
    factory.setExpandEntityReferences(false);
    
    DocumentBuilder builder = factory.newDocumentBuilder();
    return builder.parse(new InputSource(new StringReader(xmlInput)));
}

// ❌ ERRADO - Parser XML vulnerável a XXE
public Document unsafeParseXml(String xml) throws Exception {
    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
    // Configuração padrão permite XXE!
    return factory.newDocumentBuilder().parse(new InputSource(new StringReader(xml)));
}
```

## Logging e Monitoramento de Segurança - OBRIGATÓRIO
- Logar todas as tentativas de autenticação (sucesso e falha)
- Logar acessos não autorizados
- Logar operações administrativas
- Não logar dados sensíveis (senhas, tokens, PII)
- Implementar alertas para padrões suspeitos
- Usar formato estruturado (JSON) para facilitar análise

```java
// ✅ CORRETO - Logging de segurança estruturado
@Component
public class SecurityAuditLogger {
    
    private static final Logger auditLog = LoggerFactory.getLogger("SECURITY_AUDIT");
    
    public void logAuthSuccess(String userId, String ipAddress) {
        auditLog.info("event=AUTH_SUCCESS userId={} ip={} timestamp={}",
            userId, ipAddress, Instant.now());
    }
    
    public void logAuthFailure(String username, String ipAddress, String reason) {
        auditLog.warn("event=AUTH_FAILURE username={} ip={} reason={} timestamp={}",
            sanitize(username), ipAddress, reason, Instant.now());
    }
    
    public void logAccessDenied(String userId, String resource, String action) {
        auditLog.warn("event=ACCESS_DENIED userId={} resource={} action={} timestamp={}",
            userId, resource, action, Instant.now());
    }
    
    private String sanitize(String input) {
        if (input == null) return "null";
        return input.replaceAll("[\\r\\n\\t]", "_").substring(0, Math.min(input.length(), 100));
    }
}
```

## Referências
- [OWASP SSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP Deserialization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html)
- [OWASP XML External Entity Prevention](https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html)
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [OWASP Error Handling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html)
