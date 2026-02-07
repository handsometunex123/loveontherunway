import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import DesignersClient from "./DesignersClient";
import DesignerInviteForm from "./DesignerInviteForm";
import BackButton from "@/app/BackButton";

export default async function AdminDesignersPage() {
  await requireRole(["SUPER_ADMIN"]);

  const designers = await db.designerProfile.findMany({
    where: { isDeleted: false },
    include: { user: true, products: true },
    orderBy: [{ isApproved: "desc" }, { createdAt: "desc" }]
  });

  const deletedDesigners = await db.designerProfile.findMany({
    where: { isDeleted: true },
    include: { user: true, products: true },
    orderBy: [{ createdAt: "desc" }]
  });

  const designerStats = await db.designerProfile.findMany({
    select: { isApproved: true, isVisible: true, isDeleted: true }
  });

  const totalDesigners = designerStats.length;
  const approvedCount = designerStats.filter((designer: any) => designer.isApproved && !designer.isDeleted).length;
  const pendingCount = designerStats.filter((designer: any) => !designer.isApproved && !designer.isDeleted).length;
  const visibleCount = designerStats.filter((designer: any) => designer.isVisible && !designer.isDeleted).length;
  const hiddenCount = designerStats.filter((designer: any) => !designer.isVisible && !designer.isDeleted).length;
  const deletedCount = designerStats.filter((designer: any) => designer.isDeleted).length;

  return (
    <section>
      <div className="mb-6 md:mb-8 flex flex-col gap-4">
        <BackButton fallbackUrl="/admin/dashboard" />
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Designers</h2>
          <p className="text-sm text-slate-600 max-w-2xl">
            Manage designer onboarding, approvals, visibility, and access in one place.
          </p>
        </div>
        {/* <div className="flex flex-wrap gap-3">
          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
            Total: <span className="text-slate-900">{totalDesigners}</span>
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            Approved: <span className="text-emerald-900">{approvedCount}</span>
          </div>
          <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
            Pending: <span className="text-amber-900">{pendingCount}</span>
          </div>
          <div className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
            Visible: <span className="text-sky-900">{visibleCount}</span>
          </div>
          <div className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
            Deleted: <span className="text-rose-900">{deletedCount}</span>
          </div>
        </div> */}
      </div>

      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">Invite Designer</h3>
        <DesignerInviteForm />
      </div>

      <DesignersClient
        designers={designers}
        deletedDesigners={deletedDesigners}
        stats={{
          total: totalDesigners,
          approved: approvedCount,
          pending: pendingCount,
          visible: visibleCount,
          hidden: hiddenCount,
          deleted: deletedCount
        }}
      />
    </section>
  );
}
