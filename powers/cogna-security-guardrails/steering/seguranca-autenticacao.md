# Políticas de Segurança - Autenticação e Gerenciamento de Sessão

> Baseado em: [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Credenciais hardcoded no código → Usar variáveis de ambiente
- Senhas armazenadas em texto plano ou com hash reversível → Usar Argon2id/BCrypt
- Tokens sem expiração → Definir TTL máximo de 24h
- Sessões sem invalidação no logout → Implementar invalidação server-side
- Autenticação apenas client-side → Sempre validar no servidor

## Autenticação - OBRIGATÓRIO
- Tokens JWT para autenticação de API
- Expiração de token (máx 24h para access token)
- Mecanismo de refresh token (máx 7 dias)
- Armazenamento seguro de tokens (HttpOnly cookies ou secure storage)
- Sem credenciais no código-fonte
- Rate limiting em endpoints de login (máx 5 tentativas/minuto)
- Bloqueio temporário após tentativas excessivas

```java
// ✅ CORRETO - Configuração Spring Security stateless com JWT
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .sessionManagement(session -> session.sessionCreationPolicy(STATELESS))
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.decoder(jwtDecoder()))
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .build();
    }
}

// ❌ ERRADO - Credenciais hardcoded
public class DatabaseConfig {
    private static final String PASSWORD = "mypassword123"; // NUNCA faça isso
}
```

## Armazenamento de Senhas - OBRIGATÓRIO
- Usar Argon2id como algoritmo principal (mín. 19 MiB memória, 2 iterações, 1 paralelismo)
- Se Argon2id indisponível, usar BCrypt com work factor ≥ 12
- Nunca usar MD5, SHA-1, SHA-256 para senhas
- Implementar pepper (segredo da aplicação) além do salt

```java
// ✅ CORRETO - BCrypt com Spring Security
@Configuration
public class PasswordConfig {
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Work factor 12
    }
}

@Service
public class UserService {
    private final PasswordEncoder passwordEncoder;
    
    public User createUser(CreateUserRequest request) {
        String hashedPassword = passwordEncoder.encode(request.password());
        
        return User.builder()
            .email(request.email())
            .password(hashedPassword)
            .build();
    }
    
    public boolean verifyPassword(String rawPassword, String storedHash) {
        return passwordEncoder.matches(rawPassword, storedHash);
    }
}

// ❌ ERRADO - Hash inseguro
public class InsecureAuth {
    public String hashPassword(String password) {
        return DigestUtils.md5Hex(password); // NUNCA use MD5 para senhas
    }
}
```

## Gerenciamento de Sessão - OBRIGATÓRIO
- IDs de sessão com mínimo 128 bits de entropia
- Regenerar ID de sessão após login (prevenir session fixation)
- Cookies com flags: Secure, HttpOnly, SameSite=Strict
- Timeout de inatividade (máx 30 minutos)
- Timeout absoluto (máx 12 horas)
- Invalidação completa no logout (server-side)

```java
// ✅ CORRETO - Configuração de cookies seguros
@Configuration
public class SessionConfig {
    
    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setCookieName("SESSION_ID");
        serializer.setUseSecureCookie(true);
        serializer.setUseHttpOnlyCookie(true);
        serializer.setSameSite("Strict");
        serializer.setCookieMaxAge(1800); // 30 minutos
        return serializer;
    }
}

// ✅ CORRETO - Logout com invalidação
@PostMapping("/logout")
public ResponseEntity<Void> logout(HttpServletRequest request) {
    HttpSession session = request.getSession(false);
    if (session != null) {
        session.invalidate();
    }
    SecurityContextHolder.clearContext();
    return ResponseEntity.noContent().build();
}
```

## Multi-Factor Authentication (MFA) - OBRIGATÓRIO
- MFA altamente recomendável para TODOS os usuários das aplicações do Grupo Cogna
- Obrigatório para operações sensíveis e contas privilegiadas
- Suportar TOTP (Time-based One-Time Password)
- Códigos de recuperação seguros (uso único)
- Não revelar se MFA está habilitado para um usuário

## Procedimento de Uso de Senhas (Grupo COGNA)

> Baseado no Procedimento de Uso de Senhas (Segurança da Informação_002 v3) do Grupo COGNA

### Características Obrigatórias de Senhas
- Mínimo 16 caracteres (recomendado)
- Combinar: maiúsculas + minúsculas + números (mínimo 3 dos 4 tipos)
- Caracteres especiais: recomendados quando suportado pelo sistema
- PROIBIDO: sequência numérica/alfabética, dados do usuário, nomes das empresas do grupo
- Histórico: bloquear reutilização das últimas 9 senhas
- Troca periódica: a cada 60 dias para usuários nominais
- Não exibir senha digitada (exceto se usuário requisitar visualização)
- Avisar sobre necessidade de troca até 10 dias antes da expiração

### Bloqueio de Conta
- Bloquear após 5 tentativas de acesso inválidas
- Desbloqueio automático após 10 minutos (quando aplicável)
- Bloquear usuário após 2 meses sem acesso ao sistema/rede

### Regras para Código - OBRIGATÓRIO
- Senhas NUNCA armazenadas em texto claro (sempre hash com Argon2id ou BCrypt)
- Credenciais default/padrão: alterar durante instalação/criação
- Senhas iniciais: bloqueadas até troca pelo usuário no portal
- Implementar mecanismo de troca de senha pelo próprio usuário
- Implementar complexidade mínima (16 chars, 3 de 4 tipos)
- Implementar histórico de 9 senhas (bloquear reutilização)
- Implementar bloqueio após 5 tentativas inválidas
- Implementar timeout de tela após 5 minutos de inatividade
- Implementar aviso de expiração (10 dias antes)
- Arquivo de senhas: criptografado, em diretório protegido

### Senhas Privilegiadas (Desenvolvedores)
- Restrita e confidencial à equipe técnica específica
- NUNCA divulgar, informar ou emprestar
- Usar preferencialmente estações homologadas/corporativas
- Exceções: tratar com Segurança da Informação

## Referências
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- Procedimento de Uso de Senhas (Segurança da Informação_002 v3) - Grupo COGNA
