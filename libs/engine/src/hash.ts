import crypto from 'crypto';

export const hash = <T = unknown>(m: T) => {
  const str = typeof m === 'string' ? m : JSON.stringify(m);
  return crypto
    .createHash('shake256', { outputLength: 16 })
    .update(str)
    .digest('hex');
};
