import { PrismaClient } from '@prisma/client'

if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "postgresql://mock:mock@localhost:5432/mock?schema=public";
}

const prismaClientSingleton = () => {
    return new PrismaClient()
}

declare global {
    // eslint-disable-next-line no-var
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

// Check if we are in production, otherwise use global instance to prevent Next.js from spawning too many SQLite/PostgreSQL connections in dev during HMR.
const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
