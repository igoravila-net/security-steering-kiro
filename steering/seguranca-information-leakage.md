# Políticas de Segurança - Information Leakage

> Baseado em: [OWASP Error Handling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html), [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Stack traces expostos ao cliente → Retornar mensagens genéricas
- Dados sensíveis em logs (senhas, tokens, PII) → Mascarar ou remover
- Headers que expõem tecnologia (Server, X-Powered-By) → Remover
- Mensagens de erro detalhadas em produção → Usar mensagens genéricas
- Comentários com informações sensíveis no código → Remover antes de commit
- Endpoints de debug acessíveis em produção → Desabilitar

## C# (.NET)

```csharp
// ✅ CORRETO - Error handling sem exposição de detalhes
[ApiController]
public class ErrorController : ControllerBase
{
    private readonly ILogger<ErrorController> _logger;

    [Route("/error")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public IActionResult HandleError()
    {
        var exception = HttpContext.Features.Get<IExceptionHandlerFeature>()?.Error;
        
        // Logar detalhes internamente
        _logger.LogError(exception, "Erro interno não tratado");
        
        // Retornar mensagem genérica ao cliente
        return Problem(
            title: "Erro interno do servidor",
            statusCode: 500,
            detail: "Ocorreu um erro inesperado. Tente novamente mais tarde."
        );
    }
}

// ✅ CORRETO - Configuração de produção
// Program.cs
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
}

// ✅ CORRETO - Remover headers de tecnologia
app.Use(async (context, next) =>
{
    context.Response.Headers.Remove("Server");
    context.Response.Headers.Remove("X-Powered-By");
    await next();
});

// ✅ CORRETO - Log sem dados sensíveis
_logger.LogInformation("Usuário {UserId} autenticado com sucesso", user.Id);

// ❌ ERRADO - Expor stack trace
catch (Exception ex)
{
    return Ok(new { error = ex.ToString() }); // Expõe internals!
}

// ❌ ERRADO - Logar dados sensíveis
_logger.LogInformation("Login: {Email} senha: {Password}", email, password);
```

## Java

```java
// ✅ CORRETO - Exception handler global
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneral(Exception ex, HttpServletRequest request) {
        // Logar detalhes internamente
        log.error("Erro não tratado em {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        
        // Retornar mensagem genérica
        return ResponseEntity.internalServerError()
            .body(new ApiError("INTERNAL_ERROR", "Erro interno do servidor", 
                              Instant.now(), request.getRequestURI()));
    }
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex, 
                                                    HttpServletRequest request) {
        return ResponseEntity.status(404)
            .body(new ApiError("NOT_FOUND", "Recurso não encontrado",
                              Instant.now(), request.getRequestURI()));
    }
}

// ✅ CORRETO - Não revelar se usuário existe
@PostMapping("/login")
public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
    // Mensagem genérica para login inválido (não revelar se email existe)
    return authService.authenticate(request)
        .map(token -> ResponseEntity.ok(new TokenResponse(token)))
        .orElse(ResponseEntity.status(401)
            .body(new ApiError("AUTH_FAILED", "Credenciais inválidas")));
}

// ❌ ERRADO - Revelar se email existe
if (!userRepository.existsByEmail(email)) {
    throw new Exception("Email não cadastrado"); // Revela informação!
}

// ❌ ERRADO - Stack trace na resposta
catch (Exception e) {
    return ResponseEntity.status(500).body(e.getStackTrace());
}
```

## TypeScript / JavaScript

```typescript
// ✅ CORRETO - Error handler em Express
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    // Logar detalhes internamente
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}:`, err.message);
    
    // Retornar mensagem genérica
    res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
    });
});

// ✅ CORRETO - Remover header X-Powered-By
app.disable('x-powered-by');

// ✅ CORRETO - Helmet para headers seguros
import helmet from 'helmet';
app.use(helmet());

