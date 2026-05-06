# Políticas de Segurança - Code Injection, SQL Injection e Command Injection (Multilinguagem)

> Baseado em: [OWASP Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html), [OWASP SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html), [OWASP OS Command Injection](https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html)

## VIOLAÇÕES CRÍTICAS (Falha automática)
- eval()/exec() com entrada do usuário → Nunca executar código dinâmico
- Concatenação de strings em SQL → Usar consultas parametrizadas
- Entrada do usuário em comandos shell → Usar APIs sem shell
- Template injection com dados não confiáveis → Usar sandbox/escape
- Desserialização de dados não confiáveis → Usar formatos seguros (JSON)

---

## CODE INJECTION

### C# (.NET)

```csharp
// ✅ CORRETO - Evitar execução dinâmica de código
public class SafeCalculator
{
    private static readonly Dictionary<string, Func<double, double, double>> Operations = new()
    {
        ["+"] = (a, b) => a + b,
        ["-"] = (a, b) => a - b,
        ["*"] = (a, b) => a * b,
        ["/"] = (a, b) => b != 0 ? a / b : throw new DivideByZeroException()
    };

    public double Calculate(string operation, double a, double b)
    {
        if (!Operations.TryGetValue(operation, out var func))
            throw new ArgumentException("Operação inválida");
        return func(a, b);
    }
}

// ❌ ERRADO - CSharpScript com entrada do usuário
var result = await CSharpScript.EvaluateAsync(userInput); // Code injection!

// ❌ ERRADO - Roslyn com entrada não confiável
var script = CSharpScript.Create(userExpression);
await script.RunAsync(); // RCE!
```

### Java

```java
// ✅ CORRETO - Whitelist de operações permitidas
public class SafeProcessor {
    
    private static final Map<String, BiFunction<Integer, Integer, Integer>> OPS = Map.of(
        "add", Integer::sum,
        "subtract", (a, b) -> a - b,
        "multiply", (a, b) -> a * b
    );
    
    public int process(String operation, int a, int b) {
        BiFunction<Integer, Integer, Integer> op = OPS.get(operation);
        if (op == null) throw new IllegalArgumentException("Operação inválida: " + operation);
        return op.apply(a, b);
    }
}

// ❌ ERRADO - ScriptEngine com entrada do usuário
ScriptEngine engine = new ScriptEngineManager().getEngineByName("js");
engine.eval(userInput); // Code injection!

// ❌ ERRADO - Reflection com entrada do usuário
Class.forName(userInput).getDeclaredConstructor().newInstance(); // RCE!
```

### TypeScript / JavaScript

```typescript
// ✅ CORRETO - Whitelist de funções permitidas
const allowedOperations: Record<string, (a: number, b: number) => number> = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    multiply: (a, b) => a * b,
};

function safeCalculate(operation: string, a: number, b: number): number {
    const fn = allowedOperations[operation];
    if (!fn) throw new Error('Operação não permitida');
    return fn(a, b);
}

// ❌ ERRADO - eval com entrada do usuário
const result = eval(userInput); // Code injection!

// ❌ ERRADO - Function constructor com entrada
const fn = new Function('return ' + userInput); // Code injection!

// ❌ ERRADO - setTimeout/setInterval com string
setTimeout(userInput, 1000); // Code injection!
```

### Python

```python
# ✅ CORRETO - Whitelist de operações
import operator

SAFE_OPS = {
    'add': operator.add,
    'sub': operator.sub,
    'mul': operator.mul,
}

def safe_calculate(operation: str, a: float, b: float) -> float:
    op = SAFE_OPS.get(operation)
    if op is None:
        raise ValueError(f"Operação não permitida: {operation}")
    return op(a, b)

# ❌ ERRADO - eval/exec com entrada do usuário
result = eval(user_input)  # Code injection!
exec(user_code)  # RCE!

# ❌ ERRADO - compile + exec
code = compile(user_input, '<string>', 'exec')
exec(code)  # RCE!
```

### Swift

```swift
// ✅ CORRETO - Whitelist de operações
enum Operation: String {
    case add, subtract, multiply
    
    func execute(_ a: Double, _ b: Double) -> Double {
        switch self {
        case .add: return a + b
        case .subtract: return a - b
        case .multiply: return a * b
        }
    }
}

func safeCalculate(op: String, a: Double, b: Double) throws -> Double {
    guard let operation = Operation(rawValue: op) else {
        throw AppError.invalidOperation
    }
    return operation.execute(a, b)
}
```

