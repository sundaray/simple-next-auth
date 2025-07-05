import { z } from "zod";

export const CreatePodcastSummaryFormSchema = z.object({
  videoId: z.string({ required_error: "YouTube video ID is required" }),

  videoTitle: z.string({ required_error: "YouTube video title is required" }),

  podcastSlug: z.string({ required_error: "Podcast slug is required" }),

  podcastHost: z.enum(
    ["mel-robbins", "joe-rogan", "jay-shetty", "chris-williamson"],
    {
      required_error: "Podcast host is required",
    },
  ),
});

export const BlogImageUploadFormSchema = z.object({
  image: z
    .instanceof(File, { message: "Please select an image file" })
    .refine((file) => file.size > 0, "Please select an image file")
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB",
    )
    .refine(
      (file) => ["image/jpeg", "image/jpg", "image/png"].includes(file.type),
      "Only PNG and JPG files are allowed",
    ),
});

export const FetchYouTubeThumbnailFormSchema = z.object({
  videoId: z.string({ required_error: "YouTube video ID is required" }),

  podcastSlug: z.string({ required_error: "Podcast slug is required" }),

  podcastHost: z.enum(
    [
      "andrew-huberman",
      "david-perell",
      "paul-millerd",
      "jay-clouse",
      "ed-mylett",
      "nathan-barry",
      "mel-robbins",
      "chris-williamson",
      "jay-shetty",
      "lewis-howes",
      "doac",
      "jack-neel",
      "simon-sinek",
      "tim-ferriss",
      "scott-d-clary",
      "daily-stoic",
      "rangan-chatterjee",
    ],
    {
      required_error: "Podcast host is required",
    },
  ),
});

export const FetchYouTubeUploadDateFormSchema = z.object({
  videoId: z.string({ required_error: "YouTube video ID is required" }),
});

export const SignUpEmailPasswordFormSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email" })
    .trim(),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { message: "contain at least one letter" })
    .regex(/[0-9]/, { message: "contain at least one number" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "contain at least one special character",
    })
    .trim(),
});

export const SubscriptionFormSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email" })
    .trim(),
});

export const SignInEmailPasswordFormSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email" })
    .trim(),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { message: "contain at least one letter" })
    .regex(/[0-9]/, { message: "contain at least one number" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "contain at least one special character",
    })
    .trim(),
});

export const ForgotPasswordFormSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email" })
    .trim(),
});

export const ResetPasswordFormSchema = z
  .object({
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(8, { message: "be at least 8 characters long" })
      .regex(/[a-zA-Z]/, { message: "contain at least one letter" })
      .regex(/[0-9]/, { message: "contain at least one number" })
      .regex(/[^a-zA-Z0-9]/, {
        message: "contain at least one special character",
      })
      .trim(),
    confirmNewPassword: z.string({
      required_error: "New password is required",
    }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    // This tells Zod which field to attach the error to
    path: ["confirmNewPassword"],
  });
