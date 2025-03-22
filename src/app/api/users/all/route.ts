import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";

export async function GET(req: Request) {
    try {
        const { user: loggedInUser } = await validateRequest();

        if (!loggedInUser) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page") || "1");
        const pageSize = 5;
        const skip = (page - 1) * pageSize;

        const users = await prisma.user.findMany({
            where: {
                role: "USER"
            },
            select: getUserDataSelect(loggedInUser.id),
            take: pageSize,
            skip,
        });

        const totalUsers = await prisma.user.count({
            where: {
                role: "USER"
            },
        });

        const nextPage = skip + pageSize < totalUsers ? page + 1 : null;
        const previousPage = page > 1 ? page - 1 : null;

        return Response.json({ data: users, nextPage, previousPage });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}
