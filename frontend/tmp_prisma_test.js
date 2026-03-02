const { PrismaClient } = require("@prisma/client");

try {
  const p = new PrismaClient();
  console.log("Success");
} catch (e) {
  console.error("Crash:", e);
}
