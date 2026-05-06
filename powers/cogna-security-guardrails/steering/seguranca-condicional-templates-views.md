---
inclusion: fileMatch
fileMatchPattern: "**/*.html,**/*.htm,**/*.jsx,**/*.tsx,**/*.vue,**/*.svelte,**/*.ejs,**/*.hbs,**/*.pug,**/templates/*,**/views/*,**/pages/*,**/components/*"
---

# Regras de Segurança para Templates e Views

> Ativado automaticamente ao editar templates, views ou componentes frontend.

## OBRIGATÓRIO neste contexto

- Usar mecanismo de escape automático do framework
- Se HTML rico necessário: sanitizar com biblioteca aprovada ANTES de renderizar
- Content-Security-Policy configurado
- Nenhum event handler inline com dados dinâmicos
- Dados sensíveis NUNCA renderizados sem mascaramento
- Formulários com proteção CSRF (token)
- Inputs com maxlength definido no HTML
- Autocomplete=off em campos sensíveis
- Nenhum script inline com dados do usuário
