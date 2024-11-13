import { PrismaClient } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined;
    interface Window {
        currentUserEmail: string | null;
    }
}

const client = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = client; // `prisma` is now declared as `let` or `const` in global scope
}

export default client;
