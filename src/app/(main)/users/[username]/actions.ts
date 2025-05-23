"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { getUserDataSelect } from "@/lib/types";
import {
  updateUserProfileSchema,
  UpdateUserProfileValues,
} from "@/lib/validation";

export async function updateUserProfile(values: UpdateUserProfileValues & { avatarUrl?: string }) {
  const validatedValues = updateUserProfileSchema.parse(values);

  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  const updatedUser = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: {
        ...validatedValues,
        avatarUrl: values.avatarUrl || undefined, // Store avatar URL if provided
      },
      select: getUserDataSelect(user.id),
    });

    // Update Stream user data
    await streamServerClient.partialUpdateUser({
      id: user.id,
      set: {
        name: validatedValues.displayName,
        avatar: values.avatarUrl || updatedUser.avatarUrl, // Ensure Stream gets the updated avatar
      },
    });

    return updatedUser;
  });

  return updatedUser;
}
