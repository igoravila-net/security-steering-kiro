# ❌ VULNERÁVEL — Dockerfile Inseguro
# Este Dockerfile viola múltiplas regras de segurança de containers

# VULNERÁVEL: imagem base com tag :latest (mutável)
FROM node:latest

# VULNERÁVEL: rodando como root (padrão)
# Sem USER definido

# VULNERÁVEL: copiando tudo incluindo .env e node_modules
COPY . /app
WORKDIR /app

# VULNERÁVEL: segredos na imagem via ENV
ENV DATABASE_PASSWORD=production_secret_123
ENV API_KEY=sk-proj-abc123xyz789

# VULNERÁVEL: instalando com devDependencies em produção
RUN npm install

# VULNERÁVEL: sem HEALTHCHECK
# VULNERÁVEL: expondo porta desnecessária
EXPOSE 22
EXPOSE 3000

# VULNERÁVEL: sem multi-stage build (ferramentas de build na imagem final)
CMD ["node", "server.js"]
