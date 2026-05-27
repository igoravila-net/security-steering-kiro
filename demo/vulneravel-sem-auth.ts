// ❌ VULNERÁVEL — Endpoint sem Autenticação e Autorização
// Este código expõe dados sensíveis sem verificar quem está acessando

import { Request, Response, Router } from 'express';

const router = Router();

// VULNERÁVEL: endpoint admin sem autenticação
router.get('/api/admin/users', async (req: Request, res: Response) => {
  // Qualquer pessoa pode listar todos os usuários!
  const users = await db.query('SELECT * FROM users');
  // VULNERÁVEL: retorna entidade completa (passwordHash, role, etc.)
  res.json(users);
});

// VULNERÁVEL: sem verificação de ownership (IDOR/BOLA)
router.get('/api/users/:id/documents', async (req: Request, res: Response) => {
  const { id } = req.params;
  // Qualquer usuário autenticado pode ver documentos de QUALQUER outro usuário
  const docs = await db.query(`SELECT * FROM documents WHERE user_id = $1`, [id]);
  res.json(docs);
});

// VULNERÁVEL: operação destrutiva sem autorização
router.delete('/api/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  // Sem verificar se é admin, sem verificar ownership
  await db.query('DELETE FROM users WHERE id = $1', [id]);
  res.json({ message: 'User deleted' });
});

// VULNERÁVEL: sem rate limiting em endpoint de login
router.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  // Sem limite de tentativas — permite brute force
  const user = await authService.verify(email, password);
  if (!user) {
    // VULNERÁVEL: revela se email existe
    return res.status(401).json({ error: 'Senha incorreta para este email' });
  }
  res.json({ token: generateToken(user) });
});

export default router;
