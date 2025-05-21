import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const category = req.nextUrl.searchParams.get("category");
    const subcategory = req.nextUrl.searchParams.get("subcategory");
    
    const pageSize = 10;
    
    // If no category provided, return an error
    if (!category) {
      return new Response(JSON.stringify({ error: "Category parameter is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const { user } = await validateRequest();

    // We don't need to check authentication for public categories
    // if (!user) {
    //   return new Response(JSON.stringify({ error: "Unauthorized" }), {
    //     status: 401,
    //     headers: { "Content-Type": "application/json" },
    //   });
    // }
    
    // Convert the category to uppercase to match database format
    const categoryUpper = category.toUpperCase();
    
    const posts = await prisma.post.findMany({
      where: {
        category: categoryUpper,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
            createdAt: true,
            _count: {
              select: {
                posts: true,
                followers: true,
              },
            },
          },
        },
        attachments: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });
    
    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;
    
    const data = {
      posts: posts.slice(0, pageSize),
      nextCursor,
      category: category,
      subcategory: subcategory,
    };
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 