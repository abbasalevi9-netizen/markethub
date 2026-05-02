import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

export async function requireUser() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session;
}

export async function requireRole(role: Role) {
  const session = await requireUser();

  if (session.user.role !== role && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return session;
}
