import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export type AppRole = "SUPER_ADMIN" | "DESIGNER" | "CUSTOMER";

export async function requireSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.isActive) {
    redirect("/login");
  }

  return session;
}

export async function requireRole(roles: AppRole[]) {
  const session = await requireSession();

  if (!roles.includes(session.user.role)) {
    redirect("/");
  }

  return session;
}
