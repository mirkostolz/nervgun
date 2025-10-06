import 'server-only';

const required = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET', 
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'ALLOWED_EMAIL_DOMAIN',
  'DATABASE_URL'
];

export const env = Object.fromEntries(required.map(k => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env ${k}`);
  return [k, v];
}));