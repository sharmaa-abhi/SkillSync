import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase().trim();

        try {
          let user = await prisma.user.findUnique({
            where: { email },
          });

          // If demo user is requested but doesn't exist yet, auto-provision
          if (!user && email === "alex@skillsync.ai") {
            const hashedPassword = await bcrypt.hash("password123", 12);
            try {
              user = await prisma.user.create({
                data: {
                  email: "alex@skillsync.ai",
                  name: "Alex Rivera",
                  password: hashedPassword,
                  educationLevel: "B.Tech CSE - 3rd Year",
                  learningGoals: "Master Database Systems & Normalization for High-Yield Prep",
                  preferredStyle: "Intermediate — Visual & Real-world Examples",
                  onboardingCompleted: true,
                },
              });
            } catch {
              // Concurrency catch: re-fetch if created in parallel
              user = await prisma.user.findUnique({ where: { email } });
            }
          }

          if (!user) return null;

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("[NextAuth][authorize] Error querying user:", error);

          // Graceful fallback: If database is unreachable, allow instant demo login
          if (email === "alex@skillsync.ai" && credentials.password === "password123") {
            return {
              id: "cmugzc3yd0002su5gtdnt08vd",
              email: "alex@skillsync.ai",
              name: "Alex Rivera",
            };
          }

          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "skillsync-adaptive-ai-platform-super-secret-key-2026",
};
