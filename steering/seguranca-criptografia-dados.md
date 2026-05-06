# Políticas de Segurança - Criptografia e Proteção de Dados

> Baseado em: [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html), [OWASP Transport Layer Security](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html), [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Dados sensíveis em texto plano no banco → Criptografar em repouso
- Comunicação sem TLS → Forçar HTTPS em todos os endpoints
- Algoritmos criptográficos obsoletos (DES, RC4, MD5) → Usar AES-256, SHA-256+
- Chaves/segredos no código-fonte → Usar vault ou variáveis de ambiente
- Dados sensíveis em logs → Mascarar ou remover

## Criptografia em Repouso - OBRIGATÓRIO
- AES-256-GCM para criptografia simétrica
- RSA-2048+ ou ECDSA para criptografia assimétrica
- Nunca implementar criptografia própria (usar bibliotecas estabelecidas)
- Rotação periódica de chaves
- Gerenciamento seguro de chaves (HSM ou vault)

```java
// ✅ CORRETO - Criptografia AES-256-GCM
@Service
public class EncryptionService {
    
    @Value("${encryption.key}")
    private String encryptionKey; // Vem de variável de ambiente/vault
    
    public String encrypt(String plaintext) throws Exception {
        SecretKey key = new SecretKeySpec(
            Base64.getDecoder().decode(encryptionKey), "AES");
        
        byte[] iv = new byte[12]; // 96 bits para GCM
        SecureRandom.getInstanceStrong().nextBytes(iv);
        
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(128, iv));
        
        byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
        
        // Concatenar IV + ciphertext para armazenamento
        byte[] combined = new byte[iv.length + ciphertext.length];
        System.arraycopy(iv, 0, combined, 0, iv.length);
        System.arraycopy(ciphertext, 0, combined, iv.length, ciphertext.length);
        
        return Base64.getEncoder().encodeToString(combined);
    }
    
    public String decrypt(String encryptedBase64) throws Exception {
        byte[] combined = Base64.getDecoder().decode(encryptedBase64);
        
        byte[] iv = Arrays.copyOfRange(combined, 0, 12);
        byte[] ciphertext = Arrays.copyOfRange(combined, 12, combined.length);
        
        SecretKey key = new SecretKeySpec(
            Base64.getDecoder().decode(encryptionKey), "AES");
        
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(128, iv));
        
        return new String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8);
    }
}

// ❌ ERRADO - Algoritmo obsoleto e modo inseguro
Cipher cipher = Cipher.getInstance("DES/ECB/PKCS5Padding"); // DES fraco, ECB inseguro
```

## Transporte Seguro (TLS) - OBRIGATÓRIO
- TLS 1.2+ obrigatório (preferencialmente TLS 1.3)
- HSTS habilitado com max-age mínimo de 1 ano
- Certificados válidos e atualizados
- Cipher suites fortes (desabilitar suites fracas)
- Redirecionar HTTP → HTTPS automaticamente

```yaml
# ✅ CORRETO - application.yml Spring Boot
server:
  ssl:
    enabled: true
    protocol: TLS
    enabled-protocols: TLSv1.3,TLSv1.2
    ciphers:
      - TLS_AES_256_GCM_SHA384
      - TLS_AES_128_GCM_SHA256
      - TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
    key-store: classpath:keystore.p12
    key-store-type: PKCS12
  port: 8443
```

## Gerenciamento de Segredos - OBRIGATÓRIO
- Nunca commitar segredos no repositório
- Usar variáveis de ambiente ou vault (HashiCorp Vault, AWS Secrets Manager)
- Rotacionar segredos periodicamente
- Diferentes segredos por ambiente (dev/staging/prod)
- Auditar acesso a segredos

```java
// ✅ CORRETO - Segredos via variáveis de ambiente
@Configuration
public class DatabaseConfig {
    
    @Value("${DB_PASSWORD}")
    private String dbPassword; // Injetado de variável de ambiente
    
    @Value("${DB_URL}")
    private String dbUrl;
    
    @Bean
    public DataSource dataSource() {
        return DataSourceBuilder.create()
            .url(dbUrl)
            .password(dbPassword)
            .build();
    }
}

// ✅ CORRETO - Spring Cloud Vault
// bootstrap.yml
// spring:
//   cloud:
//     vault:
//       uri: https://vault.example.com
//       authentication: KUBERNETES
//       kv:
//         backend: secret
//         default-context: myapp

// ❌ ERRADO - Segredos hardcoded
@Configuration
public class InsecureConfig {
    private static final String API_KEY = "sk-abc123xyz789"; // NUNCA faça isso
    private static final String DB_PASS = "production_password!"; // NUNCA faça isso
}
```

## Proteção de Dados Pessoais (PII) - OBRIGATÓRIO
- Mascarar PII em logs e respostas de API
- Criptografar PII em repouso
- Minimizar coleta de dados (coletar apenas o necessário)
- Implementar direito ao esquecimento (soft/hard delete)
- Anonimizar dados para ambientes não-produtivos

```java
// ✅ CORRETO - Mascaramento de dados sensíveis
@Service
public class DataMaskingService {
    
    public String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***";
        String[] parts = email.split("@");
        String local = parts[0];
        if (local.length() <= 2) return "**@" + parts[1];
        return local.charAt(0) + "***" + local.charAt(local.length() - 1) + "@" + parts[1];
    }
    
    public String maskCpf(String cpf) {
        if (cpf == null || cpf.length() < 11) return "***";
        return "***." + cpf.substring(3, 6) + ".***-**";
    }
    
    public String maskPhone(String phone) {
        if (phone == null || phone.length() < 8) return "***";
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 2);
    }
}

// ✅ CORRETO - Log sem dados sensíveis
log.info("Processando pedido para usuário ID: {}", userId);
// ❌ ERRADO
log.info("Processando pedido para: {} CPF: {} email: {}", nome, cpf, email);
```

## Geração de Números Aleatórios - OBRIGATÓRIO
- Usar SecureRandom para qualquer valor relacionado a segurança
- Nunca usar Math.random() ou Random para tokens/IDs de sessão
- Garantir entropia suficiente (mín. 128 bits para tokens)

```java
// ✅ CORRETO - SecureRandom para tokens
public String generateSecureToken() {
    byte[] bytes = new byte[32]; // 256 bits
    SecureRandom.getInstanceStrong().nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
}

// ❌ ERRADO - Random previsível
public String generateToken() {
    return String.valueOf(new Random().nextLong()); // Previsível!
}
```

## Referências
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [OWASP Transport Layer Security](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [OWASP Key Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)
