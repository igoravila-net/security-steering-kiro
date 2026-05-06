# Políticas de Segurança - Credentials Management e Directory Traversal

> Baseado em: [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html), [OWASP File Upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Credenciais hardcoded em código-fonte → Usar vault/variáveis de ambiente
- Senhas em arquivos de configuração commitados → Usar .gitignore e vault
- Path traversal em acesso a arquivos → Normalizar e validar caminhos
- Acesso a arquivos fora do diretório permitido → Verificar canonical path

## Credentials Management

### C# (.NET)

```csharp
// ✅ CORRETO - User Secrets em desenvolvimento
// dotnet user-secrets set "Database:Password" "dev-password"

// ✅ CORRETO - Azure Key Vault em produção
builder.Configuration.AddAzureKeyVault(
    new Uri($"https://{vaultName}.vault.azure.net/"),
    new DefaultAzureCredential());

// ✅ CORRETO - IConfiguration para acessar segredos
public class DatabaseService
{
    private readonly string _connectionString;
    
    public DatabaseService(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string não configurada");
    }
}

// ❌ ERRADO - Credenciais hardcoded
private const string ApiKey = "sk-abc123xyz789"; // NUNCA!
private const string DbPassword = "P@ssw0rd!"; // NUNCA!
```

### Java

```java
// ✅ CORRETO - Variáveis de ambiente
@Value("${API_SECRET_KEY}")
private String apiKey;

// ✅ CORRETO - Spring Cloud Vault
@Configuration
@PropertySource("vault:secret/myapp")
public class VaultConfig {}

// ❌ ERRADO - Credenciais no código
private static final String SECRET = "my-secret-key-123"; // NUNCA!
```

### TypeScript / JavaScript

```typescript
// ✅ CORRETO - Variáveis de ambiente com validação
import { z } from 'zod';

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    API_SECRET: z.string().min(32),
    JWT_SECRET: z.string().min(64),
});

const env = envSchema.parse(process.env);

// ✅ CORRETO - .env NÃO commitado (em .gitignore)
// .env.example com placeholders para documentação

// ❌ ERRADO - Credenciais no código
const API_KEY = 'sk-live-abc123'; // NUNCA!
const DB_PASSWORD = 'production_pass'; // NUNCA!
```

### Python

```python
# ✅ CORRETO - Variáveis de ambiente com validação
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    api_key: str
    
    class Config:
        env_file = '.env'  # .env em .gitignore

settings = Settings()

# ❌ ERRADO - Credenciais hardcoded
SECRET_KEY = "django-insecure-abc123"  # NUNCA em produção!
DATABASE_PASSWORD = "mypassword"  # NUNCA!
```

### Swift

```swift
// ✅ CORRETO - Keychain para armazenamento seguro
import Security

func storeCredential(key: String, value: String) -> Bool {
    let data = value.data(using: .utf8)!
    let query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrAccount as String: key,
        kSecValueData as String: data,
        kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
    ]
    SecItemDelete(query as CFDictionary)
    return SecItemAdd(query as CFDictionary, nil) == errSecSuccess
}

// ❌ ERRADO - Credenciais em UserDefaults
UserDefaults.standard.set("api-key-123", forKey: "apiKey") // Não é seguro!
```

### Kotlin

```kotlin
// ✅ CORRETO - EncryptedSharedPreferences (Android)
val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

val securePrefs = EncryptedSharedPreferences.create(
    context, "secure_prefs", masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)

securePrefs.edit().putString("api_token", token).apply()

// ❌ ERRADO - SharedPreferences sem criptografia
prefs.edit().putString("password", password).apply() // Texto plano!
```

### PowerShell

```powershell
# ✅ CORRETO - Usar SecureString e Credential Manager
$credential = Get-Credential
$securePassword = $credential.Password

# ✅ CORRETO - Ler de variável de ambiente
$apiKey = $env:API_SECRET_KEY
if (-not $apiKey) { throw "API_SECRET_KEY não definida" }

# ❌ ERRADO - Senha em plaintext no script
$password = "MinhaSenh@123"  # NUNCA!
Invoke-RestMethod -Headers @{ "Authorization" = "Bearer hardcoded-token" }  # NUNCA!
```

### Bash/Shell

```bash
# ✅ CORRETO - Variáveis de ambiente
DB_PASSWORD="${DB_PASSWORD:?Variável DB_PASSWORD não definida}"

# ✅ CORRETO - Ler de arquivo seguro (permissões 600)
API_KEY=$(cat /run/secrets/api_key)

# ❌ ERRADO - Credenciais no script
PASSWORD="minha-senha-123"  # NUNCA!
curl -H "Authorization: Bearer hardcoded-token" "$URL"  # NUNCA!
```

### YAML / JSON / HCL

```yaml
# ✅ CORRETO - Referências a segredos externos
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  db-password: ${DB_PASSWORD_BASE64}  # Injetado pelo CI/CD

# ❌ ERRADO - Segredos em plaintext no YAML
database:
  password: "production_password_123"  # NUNCA commitar!
```

```hcl
# ✅ CORRETO - Terraform com data source de secrets
data "aws_secretsmanager_secret_version" "db" {
  secret_id = "prod/database/password"
}

resource "aws_db_instance" "main" {
  password = data.aws_secretsmanager_secret_version.db.secret_string
}
```

### .gitignore OBRIGATÓRIO

```
# Arquivos que NUNCA devem ser commitados
.env
.env.local
.env.production
*.pem
*.key
*.p12
*credentials*
*secrets*
```

---

## Directory Traversal

### C# (.NET)

```csharp
// ✅ CORRETO - Validar path contra diretório base
public class SafeFileService
{
    private readonly string _baseDirectory;
    
    public SafeFileService(IConfiguration config)
    {
        _baseDirectory = Path.GetFullPath(config["Storage:BasePath"]!);
    }
    
    public byte[] ReadFile(string requestedPath)
    {
        // Sanitizar e resolver path
        string sanitized = requestedPath.Replace("..", "").Replace("~", "");
        string fullPath = Path.GetFullPath(Path.Combine(_baseDirectory, sanitized));
        
        // Verificar que está dentro do diretório permitido
        if (!fullPath.StartsWith(_baseDirectory, StringComparison.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException("Acesso negado: path fora do diretório permitido");
        }
        
        return File.ReadAllBytes(fullPath);
    }
}

// ❌ ERRADO - Path sem validação
public byte[] ReadFile(string filename)
{
    return File.ReadAllBytes("/uploads/" + filename); // Path traversal!
}
```

### Java

```java
// ✅ CORRETO - Canonical path validation
@Service
public class SafeFileService {
    
    private final Path baseDirectory;
    
    public SafeFileService(@Value("${storage.base-path}") String basePath) {
        this.baseDirectory = Path.of(basePath).toAbsolutePath().normalize();
    }
    
    public byte[] readFile(String requestedPath) throws IOException {
        // Resolver e normalizar
        Path resolved = baseDirectory.resolve(requestedPath).normalize();
        
        // Verificar que está dentro do diretório base
        if (!resolved.startsWith(baseDirectory)) {
            throw new AccessDeniedException("Path traversal detectado");
        }
        
        return Files.readAllBytes(resolved);
    }
}

// ❌ ERRADO - Concatenação direta
public byte[] readFile(String filename) throws IOException {
    return Files.readAllBytes(Path.of("/uploads/" + filename)); // Traversal!
}
```

### TypeScript / JavaScript

```typescript
import path from 'path';
import fs from 'fs/promises';

// ✅ CORRETO - Validação de path
const BASE_DIR = path.resolve('/app/uploads');

async function readFileSafe(requestedPath: string): Promise<Buffer> {
    // Resolver e normalizar
    const resolved = path.resolve(BASE_DIR, requestedPath);
    
    // Verificar que está dentro do diretório base
    if (!resolved.startsWith(BASE_DIR)) {
        throw new Error('Acesso negado: path fora do diretório permitido');
    }
    
    return fs.readFile(resolved);
}

// ❌ ERRADO - Path sem validação
app.get('/files/:name', async (req, res) => {
    const file = await fs.readFile(`/uploads/${req.params.name}`); // Traversal!
    res.send(file);
});
```

### Python

```python
import os
from pathlib import Path

# ✅ CORRETO - Validação de path
BASE_DIR = Path('/app/uploads').resolve()

def read_file_safe(requested_path: str) -> bytes:
    # Resolver e normalizar
    resolved = (BASE_DIR / requested_path).resolve()
    
    # Verificar que está dentro do diretório base
    if not str(resolved).startswith(str(BASE_DIR)):
        raise PermissionError("Path traversal detectado")
    
    return resolved.read_bytes()

# ❌ ERRADO - Path sem validação
def read_file_unsafe(filename: str) -> bytes:
    return open(f"/uploads/{filename}", "rb").read()  # Traversal!
```

### Swift

```swift
// ✅ CORRETO - Validação de path
func readFileSafe(requestedPath: String, baseDir: String) throws -> Data {
    let base = URL(fileURLWithPath: baseDir).standardized
    let resolved = URL(fileURLWithPath: requestedPath, relativeTo: base).standardized
    
    guard resolved.path.hasPrefix(base.path) else {
        throw FileError.pathTraversal
    }
    
    return try Data(contentsOf: resolved)
}
```

### Kotlin

```kotlin
// ✅ CORRETO - Validação de path
fun readFileSafe(requestedPath: String, baseDir: Path): ByteArray {
    val resolved = baseDir.resolve(requestedPath).normalize()
    
    require(resolved.startsWith(baseDir)) { "Path traversal detectado" }
    
    return Files.readAllBytes(resolved)
}
```

### Bash/Shell

```bash
# ✅ CORRETO - Validar path com realpath
read_file_safe() {
    local base_dir="/app/uploads"
    local requested="$1"
    
    # Resolver path real
    local resolved
    resolved=$(realpath -m "$base_dir/$requested")
    
    # Verificar que está dentro do diretório base
    if [[ "$resolved" != "$base_dir"* ]]; then
        echo "ERRO: Path traversal detectado" >&2
        return 1
    fi
    
    cat "$resolved"
}

# ❌ ERRADO - Sem validação
cat "/uploads/$user_input"  # Path traversal!
```

## Referências
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [OWASP Path Traversal](https://owasp.org/www-community/attacks/Path_Traversal)
