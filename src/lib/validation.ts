import { z } from "zod";
import { Category } from "@prisma/client";

const requiredString = z.string().trim().min(1, "Required");

export const signUpSchema = z.object({
  email: requiredString.email("Invalid email address"),
  username: requiredString.regex(
    /^[a-zA-Z0-9_-]+$/,
    "Only letters, numbers, - and _ allowed",
  ),
  password: requiredString.min(8, "Must be at least 8 characters"),
});

export type SignUpValues = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  username: requiredString,
  email: z.string().email("Invalid email address"),
  password: requiredString,
  keepLoggedIn: z.boolean().default(false),
})

export type LoginValues = z.infer<typeof loginSchema>;

export const createPostSchema = z.object({
  title: requiredString,
  description: requiredString,
  body: z.string().optional(),
  mediaIds: z.array(z.string()).max(5, "Cannot have more than 5 attachments"),
  category: z.nativeEnum(Category),
});

export const createStorySchema = z.object({
  title: requiredString,
  description: requiredString,
  mediaId: requiredString,
});

export const createPollSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  options: z.array(z.string()).min(2).max(6),
  endDate: z.string().datetime().optional(),
  isAnonymous: z.boolean().optional()
});

export const updateUserProfileSchema = z.object({
  displayName: requiredString,
  bio: z.string().max(1000, "Must be at most 1000 characters"),
});

export type UpdateUserProfileValues = z.infer<typeof updateUserProfileSchema>;

export const createCommentSchema = z.object({
  content: requiredString,
});

export type AddLinkValues = z.infer<typeof addLinkSchema>;
export const addLinkSchema = z.object({
  title: requiredString,
  url: requiredString.url("Invalid URL"),
  category: requiredString,
})
