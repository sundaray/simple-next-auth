"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/************************************************
 *
 * Sign out
 *
 ************************************************/

export async function signOut() {
  const cookiesStore = await cookies();
  cookiesStore.delete("user-session");
  redirect("/");
}
