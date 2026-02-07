export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { email, ...designerData } = body;

    await db.$transaction([
      db.user.create({
        data: {
          id: designerData.id,
          email,
          // Add other required fields for the user model
        },
      }),
      db.designerProfile.create({
        data: {
          ...designerData,
          userId: designerData.id, // Ensure userId matches the created user
        },
      }),
    ]);

    return NextResponse.json({ message: "Designer profile and user created successfully." });
  } catch (error) {
    console.error("Error creating designer profile and user:", error);
    return NextResponse.json({ error: "Failed to create designer profile and user." }, { status: 500 });
  }
}