import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";

export async function requireSubscriber() {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect("/entry");
  }

  if (session.role !== "subscriber" && session.role !== "creator") {
    redirect("/entry");
  }

  return session;
}

export async function requireCreator() {
  const session = await getSessionFromCookies();

  if (!session || session.role !== "creator") {
    redirect("/entry?error=creator-only");
  }

  return session;
}
