import GoogleProvider from 'next-auth/providers/google';
import { supabaseAdmin } from './supabase';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user }) {
      try {
        const { data: existing } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('email', user.email)
          .single();

        if (!existing) {
          await supabaseAdmin.from('profiles').insert({
            email: user.email,
            name: user.name,
            avatar: user.image,
            access_level: 0,
          });
        }
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return true;
      }
    },
    async jwt({ token, trigger }) {
      if (token.email) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('email', token.email)
          .single();

        if (profile) {
          token.profile = profile;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.profile) {
        session.profile = token.profile;
      }
      return session;
    },
  },
};
