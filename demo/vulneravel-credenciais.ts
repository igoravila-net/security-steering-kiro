// ❌ VULNERÁVEL — Credenciais Hardcoded
// Este código contém segredos diretamente no código-fonte
// Qualquer pessoa com acesso ao repo tem acesso às credenciais

const API_KEY = "sk-proj-abc123xyz789def456ghi";
const DATABASE_PASSWORD = "P@ssw0rd!Pr0duction2024";
const JWT_SECRET = "meu-segredo-super-secreto-que-ninguem-sabe";
const AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE";

export const dbConfig = {
  host: "prod-db.internal.cogna.com.br",
  port: 5432,
  database: "production_users",
  user: "admin",
  password: DATABASE_PASSWORD, // Senha em plaintext!
};

export function generateToken(userId: string) {
  // VULNERÁVEL: secret hardcoded, sem expiração
  return jwt.sign({ userId }, JWT_SECRET);
}

export async function callExternalApi(data: any) {
  // VULNERÁVEL: API key no código
  return fetch("https://api.example.com/data", {
    headers: { "Authorization": `Bearer ${API_KEY}` }
  });
}
