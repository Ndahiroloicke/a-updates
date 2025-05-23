import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

// GET /api/subadmins/[id] - Get a specific sub-admin
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is an admin
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser || loggedInUser.role !== "ADMIN") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    // Get the sub-admin with user information
    const subAdmin = await prisma.subAdmin.findUnique({
      where: { id },
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

    if (!subAdmin) {
      return Response.json({ error: "Sub-admin not found" }, { status: 404 });
    }

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
      lastActive: subAdmin.updatedAt.toISOString(),
    };

    return Response.json(formattedSubAdmin);
  } catch (error) {
    console.error("Error fetching sub-admin:", error);
    return Response.json(
      { error: "Failed to fetch sub-admin" },
      { status: 500 }
    );
  }
}

// PATCH /api/subadmins/[id] - Update a sub-admin
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is an admin
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser || loggedInUser.role !== "ADMIN") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const body = await req.json();
    const { subRole, permissions } = body;

    // Validate required fields
    if (!subRole && (!permissions || !Array.isArray(permissions))) {
      return Response.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Check if the sub-admin exists
    const existingSubAdmin = await prisma.subAdmin.findUnique({
      where: { id }
    });

    if (!existingSubAdmin) {
      return Response.json(
        { error: "Sub-admin not found" },
        { status: 404 }
      );
    }

    // Update the sub-admin
    const updateData: { subRole?: string; permissions?: string[] } = {};
    if (subRole) updateData.subRole = subRole;
    if (permissions) updateData.permissions = permissions;

    const updatedSubAdmin = await prisma.subAdmin.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            email: true,
            avatarUrl: true,
          }
        }
      }
    });

    // Format the response
    const formattedSubAdmin = {
      id: updatedSubAdmin.id,
      userId: updatedSubAdmin.userId,
      username: updatedSubAdmin.user.username,
      displayName: updatedSubAdmin.user.displayName,
      email: updatedSubAdmin.user.email,
      role: updatedSubAdmin.subRole,
      permissions: updatedSubAdmin.permissions,
      status: "active",
      lastActive: updatedSubAdmin.updatedAt.toISOString(),
    };

    return Response.json(formattedSubAdmin);
  } catch (error) {
    console.error("Error updating sub-admin:", error);
    return Response.json(
      { error: "Failed to update sub-admin" },
      { status: 500 }
    );
  }
}

// DELETE /api/subadmins/[id] - Delete a sub-admin
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is an admin
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser || loggedInUser.role !== "ADMIN") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    // Check if the sub-admin exists
    const existingSubAdmin = await prisma.subAdmin.findUnique({
      where: { id }
    });

    if (!existingSubAdmin) {
      return Response.json(
        { error: "Sub-admin not found" },
        { status: 404 }
      );
    }

    // Delete the sub-admin and revert user role in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete the sub-admin record
      await tx.subAdmin.delete({
        where: { id }
      });

      // Update the user role back to USER
      await tx.user.update({
        where: { id: existingSubAdmin.userId },
        data: { role: "USER" }
      });
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting sub-admin:", error);
    return Response.json(
      { error: "Failed to delete sub-admin" },
      { status: 500 }
    );
  }
} 