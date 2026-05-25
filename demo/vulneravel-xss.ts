// ❌ VULNERÁVEL — Cross-Site Scripting (XSS)
// Este código renderiza input do usuário sem sanitização
// Permite execução de JavaScript malicioso no browser da vítima

import React from 'react';

// VULNERÁVEL: dangerouslySetInnerHTML com input do usuário
export function UserComment({ comment }: { comment: string }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: comment }} />
  );
}

// VULNERÁVEL: innerHTML com dados não sanitizados
export function renderMessage(message: string) {
  const el = document.getElementById('output');
  if (el) {
    el.innerHTML = message; // XSS!
  }
}

// VULNERÁVEL: template literal em HTML sem escape
export function createUserCard(name: string, bio: string) {
  return `
    <div class="card">
      <h2>${name}</h2>
      <p>${bio}</p>
    </div>
  `;
}
