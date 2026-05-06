# Políticas de Segurança - Prevenção de Injeção

> Baseado em: [OWASP Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html), [OWASP SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html), [OWASP Query Parameterization](https://cheatsheetseries.owasp.org/cheatsheets/Query_Parameterization_Cheat_Sheet.html)

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Concatenação de strings em consultas SQL → Usar consultas parametrizadas
- Entrada do usuário em comandos OS → Usar APIs seguras sem shell
- Dados não sanitizados em templates → Usar escape automático do framework
- LDAP queries com entrada não validada → Usar filtros parametrizados
- XPath com concatenação de entrada → Usar APIs parametrizadas

## Injeção SQL - OBRIGATÓRIO
- Usar SEMPRE consultas parametrizadas (prepared statements)
- Usar ORM/JPA para abstração de banco
- Validar e sanitizar todas as entradas antes de consultas
- Usar @Query com parâmetros nomeados (Spring Data)
- Nunca concatenar strings para montar SQL

```java
// ✅ CORRETO - JPA com parâmetros nomeados
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.active = true")
    Optional<User> findActiveByEmail(@Param("email") String email);
    
    @Query("SELECT u FROM User u WHERE u.name LIKE :name%")
    List<User> findByNameStarting(@Param("name") String name);
    
    @Query(value = "SELECT * FROM users WHERE created_at > :date", nativeQuery = true)
    List<User> findUsersCreatedAfter(@Param("date") LocalDateTime date);
}

// ✅ CORRETO - Criteria API para consultas dinâmicas
@Repository
public class UserCustomRepository {
    @PersistenceContext
    private EntityManager em;
    
    public List<User> searchUsers(UserSearchCriteria criteria) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<User> query = cb.createQuery(User.class);
        Root<User> root = query.from(User.class);
        
        List<Predicate> predicates = new ArrayList<>();
        
        if (criteria.getName() != null) {
            predicates.add(cb.like(root.get("name"), cb.parameter(String.class, "name")));
        }
        
        query.where(predicates.toArray(new Predicate[0]));
        
        TypedQuery<User> typedQuery = em.createQuery(query);
        if (criteria.getName() != null) {
            typedQuery.setParameter("name", criteria.getName() + "%");
        }
        
        return typedQuery.getResultList();
    }
}

// ❌ ERRADO - Concatenação de string (SQL Injection)
public List<User> findByName(String name) {
    String sql = "SELECT * FROM users WHERE name = '" + name + "'";
    return entityManager.createNativeQuery(sql).getResultList();
}
```

## Injeção de Comandos OS - OBRIGATÓRIO
- Nunca passar entrada do usuário diretamente para comandos shell
- Usar ProcessBuilder com argumentos separados (não string única)
- Validar entrada contra whitelist de caracteres permitidos
- Evitar Runtime.exec() com string concatenada

```java
// ✅ CORRETO - ProcessBuilder com argumentos separados
public String executeCommand(String filename) {
    // Validar entrada contra whitelist
    if (!filename.matches("^[a-zA-Z0-9._-]+$")) {
        throw new IllegalArgumentException("Nome de arquivo inválido");
    }
    
    ProcessBuilder pb = new ProcessBuilder("cat", "/safe/path/" + filename);
    pb.redirectErrorStream(true);
    Process process = pb.start();
    return new String(process.getInputStream().readAllBytes());
}

// ❌ ERRADO - Comando com entrada do usuário
public String unsafeCommand(String userInput) {
    Runtime.getRuntime().exec("cmd /c dir " + userInput); // Injeção de comando
    return "";
}
```

## Injeção LDAP - OBRIGATÓRIO
- Escapar caracteres especiais LDAP: `* ( ) \ / NUL`
- Usar frameworks que suportam filtros parametrizados
- Validar entrada contra formato esperado

```java
// ✅ CORRETO - Spring LDAP com filtro seguro
public User findByUsername(String username) {
    // Escapar caracteres especiais LDAP
    String safeUsername = LdapEncoder.filterEncode(username);
    
    LdapQuery query = LdapQueryBuilder.query()
        .where("uid").is(safeUsername);
    
    return ldapTemplate.findOne(query, User.class);
}

// ❌ ERRADO - Concatenação em filtro LDAP
public User unsafeLdapSearch(String username) {
    String filter = "(&(uid=" + username + ")(objectClass=person))";
    return ldapTemplate.search("", filter, new UserMapper()).get(0);
}
```

## Injeção em Templates (SSTI) - OBRIGATÓRIO
- Usar escape automático do template engine
- Nunca inserir entrada do usuário diretamente em templates
- Configurar sandbox em template engines quando disponível
- Usar Content Security Policy (CSP) como camada adicional

## Injeção em Logs (Log Injection) - OBRIGATÓRIO
- Sanitizar dados do usuário antes de logar
- Remover caracteres de controle (newline, carriage return)
- Usar placeholders do framework de logging (não concatenação)

```java
// ✅ CORRETO - Placeholder do SLF4J (previne log injection)
log.info("Usuário autenticado: {}", sanitize(username));

private String sanitize(String input) {
    return input.replaceAll("[\\r\\n]", "_");
}

// ❌ ERRADO - Concatenação em log
log.info("Usuário autenticado: " + username); // Log injection possível
```

## Referências
- [OWASP Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html)
- [OWASP SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [OWASP OS Command Injection Defense](https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html)
- [OWASP LDAP Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/LDAP_Injection_Prevention_Cheat_Sheet.html)
