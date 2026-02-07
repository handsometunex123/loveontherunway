const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function fixDesignerUserInconsistencies() {
  try {
    console.log("Starting to fix designer-user inconsistencies...");

    // Step 1: Fetch all designer profiles with their associated users
    const allProfiles = await db.designerProfile.findMany({
      include: { user: true },
    });

    console.log(`Found ${allProfiles.length} total designer profiles.`);

    // Step 2: Find orphaned profiles (where user is null - shouldn't happen with cascade delete)
    const orphanedProfiles = allProfiles.filter((profile: any) => !profile.user);

    console.log(`Found ${orphanedProfiles.length} orphaned designer profiles (no associated user).`);

    // Step 3: Find users with DESIGNER role but no designer profile
    const designerUsersWithoutProfile = await db.user.findMany({
      where: {
        role: 'DESIGNER',
        designerProfile: null,
      },
    });

    console.log(`Found ${designerUsersWithoutProfile.length} users with DESIGNER role but no profile.`);

    // Step 4: Fix orphaned profiles by creating users for them
    for (const profile of orphanedProfiles) {
      console.log(`Fixing designer profile with ID: ${profile.id}, brandName: ${profile.brandName}`);

      // Create a new user record with DESIGNER role
      const newUser = await db.user.create({
        data: {
          email: `designer_${profile.id}@placeholder.com`,
          name: profile.brandName || `Designer ${profile.id}`,
          password: '', // Placeholder - user will need to reset
          role: 'DESIGNER',
        },
      });

      console.log(`Created new user with ID: ${newUser.id} for designer profile ID: ${profile.id}`);

      // Update the designer profile with the new userId
      await db.designerProfile.update({
        where: { id: profile.id },
        data: { userId: newUser.id },
      });

      console.log(`Updated designer profile ID: ${profile.id} with userId: ${newUser.id}`);
    }

    // Step 5: Create designer profiles for users with DESIGNER role but no profile
    for (const user of designerUsersWithoutProfile) {
      console.log(`Creating designer profile for user ID: ${user.id}, email: ${user.email}`);

      await db.designerProfile.create({
        data: {
          userId: user.id,
          brandName: user.name || `Brand ${user.id}`,
          isApproved: false,
          isVisible: true,
          isDeleted: false,
        },
      });

      console.log(`Created designer profile for user ID: ${user.id}`);
    }

    console.log("All inconsistencies have been fixed.");
  } catch (error) {
    console.error("Error fixing designer-user inconsistencies:", error);
  } finally {
    await db.$disconnect();
  }
}

fixDesignerUserInconsistencies();