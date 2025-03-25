import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import pool from "@/app/lib/db";
import { RowDataPacket } from "mysql2/promise";

export const authOptions = {
    providers: [
        CredentialsProvider({
        name: "Credentials",
        credentials: {
            email: { label: "Email", type: "email", placeholder: "your@example.com" },
            password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) {
            throw new Error("Missing credentials");
            }

            // Get user from database
            const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM usuarios WHERE email = ?", [credentials.email]);
            const user = rows[0];

            if (!user || !(await compare(credentials.password, user.password))) {
            throw new Error("Invalid credentials");
            }

            return { id: user.id, name: user.nombre, email: user.email };
        },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: "jwt" as const },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
