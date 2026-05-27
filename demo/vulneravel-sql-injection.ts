// ❌ VULNERÁVEL — SQL Injection
// Este código concatena input do usuário diretamente na query SQL
// Permite que um atacante execute queries arbitrárias no banco

import { Request, Response } from 'express';
import { pool } from '../db';

export async function searchUsers(req: Request, res: Response) {
  const { name } = req.query;
  
  // VULNERÁVEL: concatenação de string em SQL
  const query = `SELECT * FROM users WHERE name = '${name}'`;
  const result = await pool.query(query);
  
  // VULNERÁVEL: retorna entidade direta (sem DTO)
  res.json(result.rows);
}

export async function getUserById(req: Request, res: Response) {
  const { id } = req.params;
  
  // VULNERÁVEL: sem validação de tipo, sem parametrização
  const query = `SELECT * FROM users WHERE id = ${id}`;
  const result = await pool.query(query);
  
  // VULNERÁVEL: sem verificação de ownership
  res.json(result.rows[0]);
}
