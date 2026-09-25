"use server";

import { ActionResponse } from "@/types";

/**
 * Higher-order helper for executing safe, typed Server Actions with standard error formatting.
 */
export async function createSafeAction<TInput, TOutput>(
  action: (input: TInput) => Promise<TOutput>,
  input: TInput
): Promise<ActionResponse<TOutput>> {
  try {
    const data = await action(input);
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Action error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
    };
  }
}
