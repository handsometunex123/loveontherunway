import { requireRole } from "@/lib/authorization";
import AdminNav from "./AdminNav";
import { db } from "@/lib/db";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["SUPER_ADMIN", "DESIGNER"]);
  const isSuperAdmin = session.user.role === "SUPER_ADMIN";
  
  let displayName = session.user.name || session.user.email || "User";
  
  // If user is a designer, use their brand name
  if (session.user.role === "DESIGNER") {
    const designerProfile = await db.designerProfile.findUnique({
      where: { userId: session.user.id }
    });
    if (designerProfile?.brandName) {
      displayName = designerProfile.brandName;
    }
  }
  
  const email = session.user.email || "—";
  const roleLabel = session.user.role === "SUPER_ADMIN" ? "Super Admin" : "Designer";

  return (
    <section className="space-y-4 md:space-y-6 px-4 md:px-0">
      <div className="rounded-2xl md:rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-purple-900 p-4 md:p-6 border border-purple-800/30">
        {/* Mobile Version */}
        <div className="md:hidden flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{displayName}</p>
            <p className="text-xs text-purple-200 truncate">{roleLabel}</p>
          </div>
        </div>

        {/* Desktop Version */}
        <div className="hidden md:flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-200">Admin Portal</p>
            <h1 className="text-4xl font-bold text-white mt-1">Welcome back, {displayName}</h1>
            <p className="text-sm text-purple-100/90 mt-1">Manage your collections, orders, and brand presence.</p>
          </div>

          <div className="rounded-xl bg-white/5 px-4 py-3 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                <p className="text-xs text-purple-200 truncate">{email}</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white whitespace-nowrap">
                {roleLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      <AdminNav isSuperAdmin={isSuperAdmin} />

      <div className="rounded-2xl md:rounded-3xl bg-white p-4 md:p-6 shadow-lg border border-slate-100 overflow-x-hidden">
        {children}
      </div>
    </section>
  );
}
