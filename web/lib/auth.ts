import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './db';
import { env } from '../env.mjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: { 
          prompt: 'consent', 
          access_type: 'offline', 
          response_type: 'code' 
        },
      },
      profile(profile) {
        return { 
          id: profile.sub, 
          name: profile.name, 
          email: profile.email, 
          image: profile.picture 
        } as any;
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const domain = env.ALLOWED_EMAIL_DOMAIN.toLowerCase();
      const ok = user.email?.toLowerCase().endsWith(`@${domain}`);
      return !!ok;
    },
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;
        (session.user as any).role = user.role;
      }
      return session;
    },
  },
  session: { strategy: 'database' },
  secret: env.NEXTAUTH_SECRET,
};