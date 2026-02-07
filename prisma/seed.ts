import { db } from "../lib/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database...");
  
  // Clear all data first
  console.log("Clearing existing data...");
  await db.vote.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.productVariant.deleteMany();
  await db.productImage.deleteMany();
  await db.product.deleteMany();
  await db.designerProfile.deleteMany();
  await db.user.deleteMany();
  await db.platformSetting.deleteMany();

  // Create SUPER_ADMIN
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const superAdmin = await db.user.upsert({
    where: { email: "admin@loveontherunway.com" },
    update: {},
    create: {
      email: "admin@loveontherunway.com",
      name: "Super Admin",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true
    }
  });

  console.log(`✅ Created SUPER_ADMIN user: ${superAdmin.email}`);
  console.log(`   Email: admin@loveontherunway.com`);
  console.log(`   Password: admin123`);

  // Create DESIGNER users
  const designer1Password = await bcrypt.hash("designer123", 12);
  const designer1User = await db.user.upsert({
    where: { email: "sophie@designerstudio.com" },
    update: {},
    create: {
      email: "sophie@designerstudio.com",
      name: "Sophie Laurent",
      password: designer1Password,
      role: "DESIGNER",
      isActive: true
    }
  });

  const designer1Profile = await db.designerProfile.upsert({
    where: { userId: designer1User.id },
    update: {},
    create: {
      userId: designer1User.id,
      brandName: "Sophie Laurent Designs",
      bio: "Elegant and modern fashion designs inspired by nature",
      isApproved: true,
      isVisible: true
    }
  });

  console.log(`✅ Created DESIGNER: ${designer1User.email}`);
  console.log(`   Brand: ${designer1Profile.brandName}`);

  const designer2Password = await bcrypt.hash("designer456", 12);
  const designer2User = await db.user.upsert({
    where: { email: "james@couture.com" },
    update: {},
    create: {
      email: "james@couture.com",
      name: "James Mitchell",
      password: designer2Password,
      role: "DESIGNER",
      isActive: true
    }
  });

  const designer2Profile = await db.designerProfile.upsert({
    where: { userId: designer2User.id },
    update: {},
    create: {
      userId: designer2User.id,
      brandName: "James Mitchell Couture",
      bio: "Timeless luxury pieces for the modern woman",
      isApproved: true,
      isVisible: true
    }
  });

  console.log(`✅ Created DESIGNER: ${designer2User.email}`);
  console.log(`   Brand: ${designer2Profile.brandName}`);

  // Create an unapproved designer for testing
  const designer3Password = await bcrypt.hash("designer789", 12);
  const designer3User = await db.user.upsert({
    where: { email: "maya@designs.com" },
    update: {},
    create: {
      email: "maya@designs.com",
      name: "Maya Patel",
      password: designer3Password,
      role: "DESIGNER",
      isActive: true
    }
  });

  const designer3Profile = await db.designerProfile.upsert({
    where: { userId: designer3User.id },
    update: {},
    create: {
      userId: designer3User.id,
      brandName: "Maya Creations",
      bio: "Contemporary designs with cultural influences",
      isApproved: false,
      isVisible: false
    }
  });

  console.log(`✅ Created DESIGNER (unapproved): ${designer3User.email}`);

  // Image URLs - only these two allowed
  const imageUrls = [
    "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&h=600&fit=crop",
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=600&fit=crop"
  ];

  let imageIndex = 0;
  const getNextImageUrl = () => {
    const url = imageUrls[imageIndex % imageUrls.length];
    imageIndex++;
    return url;
  };

  // Create PRODUCTS for designer 1
  const product1 = await db.product.create({
    data: {
      designerId: designer1Profile.id,
      name: "Emerald Evening Gown",
      description: "A stunning emerald gown perfect for evening events",
      price: 450.00,
      category: "FEMALE",
      isVisible: true
    }
  });

  await db.productImage.create({
    data: {
      productId: product1.id,
      publicId: "unsplash-emerald-gown",
      url: getNextImageUrl()
    }
  });

  await db.productVariant.createMany({
    data: [
      {
        productId: product1.id,
        size: "8",
        color: "Emerald Green",
        measurements: { bust: "32in", waist: "24in", length: "60in" },
        stock: 2
      },
      {
        productId: product1.id,
        size: "10",
        color: "Emerald Green",
        measurements: { bust: "34in", waist: "26in", length: "60in" },
        stock: 3
      },
      {
        productId: product1.id,
        size: "12",
        color: "Emerald Green",
        measurements: { bust: "36in", waist: "28in", length: "60in" },
        stock: 5
      }
    ]
  });

  console.log(`✅ Created product: ${product1.name} with variants and images`);

  const product2 = await db.product.create({
    data: {
      designerId: designer1Profile.id,
      name: "Silk Blouse Collection",
      description: "Luxurious silk blouses for the modern professional",
      price: 175.00,
      category: "FEMALE",
      isVisible: true
    }
  });

  await db.productImage.create({
    data: {
      productId: product2.id,
      publicId: "unsplash-silk-blouse",
      url: getNextImageUrl()
    }
  });

  await db.productVariant.createMany({
    data: [
      {
        productId: product2.id,
        size: "8",
        color: "Ivory",
        measurements: { chest: "34in", length: "24in" },
        stock: 10
      },
      {
        productId: product2.id,
        size: "12",
        color: "Charcoal",
        measurements: { chest: "36in", length: "25in" },
        stock: 8
      }
    ]
  });

  console.log(`✅ Created product: ${product2.name} with variants and images`);

  // Create PRODUCTS for designer 2
  const product3 = await db.product.create({
    data: {
      designerId: designer2Profile.id,
      name: "Classic Tailored Blazer",
      description: "A perfectly tailored blazer that works for any occasion",
      price: 320.00,
      category: "MALE",
      isVisible: true
    }
  });

  await db.productImage.create({
    data: {
      productId: product3.id,
      publicId: "unsplash-blazer",
      url: getNextImageUrl()
    }
  });

  await db.productVariant.createMany({
    data: [
      {
        productId: product3.id,
        size: "S",
        color: "Navy",
        measurements: { chest: "34in", length: "26in" },
        stock: 4
      },
      {
        productId: product3.id,
        size: "M",
        color: "Navy",
        measurements: { chest: "36in", length: "26in" },
        stock: 6
      },
      {
        productId: product3.id,
        size: "L",
        color: "Black",
        measurements: { chest: "38in", length: "27in" },
        stock: 7
      }
    ]
  });

  console.log(`✅ Created product: ${product3.name} with variants and images`);

  // Additional PRODUCTS for designer 1
  const product4 = await db.product.create({
    data: {
      designerId: designer1Profile.id,
      name: "Flowing Chiffon Dress",
      description: "Lightweight and elegant chiffon dress for summer occasions",
      price: 225.00,
      category: "FEMALE",
      isVisible: true
    }
  });

  await db.productImage.create({
    data: {
      productId: product4.id,
      publicId: "unsplash-chiffon-dress",
      url: getNextImageUrl()
    }
  });

  await db.productVariant.createMany({
    data: [
      {
        productId: product4.id,
        size: "8",
        color: "Blush Pink",
        measurements: { bust: "32in", waist: "24in", length: "58in" },
        stock: 3
      },
      {
        productId: product4.id,
        size: "14",
        color: "Sky Blue",
        measurements: { bust: "36in", waist: "28in", length: "58in" },
        stock: 4
      }
    ]
  });

  console.log(`✅ Created product: ${product4.name} with variants and images`);

  const product5 = await db.product.create({
    data: {
      designerId: designer2Profile.id,
      name: "Premium Denim Collection",
      description: "High-quality denim jeans with perfect fit and comfort",
      price: 135.00,
      category: "MALE",
      isVisible: true
    }
  });

  await db.productImage.create({
    data: {
      productId: product5.id,
      publicId: "unsplash-denim",
      url: getNextImageUrl()
    }
  });

  await db.productVariant.createMany({
    data: [
      {
        productId: product5.id,
        size: "S",
        color: "Dark Indigo",
        measurements: { waist: "26in", length: "32in" },
        stock: 8
      },
      {
        productId: product5.id,
        size: "M",
        color: "Light Wash",
        measurements: { waist: "28in", length: "32in" },
        stock: 6
      },
      {
        productId: product5.id,
        size: "L",
        color: "Dark Indigo",
        measurements: { waist: "30in", length: "32in" },
        stock: 7
      }
    ]
  });

  console.log(`✅ Created product: ${product5.name} with variants and images`);

  const product6 = await db.product.create({
    data: {
      designerId: designer1Profile.id,
      name: "Vintage Leather Jacket",
      description: "Classic leather jacket for a timeless look",
      price: 550.00,
      category: "MALE",
      isVisible: true
    }
  });

  await db.productImage.create({
    data: {
      productId: product6.id,
      publicId: "unsplash-leather-jacket",
      url: getNextImageUrl()
    }
  });

  await db.productVariant.createMany({
    data: [
      {
        productId: product6.id,
        size: "S",
        color: "Black",
        measurements: { chest: "34in", length: "23in" },
        stock: 3
      },
      {
        productId: product6.id,
        size: "M",
        color: "Brown",
        measurements: { chest: "36in", length: "24in" },
        stock: 4
      },
      {
        productId: product6.id,
        size: "L",
        color: "Black",
        measurements: { chest: "38in", length: "25in" },
        stock: 2
      }
    ]
  });

  console.log(`✅ Created product: ${product6.name} with variants and images`);

  const product7 = await db.product.create({
    data: {
      designerId: designer2Profile.id,
      name: "Casual Knit Sweater",
      description: "Cozy and comfortable knit sweater for everyday wear",
      price: 95.00,
      category: "FEMALE",
      isVisible: true
    }
  });

  await db.productImage.create({
    data: {
      productId: product7.id,
      publicId: "unsplash-sweater",
      url: getNextImageUrl()
    }
  });

  await db.productVariant.createMany({
    data: [
      {
        productId: product7.id,
        size: "10",
        color: "Cream",
        measurements: { chest: "34in", length: "25in" },
        stock: 5
      },
      {
        productId: product7.id,
        size: "12",
        color: "Burgundy",
        measurements: { chest: "36in", length: "26in" },
        stock: 6
      },
      {
        productId: product7.id,
        size: "14",
        color: "Navy",
        measurements: { chest: "38in", length: "27in" },
        stock: 4
      }
    ]
  });

  console.log(`✅ Created product: ${product7.name} with variants and images`);

  // Create CUSTOMER users
  console.log("\n📝 Creating customer users...");
  
  const customer1Password = await bcrypt.hash("customer123", 12);
  const customer1 = await db.user.create({
    data: {
      email: "emma@customer.com",
      name: "Emma Johnson",
      password: customer1Password,
      phone: "+1234567890",
      role: "CUSTOMER",
      isActive: true
    }
  });
  console.log(`✅ Created CUSTOMER: ${customer1.email}`);

  const customer2Password = await bcrypt.hash("customer456", 12);
  const customer2 = await db.user.create({
    data: {
      email: "james@customer.com",
      name: "James Smith",
      password: customer2Password,
      phone: "+1987654321",
      role: "CUSTOMER",
      isActive: true
    }
  });
  console.log(`✅ Created CUSTOMER: ${customer2.email}`);

  const customer3Password = await bcrypt.hash("customer789", 12);
  const customer3 = await db.user.create({
    data: {
      email: "olivia@customer.com",
      name: "Olivia Chen",
      password: customer3Password,
      phone: "+1555123456",
      role: "CUSTOMER",
      isActive: true
    }
  });
  console.log(`✅ Created CUSTOMER: ${customer3.email}`);

  // Create ORDERS
  console.log("\n📦 Creating orders...");
  
  const order1 = await db.order.create({
    data: {
      customerId: customer1.id,
      status: "COMPLETED"
    }
  });

  // Get first variant of product1
  const product1Variant = await db.productVariant.findFirst({
    where: { productId: product1.id }
  });

  await db.orderItem.create({
    data: {
      orderId: order1.id,
      productId: product1.id,
      variantId: product1Variant?.id,
      designerId: designer1Profile.id,
      quantity: 1
    }
  });

  // Get first variant of product3
  const product3Variant = await db.productVariant.findFirst({
    where: { productId: product3.id }
  });

  await db.orderItem.create({
    data: {
      orderId: order1.id,
      productId: product3.id,
      variantId: product3Variant?.id,
      designerId: designer2Profile.id,
      quantity: 1
    }
  });

  console.log(`✅ Created order with 2 items for ${customer1.email}`);

  const order2 = await db.order.create({
    data: {
      customerId: customer2.id,
      status: "CONFIRMED"
    }
  });

  // Get first variant of product2
  const product2Variant = await db.productVariant.findFirst({
    where: { productId: product2.id }
  });

  await db.orderItem.create({
    data: {
      orderId: order2.id,
      productId: product2.id,
      variantId: product2Variant?.id,
      designerId: designer1Profile.id,
      quantity: 2
    }
  });

  console.log(`✅ Created order with 1 item for ${customer2.email}`);

  const order3 = await db.order.create({
    data: {
      customerId: customer3.id,
      status: "PENDING"
    }
  });

  // Get first variant of product7
  const product7Variant = await db.productVariant.findFirst({
    where: { productId: product7.id }
  });

  await db.orderItem.create({
    data: {
      orderId: order3.id,
      productId: product7.id,
      variantId: product7Variant?.id,
      designerId: designer2Profile.id,
      quantity: 1
    }
  });

  console.log(`✅ Created order with 1 item for ${customer3.email}`);

  // Create VOTES
  console.log("\n👍 Creating votes...");
  
  const voteData = [
    { userId: customer1.id, productId: product1.id },
    { userId: customer1.id, productId: product3.id },
    { userId: customer1.id, productId: product5.id },
    { userId: customer2.id, productId: product2.id },
    { userId: customer2.id, productId: product4.id },
    { userId: customer2.id, productId: product6.id },
    { userId: customer3.id, productId: product1.id },
    { userId: customer3.id, productId: product7.id },
  ];

  let voteCount = 0;
  for (const vote of voteData) {
    try {
      await db.vote.create({
        data: vote
      });
      voteCount++;
    } catch (e) {
      // Duplicate votes - skip
    }
  }
  console.log(`✅ Created ${voteCount} votes`);

  // Create platform settings
  console.log("\n⚙️ Creating platform settings...");
  const settings = await db.platformSetting.create({
    data: {
      votingEnabled: true,
      eventPhase: "BEFORE_SHOW"
    }
  });

  console.log(`✅ Created platform settings`);
  console.log(`   Voting: ${settings.votingEnabled ? "Enabled" : "Disabled"}`);
  console.log(`   Phase: ${settings.eventPhase}`);

  console.log("\n✨ Database seeding completed successfully!\n");
  console.log("📊 Summary:");
  console.log("  • 1 Super Admin, 3 Designers, 3 Customers");
  console.log("  • 7 Products with variants and images");
  console.log("  • 3 Orders with items");
  console.log("  • 8 Product votes");
  console.log("\n🔐 Test Credentials:");
  console.log("  SUPER_ADMIN: admin@loveontherunway.com / admin123");
  console.log("  DESIGNER 1: sophie@designerstudio.com / designer123");
  console.log("  DESIGNER 2: james@couture.com / designer456");
  console.log("  DESIGNER 3 (unapproved): maya@designs.com / designer789");
  console.log("  CUSTOMER 1: emma@customer.com / customer123");
  console.log("  CUSTOMER 2: james@customer.com / customer456");
  console.log("  CUSTOMER 3: olivia@customer.com / customer789");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
