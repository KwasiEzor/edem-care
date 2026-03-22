import { describe, it, expect } from 'vitest';
import { generateMathChallenge, verifyMathChallenge } from './challenges';

describe('Math Challenges Security', () => {
  it('should generate a valid challenge with two numbers and a sum', () => {
    const challenge = generateMathChallenge();
    expect(challenge.question).toMatch(/\d+ \+ \d+/);
    expect(challenge.token).toBeDefined();
    
    // The sum should be correct (we can verify by decoding or just checking the logic)
    const [a, b] = challenge.question.split(' + ').map(Number);
    const result = verifyMathChallenge(String(a + b), challenge.token);
    expect(result).toBe(true);
  });

  it('should reject an incorrect answer', () => {
    const challenge = generateMathChallenge();
    const result = verifyMathChallenge('999', challenge.token);
    expect(result).toBe(false);
  });

  it('should reject a malformed token', () => {
    const result = verifyMathChallenge('7', 'invalid-token');
    expect(result).toBe(false);
  });
});
