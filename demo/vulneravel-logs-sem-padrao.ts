// ❌ VULNERÁVEL — Logs sem padrão COGNA/GELF
// Este código loga dados sensíveis, não usa CorrelationID,
// não segue níveis corretos e expõe PII nos logs

import { Request, Response } from 'express';

export async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body;
  
  // VULNERÁVEL: logando senha em plaintext
  console.log(`Login attempt: email=${email}, password=${password}`);
  
  try {
    const user = await authService.authenticate(email, password);
    
    // VULNERÁVEL: logando dados pessoais completos (LGPD)
    console.log(`User logged in: ${JSON.stringify(user)}`);
    // Expõe: nome, CPF, email, telefone, endereço...
    
    res.json({ token: generateToken(user) });
  } catch (error) {
    // VULNERÁVEL: logando stack trace que pode vazar para monitoring
    console.error(`Login failed for ${email}: ${error.stack}`);
    
    // VULNERÁVEL: mensagem revela se email existe
    res.status(401).json({ error: `Email ${email} não encontrado` });
  }
}

export async function processPayment(req: Request, res: Response) {
  const { cardNumber, cvv, amount } = req.body;
  
  // VULNERÁVEL: logando dados de cartão (PCI-DSS violation)
  console.log(`Processing payment: card=${cardNumber}, cvv=${cvv}, amount=${amount}`);
  
  // VULNERÁVEL: sem CorrelationID para rastreabilidade
  // VULNERÁVEL: sem nível de log adequado (tudo é console.log)
  // VULNERÁVEL: sem formato estruturado (GELF)
  
  const result = await paymentGateway.charge(cardNumber, cvv, amount);
  console.log(`Payment result: ${JSON.stringify(result)}`);
  
  res.json({ success: true });
}
