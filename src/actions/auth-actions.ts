"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { registerSchema, updateProfileSchema, RegisterInput, UpdateProfileInput } from "@/validations/auth";
import { ActionResponse } from "@/types";
import { Role } from "@prisma/client";

/**
 * Registers a new user with email and hashed password.
 */
export async function registerUserAction(input: RegisterInput): Promise<ActionResponse<{ id: string; email: string }>> {
  try {
    const validated = registerSchema.safeParse(input);

    if (!validated.success) {
      const fieldErrors = validated.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Please correct the highlighted form errors.",
        errors: fieldErrors,
      };
    }

    const { name, email, password } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check for existing user with identical email
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return {
        success: false,
        message: "An account with this email address already exists. Please sign in instead.",
      };
    }

    // Securely hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: Role.USER, // Explicitly enforce standard USER role
      },
      select: {
        id: true,
        email: true,
      },
    });

    return {
      success: true,
      message: "Your account has been created successfully. You can now sign in.",
      data: newUser,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: "An unexpected error occurred while creating your account. Please try again.",
    };
  }
}

/**
 * Updates the authenticated user's profile details.
 * Prevents normal users from changing role or other users' profiles.
 */
export async function updateProfileAction(input: UpdateProfileInput): Promise<ActionResponse<{ name: string }>> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !currentUser.id) {
      return {
        success: false,
        message: "Unauthorized. Please sign in to update your profile.",
      };
    }

    const validated = updateProfileSchema.safeParse(input);

    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || "Invalid profile data.",
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: validated.data.name.trim(),
      },
      select: {
        name: true,
      },
    });

    revalidatePath("/account");

    return {
      success: true,
      message: "Profile updated successfully.",
      data: { name: updatedUser.name ?? "" },
    };
  } catch (error) {
    console.error("Profile update error:", error);
    return {
      success: false,
      message: "Failed to update profile. Please try again.",
    };
  }
}
