import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth-guards";

export default async function DashboardPage() {
  const session = await requireUser();

  if (session.user.role === "ADMIN") {
    redirect("/dashboard/admin");
  }

  if (session.user.role === "STORE_OWNER") {
    redirect("/dashboard/owner");
  }

  redirect("/stores");
}