### Kotlin

```kotlin
// ✅ CORRETO - Sealed class para operações seguras
sealed class Operation {
    data object Add : Operation()
    data object Subtract : Operation()
    data object Multiply : Operation()
    
    fun execute(a: Double, b: Double): Double = when (this) {
        is Add -> a + b
        is Subtract -> a - b
        is Multiply -> a * b
    }
    
    companion object {
        fun fromString(op: String): Operation = when (op) {
            "add" -> Add
            "subtract" -> Subtract
            "multiply" -> Multiply
            else -> throw IllegalArgumentException("Operação inválida")
        }
    }
}
```

---

## SQL INJECTION

### C# (.NET)

```csharp
// ✅ CORRETO - Entity Framework (parametrizado por padrão)
public async Task<User?> FindByEmail(string email)
{
    return await _context.Users
        .Where(u => u.Email == email && u.IsActive)
        .FirstOrDefaultAsync();
}

// ✅ CORRETO - Dapper com parâmetros
public async Task<IEnumerable<User>> SearchUsers(string name)
{
    const string sql = "SELECT * FROM Users WHERE Name LIKE @Name AND Active = 1";
    return await _connection.QueryAsync<User>(sql, new { Name = $"%{name}%" });
}

// ✅ CORRETO - ADO.NET com parâmetros
using var cmd = new SqlCommand("SELECT * FROM Users WHERE Email = @Email", connection);
cmd.Parameters.AddWithValue("@Email", email);

// ❌ ERRADO - Concatenação de string
var sql = $"SELECT * FROM Users WHERE Name = '{name}'"; // SQL Injection!
```

### Java

```java
// ✅ CORRETO - JPA com parâmetros nomeados
@Query("SELECT u FROM User u WHERE u.email = :email AND u.active = true")
Optional<User> findActiveByEmail(@Param("email") String email);

// ✅ CORRETO - PreparedStatement
String sql = "SELECT * FROM users WHERE email = ? AND active = true";
PreparedStatement stmt = connection.prepareStatement(sql);
stmt.setString(1, email);

// ❌ ERRADO - Concatenação
String sql = "SELECT * FROM users WHERE name = '" + name + "'"; // SQL Injection!
```

### TypeScript / JavaScript

```typescript
// ✅ CORRETO - Prisma (parametrizado por padrão)
const user = await prisma.user.findFirst({
    where: { email, active: true }
});

// ✅ CORRETO - Knex com bindings
const users = await knex('users')
    .where('email', email)
    .andWhere('active', true);

// ✅ CORRETO - pg com parâmetros
const result = await pool.query(
    'SELECT * FROM users WHERE email = $1 AND active = true',
    [email]
);

// ❌ ERRADO - Template literal em SQL
const result = await pool.query(`SELECT * FROM users WHERE name = '${name}'`); // SQL Injection!
```

### Python

```python
# ✅ CORRETO - SQLAlchemy ORM
user = session.query(User).filter(User.email == email, User.active == True).first()

# ✅ CORRETO - psycopg2 com parâmetros
cursor.execute("SELECT * FROM users WHERE email = %s AND active = true", (email,))

# ✅ CORRETO - Django ORM
user = User.objects.filter(email=email, active=True).first()

# ❌ ERRADO - f-string em SQL
cursor.execute(f"SELECT * FROM users WHERE name = '{name}'")  # SQL Injection!
```

### Kotlin

```kotlin
// ✅ CORRETO - Exposed framework
val user = Users.select { (Users.email eq email) and (Users.active eq true) }.firstOrNull()

// ✅ CORRETO - JDBC com PreparedStatement
val stmt = connection.prepareStatement("SELECT * FROM users WHERE email = ?")
stmt.setString(1, email)

// ❌ ERRADO - String template em SQL
val sql = "SELECT * FROM users WHERE name = '$name'"  // SQL Injection!
```

---

## COMMAND / ARGUMENT INJECTION

### C# (.NET)

