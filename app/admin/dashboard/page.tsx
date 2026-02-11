import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await requireRole(["SUPER_ADMIN", "DESIGNER"]);
  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  let productCount = 0;
  let orderCount = 0;
  let voteCount = 0;
  let designerCount = 0;
  let designerLogo: string | null = null;
  let designerBrandName: string | null = null;

  if (isSuperAdmin) {
    // Super admin sees all data
    [productCount, orderCount, voteCount, designerCount] = await Promise.all([
      db.product.count(),
      db.order.count(),
      db.vote.count(),
      db.designerProfile.count()
    ]);
  } else {
    // Designer sees only their own data
    const designerProfile = await db.designerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, brandLogo: true, brandName: true }
    });

    if (designerProfile) {
      designerLogo = designerProfile.brandLogo;
      designerBrandName = designerProfile.brandName;
    }

    if (designerProfile) {
      [productCount, orderCount, voteCount] = await Promise.all([
        db.product.count({
          where: { designerId: designerProfile.id }
        }),
        db.orderItem.count({
          where: { designerId: designerProfile.id }
        }),
        db.vote.count({
          where: {
            product: { designerId: designerProfile.id }
          }
        })
      ]);
    }
  }

  const quickActions = [
    {
      label: "Create Product",
      href: "/admin/products/create",
      description: "Add a new collection piece",
      color: "bg-purple-600 text-white hover:bg-purple-700",
      visible: !isSuperAdmin
    },
    {
      label: "Manage Products",
      href: "/admin/products",
      description: "Edit listings and visibility",
      color: "bg-slate-900 text-white hover:bg-slate-800",
      visible: !isSuperAdmin
    },
    {
      label: "View Orders",
      href: "/admin/orders",
      description: "Track new purchases",
      color: "bg-emerald-600 text-white hover:bg-emerald-700",
      visible: true
    },
    {
      label: "Designers",
      href: "/admin/designers",
      description: "Approve and manage designers",
      color: "bg-indigo-600 text-white hover:bg-indigo-700",
      visible: isSuperAdmin
    },
    {
      label: "Settings",
      href: "/admin/settings",
      description: "Platform configuration",
      color: "bg-amber-500 text-white hover:bg-amber-600",
      visible: isSuperAdmin
    }
  ];

  return (
    <section className="space-y-6">
      {/* Designer Brand Card - Only for Designers */}
      {!isSuperAdmin && designerBrandName && (
        <div className="rounded-3xl bg-gradient-to-br from-purple-50 via-white to-slate-50 p-6 border border-purple-100 shadow-sm">
          <div className="flex items-center gap-4">
            {designerLogo ? (
              <img
                src={designerLogo}
                alt={`${designerBrandName} logo`}
                className="h-16 w-16 object-cover rounded-xl border-2 border-purple-200 flex-shrink-0"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-purple-200 flex items-center justify-center text-purple-700 font-bold text-xl">
                {designerBrandName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Your Brand</p>
              <h2 className="text-2xl font-black text-slate-900">{designerBrandName}</h2>
              <p className="text-sm text-slate-600 mt-1">Designer Dashboard</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Products / Designers Card */}
        {isSuperAdmin ? (
          <Link href="/admin/designers">
            <div className="group rounded-2xl border border-slate-200 bg-white p-4 md:p-6 transition-all hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-600 group-hover:text-indigo-700">Designers</p>
                <div className="h-8 w-8 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center text-indigo-600 text-lg">
                  🧵
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-slate-900">{designerCount}</p>
              <p className="text-xs text-slate-500 mt-2">Onboarded designers</p>
            </div>
          </Link>
        ) : (
          <Link href="/admin/products">
            <div className="group rounded-2xl border border-slate-200 bg-white p-4 md:p-6 transition-all hover:border-purple-300 hover:bg-purple-50 cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-600 group-hover:text-purple-700">Products</p>
                <div className="h-8 w-8 rounded-lg bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center text-purple-600 text-lg">
                  📦
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-slate-900">{productCount}</p>
              <p className="text-xs text-slate-500 mt-2">Active catalog entries</p>
            </div>
          </Link>
        )}

        {/* Orders Card */}
        <Link href="/admin/orders">
          <div className="group rounded-2xl border border-slate-200 bg-white p-4 md:p-6 transition-all hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-600 group-hover:text-emerald-700">Orders</p>
              <div className="h-8 w-8 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center text-emerald-600 text-lg">
                🛍️
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-slate-900">{orderCount}</p>
            <p className="text-xs text-slate-500 mt-2">Orders placed</p>
          </div>
        </Link>

        {/* Votes Card */}
        {/* {isSuperAdmin ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Votes</p>
              <div className="h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 text-lg">
                ❤️
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-slate-900">{voteCount}</p>
            <p className="text-xs text-slate-500 mt-2">Audience engagement</p>
          </div>
        ) : (
          <Link href="/admin/products">
            <div className="group rounded-2xl border border-slate-200 bg-white p-4 md:p-6 transition-all hover:border-rose-300 hover:bg-rose-50 cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-600 group-hover:text-rose-700">Votes</p>
                <div className="h-8 w-8 rounded-lg bg-rose-100 group-hover:bg-rose-200 flex items-center justify-center text-rose-600 text-lg">
                  ❤️
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-slate-900">{voteCount}</p>
              <p className="text-xs text-slate-500 mt-2">Audience engagement</p>
            </div>
          </Link>
        )} */}

        {/* Role Card - Not Clickable */}
        {/* <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Role</p>
            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg">
              👤
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{isSuperAdmin ? "Admin" : "Designer"}</p>
          <p className="text-xs text-slate-500 mt-2">Access level</p>
        </div> */}
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-lg md:text-xl font-bold text-slate-900">Quick Actions</h2>
          <p className="text-sm text-slate-600 mt-1">Jump straight into key workflows.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.filter((action) => action.visible).map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{action.description}</p>
              </div>
              <div className={`ml-3 rounded-lg px-3 py-1.5 text-xs font-bold ${action.color} transition-all`}>
                →
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
