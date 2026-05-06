# Políticas de Segurança - APIs REST e Microserviços

> Baseado em: [OWASP REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html), [OWASP Microservices Security](https://cheatsheetseries.owasp.org/cheatsheets/Microservices_Security_Cheat_Sheet.html), [OWASP GraphQL Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/GraphQL_Cheat_Sheet.html)

## VIOLAÇÕES CRÍTICAS (Falha automática)
- API sem autenticação exposta publicamente → Proteger com JWT/OAuth2
- Sem rate limiting → Implementar throttling por IP/usuário
- Dados sensíveis em query parameters → Usar request body ou headers
- Sem versionamento de API → Implementar versionamento
- Respostas com dados excessivos → Retornar apenas campos necessários

## Segurança de APIs REST - OBRIGATÓRIO
- HTTPS obrigatório em todos os endpoints
- Autenticação via Bearer token (JWT) ou OAuth2
- Rate limiting e throttling
- Validação de Content-Type
- Paginação obrigatória em listagens
- Não expor IDs internos sequenciais

```java
// ✅ CORRETO - Controller REST seguro
@RestController
@RequestMapping("/api/v1/orders")
@Validated
public class OrderController {
    
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PagedResponse<OrderDTO>> listOrders(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            Authentication auth) {
        
        Long userId = ((UserPrincipal) auth.getPrincipal()).getId();
        Page<OrderDTO> orders = orderService.findByUser(userId, PageRequest.of(page, size));
        
        return ResponseEntity.ok(PagedResponse.from(orders));
    }
    
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDTO> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            Authentication auth) {
        
        Long userId = ((UserPrincipal) auth.getPrincipal()).getId();
        OrderDTO order = orderService.create(request, userId);
        
        URI location = URI.create("/api/v1/orders/" + order.id());
        return ResponseEntity.created(location).body(order);
    }
}

// ❌ ERRADO - API sem proteção
@GetMapping("/api/users")
public List<User> getAllUsers() { // Sem auth, sem paginação, expõe entidade
    return userRepository.findAll();
}
```

## Rate Limiting - OBRIGATÓRIO
- Limitar requisições por IP e por usuário autenticado
- Retornar headers padrão (X-RateLimit-Limit, X-RateLimit-Remaining)
- Responder 429 Too Many Requests quando excedido
- Limites diferenciados por endpoint (login mais restritivo)

```java
// ✅ CORRETO - Rate limiting com Bucket4j
@Configuration
public class RateLimitConfig {
    
    @Bean
    public FilterRegistrationBean<RateLimitFilter> rateLimitFilter() {
        FilterRegistrationBean<RateLimitFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new RateLimitFilter());
        registration.addUrlPatterns("/api/*");
        return registration;
    }
}

@Component
public class RateLimitFilter extends OncePerRequestFilter {
    
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                     HttpServletResponse response, 
                                     FilterChain chain) throws ServletException, IOException {
        
        String clientId = getClientIdentifier(request);
        Bucket bucket = buckets.computeIfAbsent(clientId, this::createBucket);
        
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        
        response.setHeader("X-RateLimit-Limit", "100");
        response.setHeader("X-RateLimit-Remaining", String.valueOf(probe.getRemainingTokens()));
        
        if (!probe.isConsumed()) {
            response.setStatus(429);
            response.getWriter().write("{\"error\":\"Rate limit exceeded\"}");
            return;
        }
        
        chain.doFilter(request, response);
    }
    
    private Bucket createBucket(String key) {
        return Bucket.builder()
            .addLimit(Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1))))
            .build();
    }
}
```

## Respostas de API - OBRIGATÓRIO
- Nunca expor entidades JPA diretamente (usar DTOs)
- Retornar apenas campos necessários para o cliente
- Formato de erro consistente e sem informações internas
- Headers de segurança em todas as respostas
- CORS configurado de forma restritiva

```java
// ✅ CORRETO - DTO com apenas campos necessários
public record OrderDTO(
    UUID id,           // UUID público, não ID sequencial
    String status,
    BigDecimal total,
    LocalDateTime createdAt
) {}

// ✅ CORRETO - Resposta de erro padronizada
public record ApiError(
    String code,
    String message,
    Instant timestamp,
    String path
) {
    // Sem stack trace, sem detalhes internos
}

// ✅ CORRETO - CORS restritivo
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("https://app.example.com"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}

// ❌ ERRADO - CORS permissivo
config.setAllowedOrigins(List.of("*")); // Permite qualquer origem
config.setAllowedMethods(List.of("*")); // Permite qualquer método
```

## Proteção contra Denial of Service (DoS) - OBRIGATÓRIO
- Limitar tamanho do request body
- Timeout em todas as operações
- Paginação obrigatória (máx 100 itens por página)
- Limitar profundidade de queries (GraphQL)
- Circuit breaker para chamadas externas

```yaml
# ✅ CORRETO - Limites no application.yml
server:
  tomcat:
    max-http-form-post-size: 2MB
    connection-timeout: 5000
  servlet:
    session:
      timeout: 30m

spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB
  jackson:
    default-property-inclusion: non_null
    deserialization:
      fail-on-unknown-properties: true
```

## Comunicação entre Microserviços - OBRIGATÓRIO
- mTLS (mutual TLS) entre serviços
- Service mesh para controle de tráfego
- Tokens de serviço com escopo limitado
- Não confiar em requisições internas sem autenticação
- Circuit breaker para resiliência

```java
// ✅ CORRETO - Chamada entre serviços com token
@Service
public class PaymentServiceClient {
    
    private final WebClient webClient;
    private final ServiceTokenProvider tokenProvider;
    
    public PaymentResponse processPayment(PaymentRequest request) {
        String serviceToken = tokenProvider.getServiceToken("payment-service");
        
        return webClient.post()
            .uri("/api/internal/payments")
            .header("Authorization", "Bearer " + serviceToken)
            .header("X-Request-Id", UUID.randomUUID().toString())
            .bodyValue(request)
            .retrieve()
            .onStatus(HttpStatusCode::is4xxClientError, this::handleClientError)
            .onStatus(HttpStatusCode::is5xxServerError, this::handleServerError)
            .bodyToMono(PaymentResponse.class)
            .timeout(Duration.ofSeconds(5))
            .block();
    }
}
```

## Versionamento de API - OBRIGATÓRIO
- Versionar via URL path (/api/v1/, /api/v2/)
- Manter compatibilidade retroativa dentro da mesma versão
- Deprecar versões antigas com prazo definido
- Documentar breaking changes

## Referências
- [OWASP REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)
- [OWASP Microservices Security](https://cheatsheetseries.owasp.org/cheatsheets/Microservices_Security_Cheat_Sheet.html)
- [OWASP Denial of Service Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html)
- [OWASP GraphQL Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/GraphQL_Cheat_Sheet.html)
