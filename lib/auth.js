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
    maxAge: 24 * 60 * 60, // 1 day
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user }) {
      if (!supabaseAdmin) {
        console.error('Supabase admin client not initialized');
        return true;
      }

      try {
        const { data: existing, error } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', user.email)
          .maybeSingle();

        if (error) {
          console.error('Error checking existing user:', error);
        }

        if (!existing) {
          await supabaseAdmin.from('profiles').insert({
            email: user.email,
            name: user.name,
            avatar: user.image,
            access_level: 0,
            in_admin: false,
          });
        }
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return true;
      }
    },
    async jwt({ token, trigger }) {
      // Only fetch profile from Supabase on sign-in, manual update, or every 5 min
      const now = Date.now();
      const profileAge = token.profileFetchedAt ? now - token.profileFetchedAt : Infinity;
      const shouldRefresh = trigger === 'signIn' || trigger === 'update' || profileAge > 60 * 1000;

      if (token.email && shouldRefresh && supabaseAdmin) {
        try {
          const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('email', token.email)
            .maybeSingle();

          if (error) {
            console.error('Error fetching profile in jwt callback:', error);
          } else if (profile) {
            token.profile = profile;
            token.profileFetchedAt = now;
          }
        } catch (error) {
          console.error('Crash in jwt callback:', error);
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
