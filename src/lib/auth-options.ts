import type { NextAuthOptions } from "next-auth";
import type { Provider } from "next-auth/providers/index";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { getMongoClientPromise } from "@/lib/mongodb";

// Only register OAuth providers that are actually configured.
// Account linking by email is intentionally NOT enabled: sign-up does not verify email ownership,
// so automatic linking would let someone pre-register a victim's email and take over the account.
const providers: Provider[] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  );
}

const mongoClientPromise = getMongoClientPromise();

export const authOptions: NextAuthOptions = {
  adapter: mongoClientPromise ? MongoDBAdapter(mongoClientPromise) : undefined,
  providers,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours (1 day)
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Expose user id on the session object
        (session.user as any).id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/', // Redirect to home page where the modal is, instead of a missing /login route
  },
  secret: process.env.NEXTAUTH_SECRET,
};
