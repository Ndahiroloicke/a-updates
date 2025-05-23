import { PrismaClient } from "@prisma/client";

// Instantiate Prisma Client
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

// Create global PrismaClient instance
declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Make sure we're not recreating the client on hot reloads
const prisma = globalThis.prisma ?? prismaClientSingleton();

// Set global in development to prevent multiple instances
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export default prisma;
