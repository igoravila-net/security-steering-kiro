# Políticas de Segurança - Cross-Site Scripting (XSS)

> Baseado em: [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Entrada do usuário renderizada sem encoding → Usar output encoding contextual
- innerHTML/dangerouslySetInnerHTML com dados não sanitizados → Usar textContent ou sanitizador
- Interpolação de dados em templates sem escape → Usar mecanismo de escape do framework
- eval() ou Function() com dados externos → Nunca executar código dinâmico de entrada

## C# (.NET)

```csharp
// ✅ CORRETO - Razor escapa automaticamente
// @Model.UserName ← escape automático em Razor

// ✅ CORRETO - Encoding manual quando necessário
using System.Text.Encodings.Web;

public class SafeRenderer
{
    private readonly HtmlEncoder _htmlEncoder;

    public SafeRenderer(HtmlEncoder htmlEncoder)
    {
        _htmlEncoder = htmlEncoder;
    }

    public string RenderSafe(string userInput)
    {
        return _htmlEncoder.Encode(userInput);
    }
}

// ✅ CORRETO - Content Security Policy em ASP.NET Core
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self'");
    await next();
});

// ❌ ERRADO - Html.Raw com entrada do usuário
@Html.Raw(Model.UserComment) // XSS!
```

## Java

```java
// ✅ CORRETO - OWASP Java HTML Sanitizer
import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;

public class XssProtection {
    private static final PolicyFactory POLICY = new HtmlPolicyBuilder()
        .allowElements("p", "b", "i", "em", "strong")
        .allowAttributes("href").onElements("a")
        .allowUrlProtocols("https")
        .toFactory();

    public String sanitize(String untrusted) {
        return POLICY.sanitize(untrusted);
    }
}

// ✅ CORRETO - Thymeleaf escape automático
// <p th:text="${userInput}">seguro</p>

// ❌ ERRADO - th:utext com entrada não sanitizada
// <p th:utext="${userInput}">XSS!</p>
```

## TypeScript / JavaScript

```typescript
// ✅ CORRETO - React escapa por padrão
function SafeComponent({ name }: { name: string }) {
    return <span>{name}</span>; // Escape automático
}

// ✅ CORRETO - Sanitização com DOMPurify quando HTML é necessário
import DOMPurify from 'dompurify';

function RichContent({ html }: { html: string }) {
    const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: ['b', 'i', 'p', 'a'] });
    return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}

// ✅ CORRETO - Angular (escape automático por padrão)
// {{ userInput }} ← Angular escapa automaticamente

// ✅ CORRETO - Inserção segura no DOM vanilla
function displayMessage(message: string): void {
    const el = document.getElementById('output');
    if (el) el.textContent = message; // textContent não interpreta HTML
}

// ❌ ERRADO - innerHTML com dados do usuário
document.getElementById('output')!.innerHTML = userInput; // XSS!

// ❌ ERRADO - dangerouslySetInnerHTML sem sanitização
<div dangerouslySetInnerHTML={{ __html: userInput }} /> // XSS!
```

## HTML

```html
<!-- ✅ CORRETO - Usar atributos de dados, não inline scripts -->
<button data-action="submit" data-id="123">Enviar</button>

<!-- ✅ CORRETO - CSP via meta tag -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'; style-src 'self'">

<!-- ❌ ERRADO - Event handlers inline com dados dinâmicos -->
<button onclick="doAction('USER_INPUT_HERE')">Click</button>

<!-- ❌ ERRADO - javascript: em href -->
<a href="javascript:alert(document.cookie)">Link</a>
```

## Swift (iOS)

```swift
// ✅ CORRETO - WKWebView com configuração segura
import WebKit

class SafeWebView {
    func createSecureWebView() -> WKWebView {
        let config = WKWebViewConfiguration()
        let prefs = WKPreferences()
        prefs.javaScriptEnabled = false // Desabilitar JS se não necessário
        config.preferences = prefs
        
        return WKWebView(frame: .zero, configuration: config)
    }
    
    // ✅ CORRETO - Escapar dados antes de injetar em HTML
    func escapeHtml(_ input: String) -> String {
        return input
            .replacingOccurrences(of: "&", with: "&amp;")
            .replacingOccurrences(of: "<", with: "&lt;")
            .replacingOccurrences(of: ">", with: "&gt;")
            .replacingOccurrences(of: "\"", with: "&quot;")
            .replacingOccurrences(of: "'", with: "&#x27;")
    }
}

// ❌ ERRADO - Injetar dados do usuário em HTML sem escape
webView.loadHTMLString("<h1>\(userInput)</h1>", baseURL: nil) // XSS!
```

## Kotlin (Android)

```kotlin
// ✅ CORRETO - WebView com configuração segura
class SafeWebViewActivity : AppCompatActivity() {
    
    fun setupSecureWebView(webView: WebView) {
        webView.settings.apply {
            javaScriptEnabled = false // Desabilitar se não necessário
            allowFileAccess = false
            allowContentAccess = false
        }
        
        // Não expor interfaces Java ao JavaScript
        // webView.addJavascriptInterface(...) ← evitar
    }
    
    // ✅ CORRETO - Escape de HTML
    fun escapeHtml(input: String): String {
        return android.text.Html.escapeHtml(input)
    }
}

// ❌ ERRADO - loadData com entrada não sanitizada
webView.loadData("<h1>$userInput</h1>", "text/html", "UTF-8") // XSS!
```

## Python

```python
# ✅ CORRETO - Jinja2 com autoescape (padrão no Flask)
from markupsafe import escape

@app.route('/profile')
def profile():
    name = request.args.get('name', '')
    safe_name = escape(name)  # Escape manual se necessário
    return render_template('profile.html', name=name)  # Jinja2 escapa automaticamente

# ✅ CORRETO - Django (escape automático em templates)
# {{ user_input }} ← Django escapa automaticamente

# ✅ CORRETO - Bleach para sanitização de HTML rico
import bleach

def sanitize_html(untrusted_html: str) -> str:
    return bleach.clean(
        untrusted_html,
        tags=['p', 'b', 'i', 'em', 'strong', 'a'],
        attributes={'a': ['href']},
        protocols=['https']
    )

# ❌ ERRADO - mark_safe com entrada do usuário
from django.utils.safestring import mark_safe
mark_safe(user_input)  # XSS!

# ❌ ERRADO - |safe filter com dados não sanitizados
# {{ user_input|safe }} ← XSS!
```

## Referências
- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP DOM XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html)
