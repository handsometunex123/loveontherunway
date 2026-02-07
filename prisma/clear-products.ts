import { db } from "../lib/db";

async function main() {
  console.log("🧹 Clearing product-related records...");

  await db.productImage.deleteMany();
  await db.productVariant.deleteMany();
  await db.vote.deleteMany();
  await db.product.deleteMany();

  console.log("✅ All product records deleted.");
}

main()
  .catch((error) => {
    console.error("❌ Failed to clear product records:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
