import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getCommentDataInclude } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { postId } }: { params: { postId: string } }
) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;

    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            followers: {
              select: {
                followerId: true,
              },
            },
            _count: {
              select: {
                followers: true,
                posts: true,
              },
            },
          },
        },
      },
    });

    const previousCursor = comments.length > pageSize ? comments[pageSize].id : null;

    const data = {
      comments: comments.slice(0, pageSize),
      previousCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params: { postId } }: { params: { postId: string } }
) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();

    if (!content || typeof content !== "string" || content.length === 0) {
      return Response.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    const [comment] = await prisma.$transaction([
      prisma.comment.create({
        data: {
          content,
          postId,
          userId: user.id,
        },
        include: getCommentDataInclude(user.id),
      }),
      // Create notification if comment is not by post author
      ...(post.userId !== user.id
        ? [
            prisma.notification.create({
              data: {
                type: "COMMENT",
                postId,
                issuerId: user.id,
                recipientId: post.userId,
              },
            }),
          ]
        : []),
    ]);

    return Response.json(comment);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 