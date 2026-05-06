# Políticas de Segurança - Todo Input é Malicioso

> Princípio fundamental: TODA entrada do usuário é potencialmente maliciosa e DEVE ser tratada como tal.

## REGRA ABSOLUTA

Todo dado que entra no sistema vindo de fonte externa (usuário, API, arquivo, banco, header, cookie, query param, path param, body) DEVE obrigatoriamente:

1. **Ter limite de caracteres** (maxLength/Size) definido explicitamente
2. **Passar por função de sanitização** antes de qualquer uso
3. **Ser validado contra formato esperado** (whitelist, regex, tipo)
4. **Nunca ser confiado** mesmo que venha de fonte "interna"

## Limites de Caracteres OBRIGATÓRIOS

| Campo | Limite Máximo |
|---|---|
| Nome/título | 100 caracteres |
| Email | 255 caracteres |
| Senha | 128 caracteres |
| Descrição/bio | 500 caracteres |
| Comentário/texto livre | 2.000 caracteres |
| URL | 2.048 caracteres |
| Telefone | 20 caracteres |
| CEP/código postal | 10 caracteres |
| CPF/documento | 14 caracteres |
| Query de busca | 200 caracteres |
| Path parameter | 100 caracteres |
| Header customizado | 500 caracteres |
| Upload filename | 255 caracteres |
| JSON body total | 1 MB |
| Arquivo upload | 10 MB (configurável) |

## Implementação por Linguagem

### C# (.NET)

```csharp
// ✅ CORRETO - Toda entrada com limite + sanitização
public record CreateUserRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    [RegularExpression(@"^[a-zA-ZÀ-ÿ\s]+$")]
    public string Name { get; init; } = default!;

    [Required]
    [StringLength(255)]
    [EmailAddress]
    public string Email { get; init; } = default!;

    [Required]
    [StringLength(128, MinimumLength = 8)]
    public string Password { get; init; } = default!;
}

// ✅ CORRETO - Sanitização centralizada
public static class InputSanitizer
{
    public static string Sanitize(string? input, int maxLength = 500)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;
        
        // 1. Limitar tamanho
        var limited = input.Length > maxLength ? input[..maxLength] : input;
        
        // 2. Remover caracteres de controle
        limited = Regex.Replace(limited, @"[\x00-\x1F\x7F]", "");
        
        // 3. Trim
        return limited.Trim();
    }
    
    public static string SanitizeForHtml(string? input, int maxLength = 500)
    {
        var sanitized = Sanitize(input, maxLength);
        return HtmlEncoder.Default.Encode(sanitized);
    }
    
    public static string SanitizeForLog(string? input, int maxLength = 200)
    {
        var sanitized = Sanitize(input, maxLength);
        return sanitized.Replace("\r", "_").Replace("\n", "_").Replace("\t", "_");
    }
}

// ✅ CORRETO - Uso no controller
[HttpPost]
public IActionResult Create([FromBody] CreateUserRequest request)
{
    var safeName = InputSanitizer.Sanitize(request.Name, 100);
    var safeEmail = InputSanitizer.Sanitize(request.Email, 255);
    return Ok(service.Create(safeName, safeEmail));
}
```

### Java

```java
// ✅ CORRETO - Record com validação completa
public record CreateUserRequest(
    @NotBlank @Size(max = 100)
    @Pattern(regexp = "^[a-zA-ZÀ-ÿ\\s]+$")
    String name,
    
    @NotBlank @Size(max = 255) @Email
    String email,
    
    @NotBlank @Size(min = 8, max = 128)
    String password,
    
    @Size(max = 500)
    String bio
) {}

// ✅ CORRETO - Classe de sanitização centralizada
@Component
public class InputSanitizer {
    
    public String sanitize(String input, int maxLength) {
        if (input == null || input.isBlank()) return "";
        
        // 1. Limitar tamanho
        String limited = input.length() > maxLength 
            ? input.substring(0, maxLength) : input;
        
        // 2. Remover caracteres de controle
        limited = limited.replaceAll("[\\x00-\\x1F\\x7F]", "");
        
        // 3. Trim
        return limited.trim();
    }
    
    public String sanitizeForLog(String input) {
        return sanitize(input, 200).replaceAll("[\\r\\n\\t]", "_");
    }
    
    public String sanitizeForHtml(String input, int maxLength) {
        String safe = sanitize(input, maxLength);
        return HtmlUtils.htmlEscape(safe);
    }
}

// ✅ CORRETO - Controller com validação
@PostMapping("/users")
public ResponseEntity<UserDTO> create(@Valid @RequestBody CreateUserRequest request) {
    String safeName = sanitizer.sanitize(request.name(), 100);
    return ResponseEntity.status(201).body(userService.create(safeName, request.email()));
}

// ✅ CORRETO - Query params com limite
@GetMapping("/search")
public Page<ResultDTO> search(
        @RequestParam @Size(max = 200) String query,
        @RequestParam(defaultValue = "0") @Min(0) int page,
        @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
    String safeQuery = sanitizer.sanitize(query, 200);
    return searchService.search(safeQuery, PageRequest.of(page, size));
}
```

### TypeScript / JavaScript

