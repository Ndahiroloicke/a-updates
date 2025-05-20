import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

// GET /api/subadmins - Get all sub-admins
export async function GET(req: Request) {
  try {
    // Check if user is authenticated and is an admin
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser || loggedInUser.role !== "ADMIN") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all sub-admins with their user information
    const subAdmins = await prisma.subAdmin.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            email: true,
            avatarUrl: true,
            createdAt: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Format the data to match the UI expectations
    const formattedSubAdmins = subAdmins.map(admin => ({
      id: admin.id,
      userId: admin.userId,
      username: admin.user.username,
      displayName: admin.user.displayName,
      email: admin.user.email,
      role: admin.subRole,
      permissions: admin.permissions,
      status: "active", // We could add a status field to the model if needed
      lastActive: admin.updatedAt.toISOString(),
    }));

    return Response.json(formattedSubAdmins);
  } catch (error) {
    console.error("Error fetching sub-admins:", error);
    return Response.json(
      { error: "Failed to fetch sub-admins" },
      { status: 500 }
    );
  }
}

// POST /api/subadmins - Create a new sub-admin
export async function POST(req: Request) {
  try {
    // Check if user is authenticated and is an admin
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser || loggedInUser.role !== "ADMIN") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, subRole, permissions } = body;

    // Validate required fields
    if (!userId || !subRole || !permissions || !Array.isArray(permissions)) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if the user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userExists) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if the user is already a sub-admin
    const existingSubAdmin = await prisma.subAdmin.findUnique({
      where: { userId }
    });

    if (existingSubAdmin) {
      return Response.json(
        { error: "User is already a sub-admin" },
        { status: 400 }
      );
    }

    // Create the sub-admin record and update user role in a transaction
    const subAdmin = await prisma.$transaction(async (tx) => {
      // Update user role
      await tx.user.update({
        where: { id: userId },
        data: { role: "SUB_ADMIN" }
      });

      // Create sub-admin record
      return tx.subAdmin.create({
        data: {
          userId,
          subRole,
          permissions,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              email: true,
              avatarUrl: true,
              createdAt: true,
            }
          }
        }
      });
    });

    // Format the response
    const formattedSubAdmin = {
      id: subAdmin.id,
      userId: subAdmin.userId,
      username: subAdmin.user.username,
      displayName: subAdmin.user.displayName,
      email: subAdmin.user.email,
      role: subAdmin.subRole,
      permissions: subAdmin.permissions,
      status: "active",
      lastActive: subAdmin.createdAt.toISOString(),
    };

    return Response.json(formattedSubAdmin, { status: 201 });
  } catch (error) {
    console.error("Error creating sub-admin:", error);
    return Response.json(
      { error: "Failed to create sub-admin" },
      { status: 500 }
    );
  }
} 