```csharp
// ✅ CORRETO - ProcessStartInfo com argumentos separados
public string RunCommand(string filename)
{
    // Validar entrada contra whitelist
    if (!Regex.IsMatch(filename, @"^[a-zA-Z0-9._-]+$"))
        throw new ArgumentException("Nome de arquivo inválido");
    
    var psi = new ProcessStartInfo
    {
        FileName = "cat",
        Arguments = $"/safe/path/{filename}",
        RedirectStandardOutput = true,
        UseShellExecute = false
    };
    
    using var process = Process.Start(psi)!;
    return process.StandardOutput.ReadToEnd();
}

// ❌ ERRADO - Shell com entrada do usuário
Process.Start("cmd", $"/c dir {userInput}"); // Command injection!
```

### Java

```java
// ✅ CORRETO - ProcessBuilder com argumentos separados
public String runCommand(String filename) throws IOException {
    if (!filename.matches("^[a-zA-Z0-9._-]+$")) {
        throw new IllegalArgumentException("Nome de arquivo inválido");
    }
    
    ProcessBuilder pb = new ProcessBuilder("cat", "/safe/path/" + filename);
    pb.redirectErrorStream(true);
    Process process = pb.start();
    return new String(process.getInputStream().readAllBytes());
}

// ❌ ERRADO - Runtime.exec com string concatenada
Runtime.getRuntime().exec("cmd /c dir " + userInput); // Command injection!
```

### TypeScript / JavaScript

```typescript
import { execFile } from 'child_process';

// ✅ CORRETO - execFile com argumentos separados (não usa shell)
function runCommandSafe(filename: string): Promise<string> {
    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
        throw new Error('Nome de arquivo inválido');
    }
    
    return new Promise((resolve, reject) => {
        execFile('cat', [`/safe/path/${filename}`], (error, stdout) => {
            if (error) reject(error);
            else resolve(stdout);
        });
    });
}

// ❌ ERRADO - exec com entrada do usuário (usa shell)
import { exec } from 'child_process';
exec(`ls ${userInput}`); // Command injection!

// ❌ ERRADO - Template literal em comando
exec(`grep ${searchTerm} /var/log/app.log`); // Command injection!
```

### Python

```python
import subprocess

# ✅ CORRETO - subprocess com lista de argumentos (sem shell)
def run_command_safe(filename: str) -> str:
    import re
    if not re.match(r'^[a-zA-Z0-9._-]+$', filename):
        raise ValueError("Nome de arquivo inválido")
    
    result = subprocess.run(
        ['cat', f'/safe/path/{filename}'],
        capture_output=True, text=True,
        shell=False,  # IMPORTANTE: shell=False
        timeout=10
    )
    return result.stdout

# ❌ ERRADO - shell=True com entrada do usuário
subprocess.run(f"ls {user_input}", shell=True)  # Command injection!

# ❌ ERRADO - os.system
os.system(f"grep {search_term} /var/log/app.log")  # Command injection!
```

### PowerShell

```powershell
# ✅ CORRETO - Validar entrada e usar argumentos separados
function Invoke-SafeCommand {
    param(
        [ValidatePattern('^[a-zA-Z0-9._-]+$')]
        [string]$FileName
    )
    
    $safePath = Join-Path "/safe/path" $FileName
    Get-Content $safePath
}

# ❌ ERRADO - Invoke-Expression com entrada do usuário
Invoke-Expression "Get-Content $userInput"  # Command injection!

# ❌ ERRADO - String interpolada em comando
& cmd /c "dir $userInput"  # Command injection!
```

### Bash/Shell

```bash
# ✅ CORRETO - Validar e usar aspas
run_safe() {
    local filename="$1"
    
    # Validar contra whitelist
    if [[ ! "$filename" =~ ^[a-zA-Z0-9._-]+$ ]]; then
        echo "ERRO: Nome de arquivo inválido" >&2
        return 1
    fi
    
    # Usar aspas duplas para prevenir word splitting
    cat "/safe/path/$filename"
}

# ❌ ERRADO - Sem validação e sem aspas
cat /uploads/$user_input  # Command injection + path traversal!

# ❌ ERRADO - eval com entrada do usuário
eval "$user_command"  # Command injection!
```

## Referências
- [OWASP Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html)
- [OWASP SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [OWASP OS Command Injection](https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html)
