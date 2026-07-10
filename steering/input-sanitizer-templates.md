---
inclusion: manual
description: "Templates de InputSanitizer prontos para uso. Referência para garantir consistência entre projetos. Use #input-sanitizer-templates quando precisar criar sanitizadores."
---

# InputSanitizer — Templates por Linguagem

> Todo projeto DEVE ter um InputSanitizer centralizado. Use estes templates como base para garantir consistência.

---

## TypeScript / JavaScript

```typescript
/**
 * InputSanitizer — Sanitização centralizada de input
 * Uso: importar e aplicar ANTES de qualquer processamento de dados externos.
 */
export class InputSanitizer {
  /**
   * Sanitização genérica: trim + limitar tamanho + remover caracteres de controle
   */
  static sanitize(input: unknown, maxLength: number): string {
    if (input === null || input === undefined) return '';
    const str = String(input);
    // Remove caracteres de controle (exceto espaço, tab, newline)
    const cleaned = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    return cleaned.trim().substring(0, maxLength);
  }

  /**
   * Sanitização para contexto HTML: escape de entidades
   */
  static sanitizeForHtml(input: unknown, maxLength: number): string {
    const sanitized = this.sanitize(input, maxLength);
    return sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  /**
   * Sanitização para logs: remove CRLF (previne log injection) + limita tamanho
   */
  static sanitizeForLog(input: unknown, maxLength: number = 200): string {
    const sanitized = this.sanitize(input, maxLength);
    return sanitized.replace(/[\r\n]/g, ' ');
  }

  /**
   * Validação de email (formato básico)
   */
  static isValidEmail(input: string): boolean {
    const sanitized = this.sanitize(input, 255);
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized);
  }

  /**
   * Sanitização de UUID (apenas caracteres válidos)
   */
  static sanitizeUuid(input: unknown): string {
    const str = String(input ?? '');
    return str.replace(/[^a-fA-F0-9-]/g, '').substring(0, 36);
  }

  /**
   * Sanitização de inteiro (retorna NaN se inválido)
   */
  static sanitizeInt(input: unknown): number {
    const num = Number(input);
    if (!Number.isInteger(num) || num > Number.MAX_SAFE_INTEGER) return NaN;
    return num;
  }
}
```

---

## Java

```java
import java.util.regex.Pattern;

/**
 * InputSanitizer — Sanitização centralizada de input
 * Uso: aplicar ANTES de qualquer processamento de dados externos.
 */
public final class InputSanitizer {

    private static final Pattern CONTROL_CHARS = Pattern.compile("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]");
    private static final Pattern CRLF = Pattern.compile("[\\r\\n]");
    private static final Pattern UUID_INVALID = Pattern.compile("[^a-fA-F0-9\\-]");

    private InputSanitizer() {}

    /**
     * Sanitização genérica: trim + limitar tamanho + remover caracteres de controle
     */
    public static String sanitize(String input, int maxLength) {
        if (input == null) return "";
        String cleaned = CONTROL_CHARS.matcher(input).replaceAll("");
        cleaned = cleaned.trim();
        return cleaned.length() > maxLength ? cleaned.substring(0, maxLength) : cleaned;
    }

    /**
     * Sanitização para contexto HTML: escape de entidades
     */
    public static String sanitizeForHtml(String input, int maxLength) {
        String sanitized = sanitize(input, maxLength);
        return sanitized
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#x27;");
    }

    /**
     * Sanitização para logs: remove CRLF (previne log injection) + limita tamanho
     */
    public static String sanitizeForLog(String input, int maxLength) {
        String sanitized = sanitize(input, Math.min(maxLength, 200));
        return CRLF.matcher(sanitized).replaceAll(" ");
    }

    /**
     * Sanitização de UUID (apenas caracteres válidos)
     */
    public static String sanitizeUuid(String input) {
        if (input == null) return "";
        String cleaned = UUID_INVALID.matcher(input).replaceAll("");
        return cleaned.length() > 36 ? cleaned.substring(0, 36) : cleaned;
    }

    /**
     * Sanitização de inteiro com bounds check
     */
    public static int sanitizeInt(String input, int min, int max) {
        if (input == null) throw new IllegalArgumentException("Input cannot be null");
        try {
            int value = Integer.parseInt(input.trim());
            if (value < min || value > max) {
                throw new IllegalArgumentException("Value out of range: " + min + "-" + max);
            }
            return value;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid integer input");
        }
    }
}
```

---

## Python

