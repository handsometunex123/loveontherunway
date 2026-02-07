import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";

export default async function AdminProductsLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requireRole(["SUPER_ADMIN", "DESIGNER"]);

  return children;
}
