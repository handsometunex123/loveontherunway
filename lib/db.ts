import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let db: PrismaClient | null = null;

function initializeDb(): PrismaClient {
  if (db) return db;

  db = new PrismaClient();
  return db;
}

// Lazy initialize only when actually needed (at runtime, not build time)
const dbProxy = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    const client = initializeDb();
    return (client as any)[prop];
  }
});

export { dbProxy as db };
