# Políticas de Segurança - Controle de Acesso e Autorização

> Baseado em: [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), [OWASP Access Control Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html), [OWASP IDOR Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html)

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Endpoint sem verificação de autorização → Adicionar @PreAuthorize ou filtro
- Acesso a recurso sem verificar propriedade → Validar ownership
- Elevação de privilégio possível → Implementar RBAC rigoroso
- IDOR (Insecure Direct Object Reference) → Validar acesso ao recurso
- Autorização apenas no frontend → Sempre validar no backend

## Controle de Acesso Baseado em Papéis (RBAC) - OBRIGATÓRIO
- Definir papéis claros com permissões mínimas
- Aplicar princípio do menor privilégio
- Verificar autorização em CADA endpoint
- Segurança em nível de método com @PreAuthorize
- Negar por padrão (deny-by-default)

```java
// ✅ CORRETO - RBAC com Spring Security
@Service
public class UserService {
    
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public UserDTO findById(Long userId) {
        return userRepository.findById(userId)
            .map(this::toDTO)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    public Page<UserDTO> findAll(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toDTO);
    }
    
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public UserDTO update(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        // Atualizar apenas campos permitidos
        user.setName(request.name());
        return toDTO(userRepository.save(user));
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(Long userId) {
        userRepository.deleteById(userId);
    }
}

// ❌ ERRADO - Sem verificação de autorização
@GetMapping("/users/{id}")
public UserDTO getUser(@PathVariable Long id) {
    return userService.findById(id); // Qualquer usuário acessa qualquer perfil
}
```

## Prevenção de IDOR - OBRIGATÓRIO
- Validar que o usuário autenticado tem acesso ao recurso solicitado
- Usar UUIDs em vez de IDs sequenciais em URLs públicas
- Implementar verificação de ownership em todas as operações
- Nunca confiar apenas no ID enviado pelo cliente

```java
// ✅ CORRETO - Verificação de ownership
@Service
public class OrderService {
    
    public OrderDTO getOrder(UUID orderId, Long authenticatedUserId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        
        // Verificar que o pedido pertence ao usuário autenticado
        if (!order.getUserId().equals(authenticatedUserId)) {
            throw new AccessDeniedException("Acesso negado ao recurso");
        }
        
        return toDTO(order);
    }
}

// ✅ CORRETO - Consulta já filtrada por usuário
@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    
    @Query("SELECT o FROM Order o WHERE o.id = :orderId AND o.user.id = :userId")
    Optional<Order> findByIdAndUserId(@Param("orderId") UUID orderId, 
                                       @Param("userId") Long userId);
}

// ❌ ERRADO - IDOR vulnerável
@GetMapping("/orders/{id}")
public Order getOrder(@PathVariable Long id) {
    return orderRepository.findById(id).orElseThrow(); // Sem verificação de ownership
}
```

## Controle de Acesso em APIs REST - OBRIGATÓRIO
- Verificar autorização em cada camada (controller → service → repository)
- Filtrar dados na resposta baseado no papel do usuário
- Implementar rate limiting por usuário/papel
- Logar tentativas de acesso não autorizado

```java
// ✅ CORRETO - Controller com autorização explícita
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    @GetMapping("/users")
    public Page<UserDTO> listUsers(Pageable pageable) {
        return userService.findAll(pageable);
    }
    
    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('SUPER_ADMIN')") // Apenas super admin altera papéis
    public UserDTO changeRole(@PathVariable Long id, @RequestBody ChangeRoleRequest request) {
        return userService.changeRole(id, request);
    }
}

// ✅ CORRETO - Configuração global deny-by-default
@Configuration
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/**").authenticated()
                .anyRequest().denyAll() // Deny-by-default
            )
            .build();
    }
}
```

## Proteção contra Escalação de Privilégios - OBRIGATÓRIO
- Não permitir que usuários alterem seu próprio papel
- Validar que operações administrativas vêm de admins reais
- Implementar separação de deveres para operações críticas
- Auditar todas as mudanças de permissão

```java
// ✅ CORRETO - Prevenir auto-elevação de privilégio
@Service
public class RoleService {
    
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public void assignRole(Long targetUserId, Role newRole, Authentication auth) {
        Long currentUserId = ((UserPrincipal) auth.getPrincipal()).getId();
        
        // Não permitir alterar próprio papel
        if (targetUserId.equals(currentUserId)) {
            throw new BusinessException("Não é permitido alterar o próprio papel");
        }
        
        // Auditar a operação
        auditService.log("ROLE_CHANGE", currentUserId, targetUserId, newRole);
        
        userRepository.updateRole(targetUserId, newRole);
    }
}
```

## Referências
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [OWASP Access Control Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html)
- [OWASP IDOR Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html)
