# Políticas de Segurança - Authorization Issues, Encapsulation e Code Quality

> Baseado em: [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Endpoint sem verificação de autorização → Adicionar controle de acesso
- Lógica de autorização apenas no frontend → Validar no backend
- Acesso a recurso sem verificar ownership → Implementar verificação
- Dados internos expostos via API → Usar DTOs e encapsulamento
- Race conditions em operações críticas → Usar locks/transações
- Recursos não liberados (memory leaks) → Usar try-with-resources/using/defer

---

## AUTHORIZATION ISSUES

### C# (.NET)

```csharp
// ✅ CORRETO - Autorização baseada em políticas
[Authorize(Policy = "AdminOnly")]
[HttpDelete("users/{id}")]
public async Task<IActionResult> DeleteUser(long id)
{
    await _userService.Delete(id);
    return NoContent();
}

// ✅ CORRETO - Verificação de ownership
[Authorize]
[HttpGet("orders/{id}")]
public async Task<IActionResult> GetOrder(Guid id)
{
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
    var order = await _orderService.GetByIdAndUser(id, long.Parse(userId));
    
    if (order == null) return NotFound();
    return Ok(order);
}

// ❌ ERRADO - Sem verificação de autorização
[HttpGet("users/{id}")]
public async Task<IActionResult> GetUser(long id)
{
    return Ok(await _userService.GetById(id)); // Qualquer um acessa!
}
```

### Java

```java
// ✅ CORRETO - @PreAuthorize com verificação de ownership
@PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
public UserDTO findById(Long userId) {
    return userRepository.findById(userId)
        .map(this::toDTO)
        .orElseThrow(() -> new ResourceNotFoundException("User", userId));
}

// ❌ ERRADO - Sem autorização
@GetMapping("/api/users/{id}/profile")
public User getProfile(@PathVariable Long id) {
    return userRepository.findById(id).orElseThrow(); // IDOR!
}
```

### TypeScript / JavaScript

```typescript
// ✅ CORRETO - Middleware de autorização
function requireOwnership(req: Request, res: Response, next: NextFunction) {
    const resourceUserId = req.params.userId;
    const authenticatedUserId = req.user?.id;
    
    if (resourceUserId !== authenticatedUserId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
}

app.get('/api/users/:userId/orders', authenticate, requireOwnership, getOrders);

// ❌ ERRADO - Sem verificação
app.get('/api/users/:userId/orders', getOrders); // Qualquer um acessa!
```

### Python

```python
# ✅ CORRETO - Decorator de autorização em Django
from functools import wraps

def owner_required(view_func):
    @wraps(view_func)
    def wrapper(request, user_id, *args, **kwargs):
        if request.user.id != user_id and not request.user.is_staff:
            return JsonResponse({"error": "Acesso negado"}, status=403)
        return view_func(request, user_id, *args, **kwargs)
    return wrapper

@login_required
@owner_required
def get_user_orders(request, user_id):
    orders = Order.objects.filter(user_id=user_id)
    return JsonResponse({"orders": list(orders.values())})

# ❌ ERRADO - Sem verificação de ownership
def get_user_orders(request, user_id):
    orders = Order.objects.filter(user_id=user_id)  # Qualquer um acessa!
    return JsonResponse({"orders": list(orders.values())})
```

### Swift

```swift
// ✅ CORRETO - Verificação de autorização
func getOrder(orderId: UUID, authenticatedUserId: UUID) throws -> Order {
    guard let order = orderRepository.find(id: orderId) else {
        throw AppError.notFound
    }
    
    guard order.userId == authenticatedUserId else {
        throw AppError.forbidden
    }
    
    return order
}
```

### Kotlin

```kotlin
// ✅ CORRETO - Verificação de ownership
fun getOrder(orderId: UUID, authenticatedUserId: Long): OrderDTO {
    val order = orderRepository.findById(orderId)
        ?: throw NotFoundException("Pedido não encontrado")
    
    if (order.userId != authenticatedUserId) {
        throw ForbiddenException("Acesso negado")
    }
    
    return order.toDTO()
}
```

---

## ENCAPSULATION

### C# (.NET)

```csharp
// ✅ CORRETO - DTO separado da entidade
public record UserDTO(Guid Id, string Name, string Email);

// ✅ CORRETO - Entidade com encapsulamento
public class User
{
    public Guid Id { get; private set; }
    public string Name { get; private set; }
    public string Email { get; private set; }
    private string PasswordHash { get; set; } // Não exposto
    public Role Role { get; private set; } // Setter privado
    
    public void UpdateName(string name) => Name = name;
    // Role só pode ser alterado por método específico com validação
    public void PromoteTo(Role newRole, User promotedBy)
    {
        if (promotedBy.Role != Role.Admin)
            throw new UnauthorizedAccessException();
        Role = newRole;
    }
}

// ❌ ERRADO - Expor entidade diretamente
[HttpGet("users/{id}")]
public User GetUser(long id) => _context.Users.Find(id)!; // Expõe password hash, role, etc.
```

### Java

```java
// ✅ CORRETO - Records imutáveis como DTOs
public record UserDTO(UUID id, String name, String email) {}
public record CreateUserRequest(
    @NotBlank String name,
    @Email String email,
    @NotBlank String password
) {}

// ✅ CORRETO - Entidade com encapsulamento
@Entity
public class User {
    @Id @GeneratedValue
    private Long id;
    private String name;
    private String email;
    private String passwordHash; // Nunca exposto via getter público
    
    @Enumerated(EnumType.STRING)
    private Role role;
    
    // Getters seletivos - não expor passwordHash
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    // Sem getPasswordHash() público!
}

// ❌ ERRADO - Entidade com todos os campos públicos
@Entity
public class User {
    @Id public Long id;
    public String name;
    public String passwordHash; // Exposto!
    public String role; // Modificável externamente!
}
```

### TypeScript / JavaScript

```typescript
// ✅ CORRETO - Interface de resposta separada do modelo interno
interface UserResponse {
    id: string;
    name: string;
    email: string;
}

// Modelo interno com campos sensíveis
interface UserModel {
    id: string;
    name: string;
    email: string;
    passwordHash: string; // Nunca retornado
    role: string;
    internalNotes: string; // Nunca retornado
}

function toUserResponse(user: UserModel): UserResponse {
    return { id: user.id, name: user.name, email: user.email };
}

// ❌ ERRADO - Retornar modelo interno diretamente
app.get('/users/:id', async (req, res) => {
    const user = await db.users.findById(req.params.id);
    res.json(user); // Expõe passwordHash, internalNotes, etc.!
});
```

### Python

```python
# ✅ CORRETO - Pydantic models para serialização controlada
from pydantic import BaseModel

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    # password_hash NÃO incluído

class UserInternal(BaseModel):
    id: int
    name: str
    email: str
    password_hash: str  # Apenas uso interno
    role: str

# ❌ ERRADO - Retornar modelo completo
@app.get("/users/{user_id}")
def get_user(user_id: int):
    user = db.query(User).get(user_id)
    return user.__dict__  # Expõe tudo incluindo password_hash!
```

---

## CODE QUALITY (Segurança)

### Todas as linguagens - Regras gerais

```csharp
// ✅ CORRETO - Recursos liberados com using (C#)
await using var connection = new SqlConnection(connectionString);
await connection.OpenAsync();
await using var command = connection.CreateCommand();
// Recursos liberados automaticamente

// ❌ ERRADO - Recurso não liberado
var connection = new SqlConnection(connectionString);
connection.Open(); // Nunca fecha se exceção ocorrer!
```

```java
// ✅ CORRETO - try-with-resources (Java)
try (var connection = dataSource.getConnection();
     var statement = connection.prepareStatement(sql)) {
    statement.setString(1, email);
    try (var rs = statement.executeQuery()) {
        // processar
    }
}

// ❌ ERRADO - Recurso não fechado
Connection conn = dataSource.getConnection();
Statement stmt = conn.createStatement(); // Leak se exceção!
```

```typescript
// ✅ CORRETO - Cleanup em finally (TypeScript)
let connection: Connection | null = null;
try {
    connection = await pool.getConnection();
    // usar connection
} finally {
    connection?.release();
}

// ✅ CORRETO - AbortController para timeouts
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);
try {
    const response = await fetch(url, { signal: controller.signal });
} finally {
    clearTimeout(timeout);
}
```

```python
# ✅ CORRETO - Context manager (Python)
with open('/path/to/file', 'r') as f:
    content = f.read()

async with aiohttp.ClientSession() as session:
    async with session.get(url) as response:
        data = await response.json()

# ❌ ERRADO - Arquivo não fechado
f = open('/path/to/file', 'r')
content = f.read()  # Nunca fecha!
```

```kotlin
// ✅ CORRETO - use extension (Kotlin)
dataSource.connection.use { conn ->
    conn.prepareStatement(sql).use { stmt ->
        stmt.setString(1, email)
        stmt.executeQuery().use { rs ->
            // processar
        }
    }
}
```

```bash
# ✅ CORRETO - Trap para cleanup (Bash)
cleanup() {
    rm -f "$TEMP_FILE"
}
trap cleanup EXIT

TEMP_FILE=$(mktemp)
# usar arquivo temporário - será limpo automaticamente
```

## Referências
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [OWASP Mass Assignment](https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html)
- [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
