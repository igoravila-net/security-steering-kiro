// ❌ VULNERÁVEL — LGPD / Dados Pessoais sem Proteção
// Este código expõe dados pessoais sem mascaramento, sem consentimento,
// sem mecanismo de exclusão e sem classificação da informação

import { Request, Response } from 'express';

interface User {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  address: string;
  healthData: string;
  salary: number;
  birthDate: string;
}

// VULNERÁVEL: retorna TODOS os dados pessoais sem mascaramento
export async function getUser(req: Request, res: Response) {
  const user = await db.findById(req.params.id);
  
  // VULNERÁVEL: expõe CPF, dados de saúde, salário em plaintext
  res.json(user);
}

// VULNERÁVEL: loga dados pessoais completos
export async function updateUser(req: Request, res: Response) {
  const user = await db.findById(req.params.id);
  
  // VULNERÁVEL: PII em logs (LGPD Art. 46 - segurança)
  console.log(`Updating user: ${JSON.stringify(user)}`);
  
  await db.update(req.params.id, req.body);
  
  // VULNERÁVEL: sem registro de consentimento para alteração
  // VULNERÁVEL: sem log de auditoria (quem alterou, quando, o quê)
  res.json({ success: true });
}

// VULNERÁVEL: sem mecanismo de exclusão (direito ao esquecimento)
export async function listUsers(req: Request, res: Response) {
  // VULNERÁVEL: retorna lista completa sem paginação
  // VULNERÁVEL: sem filtro por tenant/organização
  const users = await db.findAll();
  
  // VULNERÁVEL: expõe dados sensíveis de TODOS os usuários
  // Inclui: CPF, email, telefone, endereço, dados de saúde
  res.json(users);
}

// VULNERÁVEL: compartilha dados com terceiro sem consentimento
export async function exportToPartner(req: Request, res: Response) {
  const users = await db.findAll();
  
  // VULNERÁVEL: envia dados pessoais para API externa sem:
  // - Verificar consentimento do titular
  // - Registrar compartilhamento
  // - Anonimizar dados desnecessários
  // - Verificar se parceiro tem base legal
  await fetch('https://partner-api.com/import', {
    method: 'POST',
    body: JSON.stringify(users),
  });
  
  res.json({ exported: users.length });
}
