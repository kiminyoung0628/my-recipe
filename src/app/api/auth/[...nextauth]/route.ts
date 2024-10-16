import NextAuth from "next-auth/next";
import { authOptions } from "../../../../../lib/authOptions";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/github";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
