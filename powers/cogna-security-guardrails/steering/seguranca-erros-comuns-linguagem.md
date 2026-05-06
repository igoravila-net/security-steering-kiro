---
inclusion: auto
---

# Erros Comuns de Segurança por Linguagem

> Padrões vulneráveis mais frequentes em cada linguagem homologada. Detectar e bloquear proativamente.

## JavaScript / TypeScript
- Prototype pollution via merge/extend com input do usuário → Validar schema antes
- eval(), Function(), setTimeout(string) com dados externos → NUNCA
- innerHTML sem DOMPurify → Usar textContent ou sanitizar
- Template literals em SQL → Usar consultas parametrizadas
- require() dinâmico com input → Whitelist de módulos
- ReDoS com input longo → Limitar tamanho antes de regex
- Tokens em localStorage → HttpOnly cookies ou memória
- Math.random() para segurança → crypto.randomBytes()

## Java / Kotlin
- Concatenação em JPQL/HQL → @Query com @Param
- ObjectInputStream sem filtro → ObjectInputFilter com whitelist
- Jackson enableDefaultTyping() → NUNCA habilitar
- Log4j versões antigas → Log4j2 >= 2.24
- File/Path sem normalização → normalize() + startsWith(base)
- URL sem validação (SSRF) → Whitelist de hosts
- XML sem desabilitar DTD (XXE) → Desabilitar features perigosas
- ScriptEngine.eval() com input → Whitelist de operações
- Class.forName(userInput) → NUNCA com input externo
- Bind direto para entidade (Mass Assignment) → DTOs separados

## C# (.NET)
- String interpolation em SQL → EF/Dapper com parâmetros
- Html.Raw() com input → HtmlEncoder.Default.Encode()
- BinaryFormatter / TypeNameHandling.All → System.Text.Json
- Path.Combine sem validação → GetFullPath + StartsWith
- HttpClient sem validação de URL (SSRF) → Whitelist
- Regex sem timeout (ReDoS) → RegexOptions.MatchTimeout
- Credenciais em appsettings.json → User Secrets / Key Vault
- Cookie sem flags → Secure + HttpOnly + SameSite

## Python
- f-string em SQL → ORM ou cursor.execute com params
- eval()/exec() com input → NUNCA
- pickle.loads() com dados externos (RCE) → Usar JSON
- subprocess com shell=True → shell=False + lista de args
- Jinja2 sem autoescape (SSTI) → autoescape=True
- yaml.load() sem Loader (RCE) → yaml.safe_load()
- os.path.join sem validação → pathlib + resolve() + is_relative_to
- mark_safe() com input → NUNCA
- random.randint() para tokens → secrets.token_urlsafe()

## Swift
- UserDefaults para dados sensíveis → Keychain
- WKWebView com JS habilitado sem necessidade → Desabilitar
- Certificado SSL ignorado → NUNCA em produção
- loadHTMLString com input (XSS) → Escapar HTML
- NSLog com dados sensíveis → os_log com .private

## PowerShell
- Invoke-Expression com input → NUNCA
- Credenciais em plaintext → Get-Credential / env vars
- Write-Host com segredos → Nunca logar segredos

## Bash/Shell
- Variáveis sem aspas → SEMPRE "$var"
- eval com input → NUNCA
- Credenciais no script → Env vars ou arquivos 600
- curl -k (ignora cert) → Validar certificado
- chmod 777 → chmod 600/755 conforme necessidade
- curl URL | bash → NUNCA
