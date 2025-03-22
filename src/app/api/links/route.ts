import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma"; 

export async function POST(req: Request) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const body = await req.json();
    const { title, url, category } = body;

    if (!title || !url || !category) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const newLink = await prisma.link.create({
      data: {
        title,
        url,
        category,
        createdAt: new Date(),
      },
    });

    return new Response(JSON.stringify(newLink), { status: 201 });
  } catch (error) {
    console.error("Error creating link:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
