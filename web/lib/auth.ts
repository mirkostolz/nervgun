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
      allowDangerousEmailAccountLinking: false,
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
      // DEVELOPMENT MODE: Allow all emails for testing
      // TODO: Re-enable domain restriction for production
      const userEmail = user.email?.toLowerCase() || '';
      
      console.log('=== SignIn Callback (DEV MODE - All emails allowed) ===');
      console.log('User email:', userEmail);
      console.log('✅ Login allowed for', userEmail);
      
      return true; // Allow all emails
      
      /* PRODUCTION CODE - Uncomment to enable domain restriction:
      const domain = env.ALLOWED_EMAIL_DOMAIN.toLowerCase();
      const ok = userEmail.endsWith(`@${domain}`);
      
      if (!ok) {
        console.log(`❌ Login blocked: ${userEmail} does not end with @${domain}`);
      }
      
      return !!ok;
      */
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
  pages: {
    signOut: '/',
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'none', // Changed from 'lax' to 'none' to allow Chrome extension to send cookies
        path: '/',
        secure: true // Must be true when sameSite is 'none'
      }
    }
  },
};