export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-this',
  expiresIn: process.env.JWT_EXPIRE || '7d'
} as const;

