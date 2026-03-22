import crypto from 'node:crypto';
import { env } from '@/lib/env';

const SECRET = env.SUPABASE_SERVICE_ROLE_KEY || 'default-fallback-secret';

export interface MathChallenge {
  question: string;
  token: string;
}

export function generateMathChallenge(): MathChallenge {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const sum = a + b;
  const timestamp = Date.now();
  
  // Create a token that contains the answer and timestamp, signed with our secret
  const data = `${sum}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', SECRET).update(data).digest('hex');
  const token = Buffer.from(`${data}:${hmac}`).toString('base64');
  
  return {
    question: `${a} + ${b}`,
    token,
  };
}

export function verifyMathChallenge(answer: string, token: string): boolean {
  if (!answer || !token) return false;
  
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [expectedSum, timestamp, hmac] = decoded.split(':');
    
    if (!expectedSum || !timestamp || !hmac) return false;
    
    // Check if the answer matches
    if (answer !== expectedSum) return false;
    
    // Check if the token is too old (e.g., 30 minutes)
    const age = Date.now() - Number(timestamp);
    if (age > 30 * 60 * 1000) return false;
    
    // Verify the HMAC
    const data = `${expectedSum}:${timestamp}`;
    const expectedHmac = crypto.createHmac('sha256', SECRET).update(data).digest('hex');
    
    return hmac === expectedHmac;
  } catch {
    return false;
  }
}