// ❌ ERRADO - Expor detalhes do erro
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({ 
        error: err.message, 
        stack: err.stack  // NUNCA expor stack trace!
    });
});
```

## Python

```python
# ✅ CORRETO - Error handler em Flask
@app.errorhandler(500)
def internal_error(error):
    app.logger.error(f"Erro interno: {error}")
    return jsonify({"error": "Erro interno do servidor"}), 500

# ✅ CORRETO - Django settings de produção
# settings.py (produção)
DEBUG = False  # NUNCA True em produção
ALLOWED_HOSTS = ['app.example.com']

# ✅ CORRETO - Não revelar informações em respostas de autenticação
def login(request):
    # Mensagem genérica - não revelar se usuário existe
    return JsonResponse({"error": "Credenciais inválidas"}, status=401)

# ❌ ERRADO - DEBUG=True em produção
DEBUG = True  # Expõe código-fonte, variáveis, SQL queries!

# ❌ ERRADO - Traceback na resposta
except Exception as e:
    return JsonResponse({"error": str(e), "traceback": traceback.format_exc()}, status=500)
```

## Swift

```swift
// ✅ CORRETO - Error handling sem exposição
enum AppError: Error {
    case serverError
    case notFound
}

func handleError(_ error: Error) -> HTTPResponse {
    // Logar internamente
    Logger.error("Erro: \(error.localizedDescription)")
    
    // Retornar mensagem genérica
    return HTTPResponse(status: .internalServerError, 
                       body: ["error": "Erro interno do servidor"])
}

// ❌ ERRADO - Expor detalhes do erro ao usuário
showAlert(message: error.localizedDescription) // Pode conter info sensível
```

## Kotlin

```kotlin
// ✅ CORRETO - Error handling seguro
@ExceptionHandler(Exception::class)
fun handleException(ex: Exception, request: HttpServletRequest): ResponseEntity<ApiError> {
    logger.error("Erro em ${request.requestURI}", ex)
    
    return ResponseEntity.internalServerError()
        .body(ApiError("INTERNAL_ERROR", "Erro interno do servidor"))
}

// ❌ ERRADO - Expor mensagem da exceção
return ResponseEntity.status(500).body(mapOf("error" to ex.message)) // Info leak!
```

## YAML / JSON - Configuração

```yaml
# ✅ CORRETO - Configuração de produção
server:
  error:
    include-message: never
    include-stacktrace: never
    include-binding-errors: never
    include-exception: false

management:
  endpoint:
    health:
      show-details: never  # Não expor detalhes de health check

# ❌ ERRADO - Configuração que expõe informações
server:
  error:
    include-stacktrace: always  # Expõe stack traces!
```

## HCL (Terraform)

```hcl
# ✅ CORRETO - Marcar outputs sensíveis
output "db_password" {
  value     = aws_db_instance.main.password
  sensitive = true  # Não exibir em logs do Terraform
}

# ❌ ERRADO - Output sensível sem marcação
output "db_password" {
  value = aws_db_instance.main.password  # Aparece em plaintext nos logs!
}
```

## PowerShell

```powershell
# ✅ CORRETO - Error handling sem exposição
try {
    Invoke-RestMethod -Uri $apiUrl
} catch {
    Write-Error "Operação falhou. Verifique a conectividade."
    # Logar detalhes em arquivo seguro
    $_.Exception.Message | Out-File -Append "C:\logs\errors.log"
}

# ❌ ERRADO - Expor detalhes do erro
catch {
    Write-Host $_.Exception.ToString()  # Expõe internals!
}
```

## Bash/Shell

```bash
# ✅ CORRETO - Não expor erros detalhados
if ! result=$(curl -s -f "$API_URL" 2>/dev/null); then
    echo "Erro: operação falhou" >&2
    # Logar detalhes em arquivo seguro
    echo "[$(date)] Falha em $API_URL" >> /var/log/app/errors.log
fi

# ❌ ERRADO - Expor variáveis de ambiente
env  # Lista todas as variáveis incluindo segredos!
set -x  # Debug mode expõe comandos com senhas
```

## Referências
- [OWASP Error Handling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html)
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
