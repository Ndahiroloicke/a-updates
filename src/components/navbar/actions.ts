"use server"
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";


export async function becomePublisher() {
    const { user } = await validateRequest()
    const userInfo = await prisma.user.findUnique({
        where: { id: user?.id }
    });

    const adminUsers = await prisma.user.findMany({
        where: { role: "ADMIN" }
    });

    if (!user) throw new Error("Unauthorized");
    if (userInfo?.role == "PUBLISHER") throw new Error("You are already a publisher");

    await prisma.$transaction(async (tx) => {
        await tx.publisherRequest.create({
            data: {
                userId: user.id,
                status: "PENDING",
            },
        });

        await tx.notification.create({
            data: {
                recipientId: user.id,
                issuerId: user.id,
                type: "BECOME_PUBLISHER",
                body: "Your request to become a publisher has been submitted.",
                read: false,
            },
        });

        await Promise.all(
            adminUsers.map((admin) =>
                tx.notification.create({
                    data: {
                        recipientId: admin.id,
                        issuerId: user.id,
                        type: "BECOME_PUBLISHER",
                        body: `${user.displayName} requested to become publisher`,
                        read: false,
                    },
                })
            )
        );
        return true;  
    });

}