import 'server-only';

const isProduction = process.env.NODE_ENV === 'production';

const defaultsForDev = {
  NEXTAUTH_URL: 'http://localhost:3001',
  NEXTAUTH_SECRET: 'dev-nextauth-secret-change-me',
  GOOGLE_CLIENT_ID: 'dev-google-client-id',
  GOOGLE_CLIENT_SECRET: 'dev-google-client-secret',
  ALLOWED_EMAIL_DOMAIN: 'example.com',
  DATABASE_URL: 'file:./dev.db'
};

const required = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET', 
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'ALLOWED_EMAIL_DOMAIN',
  'DATABASE_URL'
];

export const env = Object.fromEntries(required.map(key => {
  const value = process.env[key] || (!isProduction ? defaultsForDev[key] : undefined);
  if (!value) throw new Error(`Missing env ${key}`);
  return [key, value];
}));