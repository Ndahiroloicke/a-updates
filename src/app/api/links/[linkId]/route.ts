
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params: { linkId } }: { params: { linkId: string } }
) {
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

    const link = await prisma.link.findUnique({
      where: { id: linkId },
    });

    if (!link) {
      return new Response(JSON.stringify({ error: "Link not found" }), { status: 404 });
    }

    const updatedLink = await prisma.link.update({
      where: { id: linkId },
      data: {
        title,
        url,
        category,
      },
    });

    return new Response(JSON.stringify(updatedLink), { status: 200 });
  } catch (error) {
    console.error("Error updating link:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
