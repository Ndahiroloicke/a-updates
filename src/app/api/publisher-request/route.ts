import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { NotificationType, Prisma, RequestStatus } from "@prisma/client";

// POST - Create a new publisher request
export async function POST(request: NextRequest) {
  try {
    console.log("POST publisher request: Starting");
    
    // Validate the user
    const { user } = await validateRequest();
    if (!user || !user.id) {
      console.log("POST publisher request: Unauthorized");
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Get JSON data from request
    const data = await request.json();
    const { category, requirements } = data;

    // Validate required fields
    if (!requirements) {
      console.log("POST publisher request: Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log(`POST publisher request: User ${user.id}, requirements provided`);

    // Check if user is already a publisher
    const userRecord = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        role: true,
        email: true,
      },
    });

    if (userRecord?.role === "PUBLISHER") {
      console.log("POST publisher request: User is already a publisher");
      return NextResponse.json(
        { 
          error: "You are already a publisher",
          message: "Your account already has publisher privileges. You can create and publish content." 
        },
        { status: 400 }
      );
    }

    // Check if user already has a pending request - use proper WHERE clause without email
    console.log("POST publisher request: Checking for existing requests");
    const existingRequests = await prisma.$queryRaw`
      SELECT * FROM publisher_requests 
      WHERE "userId" = ${user.id} 
      AND status = 'PENDING'
    `;
    
    // Check if there are any results
    if (Array.isArray(existingRequests) && existingRequests.length > 0) {
      console.log("POST publisher request: User already has a pending request");
      return NextResponse.json(
        { 
          error: "You already have a pending request",
          message: "Your publisher request is currently being reviewed. You'll be notified once a decision is made." 
        },
        { status: 400 }
      );
    }

    // Get the user's email from their profile
    const userEmail = userRecord?.email || "";
    console.log(`POST publisher request: Using email: ${userEmail}`);

    // Find all admin users to notify
    const adminUsers = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      select: {
        id: true,
      },
    });

    console.log(`POST publisher request: Found ${adminUsers.length} admins to notify`);

    // Use transaction to ensure atomic operations
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Create publisher request - Note: the email field does not exist in the schema
        console.log("POST publisher request: Creating request");
        const publisherRequest = await tx.publisherRequest.create({
          data: {
            userId: user.id,
            message: requirements,
            status: RequestStatus.PENDING,
          },
        });
        console.log(`POST publisher request: Created request with ID ${publisherRequest.id}`);

        // Create notifications for admins
        if (adminUsers.length > 0) {
          console.log("POST publisher request: Creating admin notifications");
          for (const admin of adminUsers) {
            await tx.notification.create({
              data: {
                recipientId: admin.id,
                issuerId: user.id,
                type: NotificationType.BECOME_PUBLISHER,
                body: `New publisher request from ${userEmail}: ${requirements}`,
                publisherRequestId: publisherRequest.id,
              },
            });
          }
        }

        // Create notification for the user
        console.log("POST publisher request: Creating user notification");
        await tx.notification.create({
          data: {
            recipientId: user.id,
            issuerId: user.id,
            type: NotificationType.BECOME_PUBLISHER,
            body: "Your publisher request has been submitted and is pending review.",
          },
        });

        return publisherRequest;
      });

      // Add email to the response for frontend compatibility
      const responseData = {
        ...result,
        email: userEmail,
        category: category || "General",
      };

      console.log("POST publisher request: Success");
      return NextResponse.json(responseData, { status: 201 });
    } catch (createError) {
      console.error("Error in transaction:", createError);
      throw createError;
    }
  } catch (error) {
    console.error("Error creating publisher request:", error);
    
    // More detailed error response
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(`Prisma error code: ${error.code}, message: ${error.message}`);
    }
    
    return NextResponse.json(
      { error: "Failed to create publisher request", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// GET - Fetch publisher requests
export async function GET(request: NextRequest) {
  try {
    console.log("GET publisher requests: Starting");
    
    // Validate the user
    const { user } = await validateRequest();
    if (!user || !user.id) {
      console.log("GET publisher requests: Unauthorized");
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    console.log(`GET publisher requests: User ${user.id}, role ${user.role}`);
    
    // Check if the user is an admin
    const isAdmin = user.role === "ADMIN";
    console.log(`GET publisher requests: isAdmin = ${isAdmin}`);

    try {
      // Construct the query based on user role
      const requests = await prisma.publisherRequest.findMany({
        where: isAdmin 
          ? {} // Admin can see all requests
          : { userId: user.id }, // Normal users can only see their own requests
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              email: true,
            },
          },
        },
        orderBy: {
          requestedAt: "desc",
        },
      });
      
      console.log(`GET publisher requests: Found ${requests.length} requests`);

      // Transform the data to match the expected format in the frontend
      // Use the email from the user record
      const transformedRequests = requests.map(req => ({
        id: req.id,
        userId: req.userId,
        email: req.user?.email || "",
        message: req.message || "",
        category: "General", // Default category since we don't store it separately
        status: req.status,
        requestedAt: req.requestedAt,
        user: req.user
      }));

      return NextResponse.json(transformedRequests, { status: 200 });
    } catch (queryError) {
      console.error("Error in database query:", queryError);
      throw queryError;
    }
  } catch (error) {
    console.error("Error fetching publisher requests:", error);
    
    // More detailed error response
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(`Prisma error code: ${error.code}, message: ${error.message}`);
    }
    
    return NextResponse.json(
      { error: "Failed to fetch publisher requests", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Route handler file for dynamic request ID
export const dynamic = "force-dynamic";