```python
"""
InputSanitizer — Sanitização centralizada de input.
Uso: aplicar ANTES de qualquer processamento de dados externos.
"""
import re
from typing import Optional

_CONTROL_CHARS = re.compile(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]')
_CRLF = re.compile(r'[\r\n]')
_UUID_INVALID = re.compile(r'[^a-fA-F0-9\-]')


class InputSanitizer:
    """Sanitizador centralizado — usar em todo input de fonte externa."""

    @staticmethod
    def sanitize(input_val: Optional[str], max_length: int) -> str:
        """Sanitização genérica: trim + limitar tamanho + remover controle."""
        if input_val is None:
            return ""
        cleaned = _CONTROL_CHARS.sub("", str(input_val))
        return cleaned.strip()[:max_length]

    @staticmethod
    def sanitize_for_html(input_val: Optional[str], max_length: int) -> str:
        """Escape HTML para prevenir XSS."""
        sanitized = InputSanitizer.sanitize(input_val, max_length)
        return (
            sanitized
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
            .replace("'", "&#x27;")
        )

    @staticmethod
    def sanitize_for_log(input_val: Optional[str], max_length: int = 200) -> str:
        """Remove CRLF para prevenir log injection."""
        sanitized = InputSanitizer.sanitize(input_val, max_length)
        return _CRLF.sub(" ", sanitized)

    @staticmethod
    def sanitize_uuid(input_val: Optional[str]) -> str:
        """Apenas caracteres válidos de UUID."""
        if input_val is None:
            return ""
        cleaned = _UUID_INVALID.sub("", str(input_val))
        return cleaned[:36]

    @staticmethod
    def sanitize_int(input_val: Optional[str], min_val: int, max_val: int) -> int:
        """Inteiro com bounds check."""
        if input_val is None:
            raise ValueError("Input cannot be None")
        try:
            value = int(str(input_val).strip())
        except (ValueError, TypeError) as exc:
            raise ValueError("Invalid integer input") from exc
        if value < min_val or value > max_val:
            raise ValueError(f"Value out of range: {min_val}-{max_val}")
        return value
```

---

## C# (.NET)

```csharp
using System;
using System.Text.RegularExpressions;

/// <summary>
/// InputSanitizer — Sanitização centralizada de input.
/// Uso: aplicar ANTES de qualquer processamento de dados externos.
/// </summary>
public static class InputSanitizer
{
    private static readonly Regex ControlChars = new(@"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", RegexOptions.Compiled);
    private static readonly Regex CrLf = new(@"[\r\n]", RegexOptions.Compiled);
    private static readonly Regex UuidInvalid = new(@"[^a-fA-F0-9\-]", RegexOptions.Compiled);

    /// <summary>
    /// Sanitização genérica: trim + limitar tamanho + remover caracteres de controle.
    /// </summary>
    public static string Sanitize(string? input, int maxLength)
    {
        if (string.IsNullOrEmpty(input)) return string.Empty;
        var cleaned = ControlChars.Replace(input, string.Empty).Trim();
        return cleaned.Length > maxLength ? cleaned[..maxLength] : cleaned;
    }

    /// <summary>
    /// Escape HTML para prevenir XSS.
    /// </summary>
    public static string SanitizeForHtml(string? input, int maxLength)
    {
        var sanitized = Sanitize(input, maxLength);
        return sanitized
            .Replace("&", "&amp;")
            .Replace("<", "&lt;")
            .Replace(">", "&gt;")
            .Replace("\"", "&quot;")
            .Replace("'", "&#x27;");
    }

    /// <summary>
    /// Remove CRLF para prevenir log injection.
    /// </summary>
    public static string SanitizeForLog(string? input, int maxLength = 200)
    {
        var sanitized = Sanitize(input, Math.Min(maxLength, 200));
        return CrLf.Replace(sanitized, " ");
    }

    /// <summary>
    /// Apenas caracteres válidos de UUID.
    /// </summary>
    public static string SanitizeUuid(string? input)
    {
        if (string.IsNullOrEmpty(input)) return string.Empty;
        var cleaned = UuidInvalid.Replace(input, string.Empty);
        return cleaned.Length > 36 ? cleaned[..36] : cleaned;
    }

    /// <summary>
    /// Inteiro com bounds check.
    /// </summary>
    public static int SanitizeInt(string? input, int min, int max)
    {
        if (string.IsNullOrWhiteSpace(input))
            throw new ArgumentException("Input cannot be null or empty");

        if (!int.TryParse(input.Trim(), out var value))
            throw new ArgumentException("Invalid integer input");

        if (value < min || value > max)
            throw new ArgumentOutOfRangeException(nameof(input), $"Value out of range: {min}-{max}");

        return value;
    }
}
```

---

## Uso Recomendado

### Em Controllers/Handlers

```typescript
// TypeScript/NestJS exemplo
@Post()
async createUser(@Body() dto: CreateUserDto) {
  const name = InputSanitizer.sanitize(dto.name, 100);
  const email = InputSanitizer.sanitize(dto.email, 255);
  // ... processar com valores sanitizados
}
```

```java
// Java/Spring Boot exemplo
@PostMapping("/users")
public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest dto) {
    String name = InputSanitizer.sanitize(dto.getName(), 100);
    String email = InputSanitizer.sanitize(dto.getEmail(), 255);
    // ... processar com valores sanitizados
}
```

### Em Logs

```typescript
logger.info('User action', {
  userId: user.id,
  input: InputSanitizer.sanitizeForLog(userInput, 200)
});
```

### Em Respostas HTML

```typescript
const safeContent = InputSanitizer.sanitizeForHtml(userContent, 2000);
```
