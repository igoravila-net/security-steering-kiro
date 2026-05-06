# Políticas de Segurança - Cryptographic Issues (Multilinguagem)

> Baseado em: [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html), [OWASP Key Management](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Algoritmos obsoletos (MD5, SHA-1, DES, RC4, 3DES) → Usar AES-256-GCM, SHA-256+
- Chaves hardcoded no código → Usar vault/variáveis de ambiente
- ECB mode → Usar GCM ou CBC com HMAC
- Random inseguro para criptografia → Usar CSPRNG
- Certificados auto-assinados em produção → Usar CA confiável
- Desabilitar verificação de certificado → Nunca desabilitar em produção

## C# (.NET)

```csharp
// ✅ CORRETO - AES-256-GCM
using System.Security.Cryptography;

public class SecureEncryption
{
    public (byte[] ciphertext, byte[] nonce, byte[] tag) Encrypt(byte[] plaintext, byte[] key)
    {
        using var aes = new AesGcm(key, tagSizeInBytes: 16);
        var nonce = new byte[AesGcm.NonceByteSizes.MaxSize]; // 12 bytes
        RandomNumberGenerator.Fill(nonce);
        
        var ciphertext = new byte[plaintext.Length];
        var tag = new byte[16];
        
        aes.Encrypt(nonce, plaintext, ciphertext, tag);
        return (ciphertext, nonce, tag);
    }
    
    // ✅ CORRETO - Geração segura de números aleatórios
    public string GenerateSecureToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes);
    }
}

// ✅ CORRETO - Hash seguro para integridade
public string ComputeHash(string data)
{
    var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(data));
    return Convert.ToHexString(bytes);
}

// ❌ ERRADO - MD5 para qualquer propósito de segurança
using var md5 = MD5.Create();
var hash = md5.ComputeHash(data); // MD5 é quebrado!

// ❌ ERRADO - Random não criptográfico
var random = new Random();
var token = random.Next().ToString(); // Previsível!
```

## Java

```java
// ✅ CORRETO - AES-256-GCM
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;

public class SecureEncryption {
    
    public byte[] encrypt(byte[] plaintext, byte[] key) throws Exception {
        byte[] iv = new byte[12];
        SecureRandom.getInstanceStrong().nextBytes(iv);
        
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, 
            new SecretKeySpec(key, "AES"), 
            new GCMParameterSpec(128, iv));
        
        byte[] ciphertext = cipher.doFinal(plaintext);
        // Concatenar IV + ciphertext
        byte[] result = new byte[iv.length + ciphertext.length];
        System.arraycopy(iv, 0, result, 0, iv.length);
        System.arraycopy(ciphertext, 0, result, iv.length, ciphertext.length);
        return result;
    }
}

// ❌ ERRADO - ECB mode
Cipher.getInstance("AES/ECB/PKCS5Padding"); // ECB não é seguro!

// ❌ ERRADO - DES
Cipher.getInstance("DES/CBC/PKCS5Padding"); // DES é obsoleto!
```

## TypeScript / JavaScript

```typescript
// ✅ CORRETO - Web Crypto API (browser)
async function encryptData(plaintext: string, key: CryptoKey): Promise<ArrayBuffer> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);
    
    const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoded
    );
    
    // Concatenar IV + ciphertext
    const result = new Uint8Array(iv.length + ciphertext.byteLength);
    result.set(iv);
    result.set(new Uint8Array(ciphertext), iv.length);
    return result.buffer;
}

// ✅ CORRETO - Node.js crypto
import { createCipheriv, randomBytes, scryptSync } from 'crypto';

function encrypt(plaintext: string, password: string): string {
    const salt = randomBytes(16);
    const key = scryptSync(password, salt, 32);
    const iv = randomBytes(12);
    
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    
    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
}

// ✅ CORRETO - Token seguro
function generateToken(): string {
    return randomBytes(32).toString('hex');
}

// ❌ ERRADO - Math.random para tokens
const token = Math.random().toString(36); // Previsível!

// ❌ ERRADO - crypto-js com configuração insegura
CryptoJS.AES.encrypt(data, 'hardcoded-key'); // Chave hardcoded!
```

## Python

```python
# ✅ CORRETO - Cryptography library com AES-GCM
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

def encrypt(plaintext: bytes, key: bytes) -> bytes:
    nonce = os.urandom(12)  # 96 bits
    aesgcm = AESGCM(key)
    ciphertext = aesgcm.encrypt(nonce, plaintext, None)
    return nonce + ciphertext

def decrypt(data: bytes, key: bytes) -> bytes:
    nonce = data[:12]
    ciphertext = data[12:]
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(nonce, ciphertext, None)

# ✅ CORRETO - Token seguro
import secrets
token = secrets.token_urlsafe(32)

# ❌ ERRADO - random para segurança
import random
token = str(random.randint(0, 999999))  # Previsível!

# ❌ ERRADO - hashlib MD5 para segurança
import hashlib
hashlib.md5(password.encode()).hexdigest()  # MD5 é quebrado!
```

## Swift

```swift
// ✅ CORRETO - CryptoKit para criptografia
import CryptoKit

func encrypt(data: Data, key: SymmetricKey) throws -> Data {
    let sealedBox = try AES.GCM.seal(data, using: key)
    return sealedBox.combined!
}

func decrypt(combined: Data, key: SymmetricKey) throws -> Data {
    let sealedBox = try AES.GCM.SealedBox(combined: combined)
    return try AES.GCM.open(sealedBox, using: key)
}

// ✅ CORRETO - Geração segura de chave
let key = SymmetricKey(size: .bits256)

// ✅ CORRETO - Hash seguro
func sha256(_ input: String) -> String {
    let data = Data(input.utf8)
    let hash = SHA256.hash(data: data)
    return hash.map { String(format: "%02x", $0) }.joined()
}
```

## Kotlin

```kotlin
// ✅ CORRETO - AES-GCM
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec
import java.security.SecureRandom

fun encrypt(plaintext: ByteArray, key: ByteArray): ByteArray {
    val iv = ByteArray(12)
    SecureRandom.getInstanceStrong().nextBytes(iv)
    
    val cipher = Cipher.getInstance("AES/GCM/NoPadding")
    cipher.init(Cipher.ENCRYPT_MODE, SecretKeySpec(key, "AES"), GCMParameterSpec(128, iv))
    
    val ciphertext = cipher.doFinal(plaintext)
    return iv + ciphertext
}

// ❌ ERRADO - Chave hardcoded
val SECRET_KEY = "minha-chave-secreta-123" // NUNCA!
```

## PowerShell

```powershell
# ✅ CORRETO - Usar .NET crypto
function New-SecureToken {
    $bytes = [byte[]]::new(32)
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    return [Convert]::ToBase64String($bytes)
}

# ✅ CORRETO - Hash seguro
function Get-SecureHash {
    param([string]$Input)
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Input)
    $hash = $sha256.ComputeHash($bytes)
    return [BitConverter]::ToString($hash) -replace '-', ''
}

# ❌ ERRADO - Senha em plaintext no script
$password = "MinhaSenh@123"  # NUNCA hardcode senhas!
```

## YAML / JSON / HCL - Configuração

```yaml
# ✅ CORRETO - Referência a segredos externos
database:
  password: ${DB_PASSWORD}  # Variável de ambiente
  
# ❌ ERRADO - Segredos em plaintext
database:
  password: "production_password_123"  # NUNCA!
```

```hcl
# ✅ CORRETO - Terraform com referência a vault
resource "aws_db_instance" "main" {
  password = data.aws_secretsmanager_secret_version.db_password.secret_string
}

# ❌ ERRADO - Segredo hardcoded em HCL
resource "aws_db_instance" "main" {
  password = "hardcoded-password"  # NUNCA!
}
```

## Referências
- [OWASP Cryptographic Storage](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [OWASP Key Management](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)
