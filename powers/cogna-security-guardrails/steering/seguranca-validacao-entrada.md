# Políticas de Segurança - Validação de Entrada e Upload de Arquivos

> Baseado em: [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html), [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)

## VIOLAÇÕES CRÍTICAS (Falha automática)
- Request body sem @Valid → Adicionar validação em todos os endpoints
- Entrada do usuário sem sanitização → Validar e sanitizar
- Upload sem verificação de tipo/tamanho → Implementar whitelist e limites
- Path traversal em nomes de arquivo → Sanitizar e usar caminhos seguros
- Validação apenas no cliente → Sempre validar no servidor

## Validação de Entrada - OBRIGATÓRIO
- @Valid em TODOS os request bodies
- Validar no servidor (nunca confiar no cliente)
- Usar whitelist (permitir apenas o esperado) em vez de blacklist
- Validar tipo, tamanho, formato e range de todos os campos
- Rejeitar entrada que não corresponde ao formato esperado

```java
// ✅ CORRETO - Validação completa com Bean Validation
@RestController
@Validated
public class UserController {
    
    @PostMapping("/users")
    public ResponseEntity<UserDTO> createUser(
            @Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(201).body(userService.create(request));
    }
    
    @GetMapping("/users")
    public Page<UserDTO> listUsers(
            @RequestParam @Min(0) int page,
            @RequestParam @Min(1) @Max(100) int size) {
        return userService.findAll(PageRequest.of(page, size));
    }
}

public record CreateUserRequest(
    @NotBlank 
    @Size(min = 2, max = 100)
    @Pattern(regexp = "^[a-zA-ZÀ-ÿ\\s]+$", message = "Nome pode conter apenas letras e espaços")
    String name,
    
    @NotBlank
    @Email(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")
    @Size(max = 255)
    String email,
    
    @NotBlank
    @Size(min = 8, max = 128)
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).+$",
             message = "Senha deve conter maiúscula, minúscula, número e caractere especial")
    String password,
    
    @NotNull
    @Min(18) @Max(120)
    Integer age,
    
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Telefone inválido")
    String phone
) {}

// ❌ ERRADO - Sem validação
@PostMapping("/users")
public User createUser(@RequestBody Map<String, Object> body) {
    User user = new User();
    user.setName((String) body.get("name")); // Sem validação alguma
    user.setEmail((String) body.get("email"));
    return userRepository.save(user);
}
```

## Validação Customizada - OBRIGATÓRIO
- Criar validators customizados para regras de negócio
- Validar consistência entre campos relacionados
- Implementar validação cross-field quando necessário

```java
// ✅ CORRETO - Validator customizado
@Constraint(validatedBy = DateRangeValidator.class)
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidDateRange {
    String message() default "Data de início deve ser anterior à data de fim";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class DateRangeValidator implements ConstraintValidator<ValidDateRange, DateRangeRequest> {
    @Override
    public boolean isValid(DateRangeRequest request, ConstraintValidatorContext context) {
        if (request.startDate() == null || request.endDate() == null) {
            return true; // @NotNull cuida disso
        }
        return request.startDate().isBefore(request.endDate());
    }
}
```

## Tratamento de Erros de Validação - OBRIGATÓRIO
- Retornar mensagens de erro claras mas sem expor detalhes internos
- Usar formato consistente para erros de validação
- Nunca expor stack traces ou informações do sistema

```java
// ✅ CORRETO - Handler global de erros de validação
@RestControllerAdvice
public class ValidationExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<FieldError> errors = ex.getBindingResult().getFieldErrors().stream()
            .map(error -> new FieldError(error.getField(), error.getDefaultMessage()))
            .toList();
        
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("VALIDATION_ERROR", "Dados inválidos", errors));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        // Logar detalhes internamente, retornar mensagem genérica
        log.error("Erro interno: {}", ex.getMessage(), ex);
        return ResponseEntity.internalServerError()
            .body(new ErrorResponse("INTERNAL_ERROR", "Erro interno do servidor", null));
    }
}
```

## Upload de Arquivos - OBRIGATÓRIO
- Whitelist de extensões permitidas (nunca blacklist)
- Validar MIME type real (não confiar no Content-Type do cliente)
- Limitar tamanho máximo do arquivo
- Renomear arquivo com UUID (nunca usar nome original)
- Armazenar fora do webroot
- Verificar conteúdo com antivírus quando possível
- Prevenir path traversal no nome do arquivo

```java
// ✅ CORRETO - Upload seguro de arquivos
@Service
public class FileUploadService {
    
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "png", "jpg", "jpeg");
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
        "application/pdf", "image/png", "image/jpeg"
    );
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    
    @Value("${upload.directory}")
    private String uploadDirectory; // Fora do webroot
    
    public FileMetadata uploadFile(MultipartFile file, Long userId) {
        // 1. Validar tamanho
        if (file.isEmpty() || file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidFileException("Arquivo vazio ou excede tamanho máximo de 10MB");
        }
        
        // 2. Validar extensão (whitelist)
        String originalName = file.getOriginalFilename();
        String extension = getExtension(originalName).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new InvalidFileException("Extensão não permitida: " + extension);
        }
        
        // 3. Validar MIME type real (não confiar no header)
        String detectedMimeType = detectMimeType(file);
        if (!ALLOWED_MIME_TYPES.contains(detectedMimeType)) {
            throw new InvalidFileException("Tipo de arquivo não permitido");
        }
        
        // 4. Gerar nome seguro (UUID)
        String safeName = UUID.randomUUID() + "." + extension;
        
        // 5. Salvar fora do webroot
        Path targetPath = Path.of(uploadDirectory, userId.toString(), safeName);
        
        // 6. Prevenir path traversal
        if (!targetPath.normalize().startsWith(Path.of(uploadDirectory).normalize())) {
            throw new SecurityException("Path traversal detectado");
        }
        
        Files.createDirectories(targetPath.getParent());
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        
        return new FileMetadata(safeName, extension, file.getSize(), userId);
    }
    
    private String detectMimeType(MultipartFile file) throws IOException {
        Tika tika = new Tika();
        return tika.detect(file.getInputStream());
    }
    
    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            throw new InvalidFileException("Arquivo sem extensão");
        }
        return filename.substring(filename.lastIndexOf('.') + 1);
    }
}

// ❌ ERRADO - Upload inseguro
@PostMapping("/upload")
public String upload(@RequestParam MultipartFile file) {
    String path = "/uploads/" + file.getOriginalFilename(); // Path traversal + nome previsível
    file.transferTo(new File(path)); // Sem validação
    return path;
}
```

## Prevenção de Mass Assignment - OBRIGATÓRIO
- Usar DTOs específicos para cada operação (não expor entidades)
- Definir explicitamente quais campos podem ser alterados
- Nunca fazer bind direto de request para entidade

```java
// ✅ CORRETO - DTOs separados para criação e atualização
public record CreateUserRequest(
    @NotBlank String name,
    @Email String email,
    @NotBlank String password
) {}

// DTO de atualização NÃO inclui campos sensíveis (role, password)
public record UpdateUserRequest(
    @NotBlank @Size(max = 100) String name,
    @Size(max = 500) String bio
) {}

// ❌ ERRADO - Bind direto para entidade (mass assignment)
@PutMapping("/users/{id}")
public User updateUser(@PathVariable Long id, @RequestBody User user) {
    user.setId(id);
    return userRepository.save(user); // Usuário pode alterar role, password, etc.
}
```

## Referências
- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [OWASP Mass Assignment Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html)
