import "server-only";

import { Option } from "effect";
import { AppRuntime } from "@/lib/runtime";
import { getUserSession } from "@/lib/auth/session/get-user-session";

export async function getUser() {
  const userOption = await AppRuntime.runPromise(getUserSession());
  const user = Option.getOrNull(userOption);
  return user;
}
