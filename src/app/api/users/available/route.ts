import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { user: loggedInUser } = await validateRequest();

        if (!loggedInUser || loggedInUser.role !== "ADMIN") {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const query = url.searchParams.get("q") || "";

        const whereClause = query.length > 0 
            ? {
                AND: [
                    {
                        OR: [
                            { username: { contains: query, mode: "insensitive" } },
                            { displayName: { contains: query, mode: "insensitive" } },
                            { email: { contains: query, mode: "insensitive" } }
                        ]
                    },
                    {
                        role: { notIn: ["ADMIN", "SUB_ADMIN"] }
                    },
                    {
                        SubAdmin: null
                    }
                ]
            }
            : {
                AND: [
                    {
                        role: { notIn: ["ADMIN", "SUB_ADMIN"] }
                    },
                    {
                        SubAdmin: null
                    }
                ]
            };

        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                username: true,
                displayName: true,
                email: true,
                avatarUrl: true,
                role: true
            },
            orderBy: {
                displayName: "asc"
            },
            take: 20
        });

        return Response.json(users);
    } catch (error) {
        console.error("Error fetching available users:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
} 