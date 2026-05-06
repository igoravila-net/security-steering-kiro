# Políticas de Segurança - OAuth2 e OpenID Connect (OIDC)

> Baseado em: [OWASP OAuth2 Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html)

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Implicit flow em produção → Usar Authorization Code + PKCE
- Token armazenado em localStorage → Usar HttpOnly cookie ou secure storage
- Sem validação de state parameter → Implementar state anti-CSRF
- Redirect URI sem whitelist → Validar contra lista fixa
- Client secret exposto no frontend → Usar PKCE para SPAs
- Token sem expiração ou com TTL excessivo → Máx 15min access, 7d refresh
- Sem validação de issuer/audience no JWT → Validar sempre

## Fluxos Permitidos

| Cenário | Fluxo Obrigatório |
|---|---|
| SPA (React, Angular, Vue) | Authorization Code + PKCE |
| Mobile (iOS, Android) | Authorization Code + PKCE |
| Backend (server-to-server) | Client Credentials |
| Backend web app com sessão | Authorization Code (confidential client) |

**PROIBIDO**: Implicit Flow, Resource Owner Password Credentials (ROPC)

## Regras de Tokens

| Parâmetro | Valor Obrigatório |
|---|---|
| Access Token TTL | Máx 15 minutos |
| Refresh Token TTL | Máx 7 dias |
| ID Token TTL | Máx 1 hora |
| Algoritmo de assinatura | RS256 ou ES256 (NUNCA HS256 para APIs públicas) |
| Validar issuer | SEMPRE |
| Validar audience | SEMPRE |
| Validar expiration | SEMPRE |
| Validar nbf (not before) | SEMPRE |
| State parameter | OBRIGATÓRIO (anti-CSRF) |
| PKCE | OBRIGATÓRIO para SPAs e mobile |
| Redirect URI | Whitelist exata (sem wildcards) |

## C# (.NET)

```csharp
// ✅ CORRETO - OAuth2/OIDC em ASP.NET Core
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
})
.AddCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
})
.AddOpenIdConnect(options =>
{
    options.Authority = config["Oidc:Authority"];
    options.ClientId = config["Oidc:ClientId"];
    options.ClientSecret = config["Oidc:ClientSecret"];
    options.ResponseType = "code";
    options.UsePkce = true;
    options.SaveTokens = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromMinutes(1)
    };
});
```

## Java (Spring Security)

```java
// ✅ CORRETO - OAuth2 Resource Server com validação completa
@Bean
public JwtDecoder jwtDecoder() {
    NimbusJwtDecoder decoder = NimbusJwtDecoder
        .withIssuerLocation(issuerUri)
        .build();
    
    OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(issuerUri);
    OAuth2TokenValidator<Jwt> withAudience = new AudienceValidator(expectedAudience);
    OAuth2TokenValidator<Jwt> combined = new DelegatingOAuth2TokenValidator<>(withIssuer, withAudience);
    
    decoder.setJwtValidator(combined);
    return decoder;
}
```

## TypeScript / JavaScript

```typescript
// ✅ CORRETO - Validação de JWT no backend (Node.js)
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
    jwksUri: `${ISSUER_URL}/.well-known/jwks.json`,
    cache: true,
    rateLimit: true,
});

async function verifyToken(token: string): Promise<JwtPayload> {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) throw new Error('Token inválido');
    
    const key = await client.getSigningKey(decoded.header.kid);
    
    return jwt.verify(token, key.getPublicKey(), {
        issuer: EXPECTED_ISSUER,
        audience: EXPECTED_AUDIENCE,
        algorithms: ['RS256'],
        maxAge: '15m',
    }) as JwtPayload;
}

// ❌ ERRADO - Token em localStorage (XSS pode roubar)
// localStorage.setItem('access_token', token);

// ❌ ERRADO - Sem validação de audience/issuer
// jwt.verify(token, secret); // Sem issuer/audience!
```

## Python

```python
# ✅ CORRETO - Validação de JWT com PyJWT
import jwt
from jwt import PyJWKClient

jwks_client = PyJWKClient(f"{ISSUER}/.well-known/jwks.json")

def verify_token(token: str) -> dict:
    signing_key = jwks_client.get_signing_key_from_jwt(token)
    
    payload = jwt.decode(
        token,
        signing_key.key,
        algorithms=["RS256"],
        issuer=ISSUER,
        audience=AUDIENCE,
        options={
            "verify_exp": True,
            "verify_iss": True,
            "verify_aud": True,
            "require": ["exp", "iss", "aud", "sub"]
        }
    )
    return payload
```

## Swift (iOS)

```swift
// ✅ CORRETO - PKCE flow com ASWebAuthenticationSession
// Armazenar tokens APENAS no Keychain (NUNCA UserDefaults)
func storeToken(_ token: String) {
    KeychainHelper.save(key: "access_token", value: token)
}
```

## Kotlin (Android)

```kotlin
// ✅ CORRETO - AppAuth com PKCE
// Armazenar tokens em EncryptedSharedPreferences (NUNCA SharedPreferences plain)
val securePrefs = EncryptedSharedPreferences.create(
    context, "auth_prefs", masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)
```

## Referências
- [OWASP OAuth2 Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html)
- [OWASP JSON Web Token Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
