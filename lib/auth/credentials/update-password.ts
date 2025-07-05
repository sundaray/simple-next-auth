import "server-only";
import chalk from "chalk";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Updates a user's password in the database.
 * This function takes a pre-hashed password and associates it with the user's account.
 * Note: The password should be hashed before calling this function.
 */
export async function updatePassword(
  email: string,
  hashedPassword: string,
): Promise<void> {
  try {
    await db
      .update(usersTable)
      .set({ password: hashedPassword })
      .where(eq(usersTable.email, email));
  } catch (error) {
    console.error(chalk.red("[updatePassword] error:"), error);
    const message =
      error instanceof Error ? error.message : `Unknown error: ${error}`;
    throw new Error(`Failed to update user password: ${message}`);
  }
}
