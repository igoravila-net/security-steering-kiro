# Políticas de Segurança - CRLF Injection

> Baseado em: [OWASP HTTP Response Splitting](https://owasp.org/www-community/attacks/HTTP_Response_Splitting), [OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Entrada do usuário inserida em headers HTTP sem sanitização → Remover \r\n
- Dados do usuário em respostas de redirecionamento sem validação → Validar URL
- Log injection via caracteres CRLF → Sanitizar antes de logar

## C# (.NET)

```csharp
// ✅ CORRETO - Sanitizar entrada antes de usar em headers
public class CrlfProtection
{
    public static string SanitizeHeaderValue(string input)
    {
        if (string.IsNullOrEmpty(input)) return input;
        return input.Replace("\r", "").Replace("\n", "").Replace("%0d", "").Replace("%0a", "");
    }
}

// ✅ CORRETO - Redirect seguro em ASP.NET Core
[HttpGet("redirect")]
public IActionResult SafeRedirect([FromQuery] string url)
{
    if (!Url.IsLocalUrl(url))
    {
        return BadRequest("Redirecionamento externo não permitido");
    }
    return LocalRedirect(url);
}

// ❌ ERRADO - Header com entrada do usuário sem sanitização
Response.Headers.Append("X-Custom", userInput); // CRLF Injection!
```

## Java

```java
// ✅ CORRETO - Sanitizar antes de inserir em headers
@Component
public class CrlfSanitizer {
    
    public String sanitizeForHeader(String input) {
        if (input == null) return null;
        return input.replaceAll("[\\r\\n]", "");
    }
    
    public String sanitizeForLog(String input) {
        if (input == null) return "null";
        return input.replaceAll("[\\r\\n\\t]", "_");
    }
}

// ✅ CORRETO - Redirect seguro
@GetMapping("/redirect")
public ResponseEntity<Void> safeRedirect(@RequestParam String target) {
    // Validar que é URL interna
    if (!target.startsWith("/") || target.contains("//")) {
        throw new InvalidRedirectException("URL de redirecionamento inválida");
    }
    String sanitized = target.replaceAll("[\\r\\n]", "");
    return ResponseEntity.status(302)
        .header("Location", sanitized)
        .build();
}

// ❌ ERRADO - Header com entrada direta
response.setHeader("X-User", username); // CRLF Injection!
```

## TypeScript / JavaScript

```typescript
// ✅ CORRETO - Sanitizar valores de header (Node.js/Express)
function sanitizeHeaderValue(value: string): string {
    return value.replace(/[\r\n\x00]/g, '');
}

// ✅ CORRETO - Redirect seguro em Express
app.get('/redirect', (req: Request, res: Response) => {
    const target = req.query.url as string;
    
    // Validar URL interna
    if (!target || !target.startsWith('/') || target.includes('//')) {
        return res.status(400).json({ error: 'URL inválida' });
    }
    
    const safe = target.replace(/[\r\n]/g, '');
    res.redirect(safe);
});

// ❌ ERRADO - Setar header com entrada do usuário
res.setHeader('X-Custom', req.query.value); // CRLF Injection!
```

## Python

```python
# ✅ CORRETO - Sanitizar para headers
import re

def sanitize_header_value(value: str) -> str:
    return re.sub(r'[\r\n\x00]', '', value)

# ✅ CORRETO - Redirect seguro em Flask
from urllib.parse import urlparse

@app.route('/redirect')
def safe_redirect():
    target = request.args.get('url', '/')
    parsed = urlparse(target)
    
    # Apenas redirecionamentos internos
    if parsed.netloc or parsed.scheme:
        abort(400, "Redirecionamento externo não permitido")
    
    safe_target = target.replace('\r', '').replace('\n', '')
    return redirect(safe_target)

# ❌ ERRADO - Header com entrada do usuário
response.headers['X-Custom'] = user_input  # CRLF Injection!
```

## Swift

```swift
// ✅ CORRETO - Sanitizar valores de header
func sanitizeHeaderValue(_ input: String) -> String {
    return input.replacingOccurrences(of: "\r", with: "")
               .replacingOccurrences(of: "\n", with: "")
}
```

## Kotlin

```kotlin
// ✅ CORRETO - Sanitizar valores de header
fun sanitizeHeaderValue(input: String): String {
    return input.replace(Regex("[\\r\\n\\x00]"), "")
}
```

## PowerShell

```powershell
# ✅ CORRETO - Sanitizar entrada antes de usar em logs ou headers
function Remove-CrlfChars {
    param([string]$Input)
    return $Input -replace '[\r\n]', ''
}

# ❌ ERRADO - Entrada direta em output
Write-Host "User: $userInput"  # Log injection se contém CRLF
```

## Bash/Shell

```bash
# ✅ CORRETO - Sanitizar entrada
sanitize_input() {
    echo "$1" | tr -d '\r\n'
}

# ✅ CORRETO - Validar antes de usar em curl headers
safe_header=$(echo "$user_input" | tr -d '\r\n\0')
curl -H "X-Custom: $safe_header" https://api.example.com

# ❌ ERRADO - Entrada direta em header
curl -H "X-Custom: $user_input" https://api.example.com  # CRLF Injection!
```

## Referências
- [OWASP HTTP Response Splitting](https://owasp.org/www-community/attacks/HTTP_Response_Splitting)
- [OWASP Unvalidated Redirects](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html)
