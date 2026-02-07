import { db } from "../lib/db";

async function main() {
  console.log("🖼️ Adding more images to product...");

  const productId = "cml71tjch000bzg7xtw1mqk08";

  // Add 4 more images to the product (alternating between the two URLs)
  const imageUrls = [
    "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&h=600&fit=crop",
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=600&fit=crop"
  ];

  await db.productImage.createMany({
    data: [
      {
        productId,
        publicId: "additional-image-1",
        url: imageUrls[1]
      },
      {
        productId,
        publicId: "additional-image-2",
        url: imageUrls[0]
      },
      {
        productId,
        publicId: "additional-image-3",
        url: imageUrls[1]
      },
      {
        productId,
        publicId: "additional-image-4",
        url: imageUrls[0]
      }
    ]
  });

  console.log("✅ Added 4 more images to the product");
  console.log("   Total images for this product should now be 5");
}

main()
  .catch((error) => {
    console.error("❌ Failed to add images:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
