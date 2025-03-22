"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, getStoryDataInclude } from "@/lib/types";
import { createPollSchema, createPostSchema, createStorySchema } from "@/lib/validation";

export async function submitPost(input: {
  title: string;
  description: string;
  body: string;
  mediaIds: string[];
  category: string;
}) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const { title, description, body, mediaIds, category } = createPostSchema.parse(input);

  const newPost = await prisma.post.create({
    data: {
      title,
      description,
      body,
      category,
      userId: user.id,
      attachments: {
        connect: mediaIds.map((id) => ({ id })),
      },
    },
    include: getPostDataInclude(user.id),
  });

  return newPost;
}


export async function submitStory(input: {
  title: string;
  description: string;
  mediaId: string;
}) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  if (!input.mediaId) throw new Error("Please provide a file for the story")

  const { title, description, mediaId } = createStorySchema.parse(input);

  const newStory = await prisma.story.create({
    data: {
      title,
      description,
      userId: user.id,
      mediaId: mediaId
    },
    include: getStoryDataInclude(user.id),
  });

  return newStory;
}




export async function submitPoll(input: {
  title: string;
  description: string;
  options: string[];
  endDate?: string;
  isAnonymous?: boolean;
}) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");
  
  const result = await prisma.$transaction(async (tx) => {
    const post = await tx.post.create({
      data: {
        title: input.title,
        description: input.description,
        userId: user.id,
        body: "",
      }
    });

    const newPoll = await tx.poll.create({
      data: {
        title: input.title,
        description: input.description,
        postId: post.id,
        endDate: input.endDate ? new Date(input.endDate) : null,
        isAnonymous: input.isAnonymous || false,
        options: {
          createMany: {
            data: input.options.map(title => ({
              title,
            }))
          }
        }
      },
      include: {
        options: true,
        _count: {
          select: {
            votes: true
          }
        }
      }
    });

    return { post, poll: newPoll };
  });

  return result;
}

type AdvertisementInput = {
  name: string;
  location: string;
  type: string;
  mediaId: string;
};

export async function submitAdvertisement(input: AdvertisementInput) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const { name, location, type, mediaId } = input;

  const newAdvertisement = await prisma.advertisement.create({
    data: {
      name,
      location,
      type,
      mediaId,
      userId: user.id,
      status: "active",
      // You might want to add additional fields from the registration form here
    },
    include: {
      media: true,
      user: true,
    },
  });

  return newAdvertisement;
}