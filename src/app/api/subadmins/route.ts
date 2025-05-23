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

    // Get all users with SUB_ADMIN role instead of using subAdmin model directly
    const subAdminUsers = await prisma.user.findMany({
      where: {
        role: "SUB_ADMIN",
      },
      include: {
        SubAdmin: true,
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Format the data to match the UI expectations
    const formattedSubAdmins = subAdminUsers.map(user => ({
      id: user.SubAdmin?.id || '',
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      role: user.SubAdmin?.subRole || 'general',
      permissions: user.SubAdmin?.permissions || [],
      status: "active", // We could add a status field to the model if needed
      lastActive: user.SubAdmin?.updatedAt.toISOString() || user.createdAt.toISOString(),
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
    const existingSubAdmin = await prisma.user.findFirst({
      where: { 
        id: userId,
        role: "SUB_ADMIN"
      },
      include: {
        SubAdmin: true
      }
    });

    if (existingSubAdmin && existingSubAdmin.SubAdmin) {
      return Response.json(
        { error: "User is already a sub-admin" },
        { status: 400 }
      );
    }

    // Create the sub-admin record and update user role in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user role
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { role: "SUB_ADMIN" }
      });

      // Create sub-admin record
      const subAdmin = await tx.subAdmin.create({
        data: {
          userId,
          subRole,
          permissions,
        }
      });

      return {
        user: updatedUser,
        subAdmin
      };
    });

    // Format the response
    const formattedSubAdmin = {
      id: result.subAdmin.id,
      userId: result.subAdmin.userId,
      username: result.user.username,
      displayName: result.user.displayName,
      email: result.user.email,
      role: result.subAdmin.subRole,
      permissions: result.subAdmin.permissions,
      status: "active",
      lastActive: result.subAdmin.createdAt.toISOString(),
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