import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://neondb_owner:npg_8Dby7CrnIKPX@ep-plain-darkness-a22pbk2t-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"
      },
    },
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
