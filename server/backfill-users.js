const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function runBackfill() {
  console.log("Starting users verification backfill...");
  try {
    const result = await prisma.user.updateMany({
      data: {
        isVerified: true
      }
    });
    console.log(`Successfully backfilled ${result.count} existing users to isVerified = true`);
  } catch (err) {
    console.error("Backfill failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

runBackfill();