```typescript
// ✅ CORRETO - Validação com zod + sanitização
import { z } from 'zod';
import DOMPurify from 'dompurify';

const CreateUserSchema = z.object({
    name: z.string().min(2).max(100).regex(/^[a-zA-ZÀ-ÿ\s]+$/),
    email: z.string().email().max(255),
    password: z.string().min(8).max(128),
    bio: z.string().max(500).optional(),
});

// ✅ CORRETO - Sanitizador centralizado
class InputSanitizer {
    static sanitize(input: unknown, maxLength: number = 500): string {
        if (typeof input !== 'string') return '';
        
        // 1. Limitar tamanho
        let safe = input.slice(0, maxLength);
        
        // 2. Remover caracteres de controle
        safe = safe.replace(/[\x00-\x1F\x7F]/g, '');
        
        // 3. Trim
        return safe.trim();
    }
    
    static sanitizeForHtml(input: string, maxLength: number = 500): string {
        const safe = this.sanitize(input, maxLength);
        return safe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    }
    
    static sanitizeForLog(input: string, maxLength: number = 200): string {
        return this.sanitize(input, maxLength).replace(/[\r\n\t]/g, '_');
    }
    
    static sanitizeRichHtml(input: string, maxLength: number = 2000): string {
        const limited = input.slice(0, maxLength);
        return DOMPurify.sanitize(limited, { ALLOWED_TAGS: ['b', 'i', 'p', 'a', 'br'] });
    }
}

// ✅ CORRETO - Express com limites globais
import express from 'express';
const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: false }));
```

### Python

```python
# ✅ CORRETO - Sanitizador centralizado
import re
from typing import Optional

class InputSanitizer:
    @staticmethod
    def sanitize(input_value: Optional[str], max_length: int = 500) -> str:
        if not input_value or not isinstance(input_value, str):
            return ""
        
        # 1. Limitar tamanho
        limited = input_value[:max_length]
        
        # 2. Remover caracteres de controle
        limited = re.sub(r'[\x00-\x1f\x7f]', '', limited)
        
        # 3. Trim
        return limited.strip()
    
    @staticmethod
    def sanitize_for_log(input_value: str, max_length: int = 200) -> str:
        safe = InputSanitizer.sanitize(input_value, max_length)
        return re.sub(r'[\r\n\t]', '_', safe)
    
    @staticmethod
    def sanitize_for_html(input_value: str, max_length: int = 500) -> str:
        from markupsafe import escape
        safe = InputSanitizer.sanitize(input_value, max_length)
        return str(escape(safe))

# ✅ CORRETO - Pydantic com limites
from pydantic import BaseModel, Field, field_validator

class CreateUserRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    bio: str = Field(default="", max_length=500)
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        sanitized = InputSanitizer.sanitize(v, 100)
        if not re.match(r'^[a-zA-ZÀ-ÿ\s]+$', sanitized):
            raise ValueError('Nome contém caracteres inválidos')
        return sanitized
```

### Swift

```swift
// ✅ CORRETO - Sanitizador centralizado
struct InputSanitizer {
    static func sanitize(_ input: String?, maxLength: Int = 500) -> String {
        guard let input = input, !input.isEmpty else { return "" }
        
        // 1. Limitar tamanho
        let limited = String(input.prefix(maxLength))
        
        // 2. Remover caracteres de controle
        let safe = limited.unicodeScalars.filter { $0.value >= 0x20 && $0.value != 0x7F }
        
        // 3. Trim
        return String(String.UnicodeScalarView(safe)).trimmingCharacters(in: .whitespacesAndNewlines)
    }
    
    static func sanitizeForLog(_ input: String, maxLength: Int = 200) -> String {
        return sanitize(input, maxLength: maxLength)
            .replacingOccurrences(of: "\r", with: "_")
            .replacingOccurrences(of: "\n", with: "_")
    }
}
```

### Kotlin

```kotlin
// ✅ CORRETO - Sanitizador centralizado
object InputSanitizer {
    fun sanitize(input: String?, maxLength: Int = 500): String {
        if (input.isNullOrBlank()) return ""
        
        return input
            .take(maxLength)
            .replace(Regex("[\\x00-\\x1F\\x7F]"), "")
            .trim()
    }
    
    fun sanitizeForLog(input: String, maxLength: Int = 200): String {
        return sanitize(input, maxLength).replace(Regex("[\\r\\n\\t]"), "_")
    }
}
```

### PowerShell

```powershell
# ✅ CORRETO - Sanitização de input
function Invoke-Sanitize {
    param(
        [string]$Input,
        [int]$MaxLength = 500
    )
    
    if ([string]::IsNullOrWhiteSpace($Input)) { return "" }
    
    $safe = $Input.Substring(0, [Math]::Min($Input.Length, $MaxLength))
    $safe = $safe -replace '[\x00-\x1F\x7F]', ''
    return $safe.Trim()
}
```

### Bash/Shell

```bash
# ✅ CORRETO - Sanitização de input
sanitize_input() {
    local input="$1"
    local max_length="${2:-500}"
    
    local safe="${input:0:$max_length}"
    safe=$(echo "$safe" | tr -d '\000-\037\177')
    safe=$(echo "$safe" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    
    echo "$safe"
}
```

## Configuração de Limites no Servidor

```yaml
# Spring Boot
server:
  tomcat:
    max-http-form-post-size: 1MB
    max-swallow-size: 1MB
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB
spring:
  jackson:
    deserialization:
      fail-on-unknown-properties: true
```

## Referências
- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
