import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { NotificationType, Prisma, RequestStatus } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("PATCH publisher request: Starting");
    
    const requestId = params.id;
    console.log(`PATCH publisher request: ID ${requestId}`);
    
    // Validate the user is an admin
    const { user } = await validateRequest();
    if (!user || !user.id || user.role !== "ADMIN") {
      console.log("PATCH publisher request: Unauthorized");
      return NextResponse.json(
        { error: "Unauthorized. Only admins can update publisher requests." },
        { status: 401 }
      );
    }

    // Get the data from the request
    const data = await request.json();
    const { status, message } = data;

    // Convert status string to enum
    let requestStatus: RequestStatus;
    if (status === "APPROVED") {
      requestStatus = RequestStatus.APPROVED;
    } else if (status === "REJECTED") {
      requestStatus = RequestStatus.REJECTED;
    } else {
      console.log(`PATCH publisher request: Invalid status ${status}`);
      return NextResponse.json(
        { error: "Invalid status. Status must be 'APPROVED' or 'REJECTED'." },
        { status: 400 }
      );
    }

    try {
      // Find the publisher request
      const publisherRequest = await prisma.publisherRequest.findUnique({
        where: { id: requestId },
        include: { user: true },
      });

      if (!publisherRequest) {
        console.log("PATCH publisher request: Request not found");
        return NextResponse.json(
          { error: "Publisher request not found" },
          { status: 404 }
        );
      }

      if (publisherRequest.status !== RequestStatus.PENDING) {
        console.log(`PATCH publisher request: Already ${publisherRequest.status.toLowerCase()}`);
        return NextResponse.json(
          { error: `Request has already been ${publisherRequest.status.toLowerCase()}` },
          { status: 400 }
        );
      }

      // Update the publisher request status
      const updatedRequest = await prisma.publisherRequest.update({
        where: { id: requestId },
        data: { 
          status: requestStatus,
          respondedAt: new Date()
        },
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
      });

      // If approved, update the user's role to PUBLISHER
      if (requestStatus === RequestStatus.APPROVED) {
        console.log(`PATCH publisher request: Updating user ${publisherRequest.userId} to PUBLISHER role`);
        await prisma.user.update({
          where: { id: publisherRequest.userId },
          data: { role: "PUBLISHER" },
        });
      }

      // Create a notification for the user
      console.log(`PATCH publisher request: Creating notification for user ${publisherRequest.userId}`);
      await prisma.notification.create({
        data: {
          recipientId: publisherRequest.userId,
          issuerId: user.id,
          type: NotificationType.BECOME_PUBLISHER,
          body: message || (requestStatus === RequestStatus.APPROVED 
            ? "Your publisher request has been approved! You can now create and publish content."
            : "Your publisher request has been rejected."),
        },
      });

      // Transform the response to match expected format in the frontend
      const transformedRequest = {
        id: updatedRequest.id,
        userId: updatedRequest.userId,
        email: updatedRequest.user.email || "",
        message: updatedRequest.message || "",
        category: "General", // Since we don't store category in the database
        status: updatedRequest.status,
        requestedAt: updatedRequest.requestedAt,
        user: updatedRequest.user
      };

      console.log(`PATCH publisher request: Successfully ${status.toLowerCase()} request`);
      return NextResponse.json(transformedRequest, {
        status: 200,
      });
    } catch (operationError) {
      console.error("Database operation error:", operationError);
      throw operationError;
    }
  } catch (error) {
    console.error("Error updating publisher request:", error);
    
    // More detailed error response
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(`Prisma error code: ${error.code}, message: ${error.message}`);
    }
    
    return NextResponse.json(
      { error: "Failed to update publisher request", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic"; 