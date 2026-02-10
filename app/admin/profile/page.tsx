import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import BackButton from "@/app/BackButton";
import ProfileForm from "./profile-form";

export default async function DesignerProfilePage() {
  const session = await requireRole(["DESIGNER"]);

  const designerProfile = await db.designerProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: true }
  });

  if (!designerProfile) {
    return <p>Designer profile not found.</p>;
  }

  return (
    <section className="space-y-6">
      <div className="mb-4 md:mb-6">
        <BackButton fallbackUrl="/admin/dashboard" />
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">My Profile</h2>
          <p className="text-sm text-slate-600 mt-1">Keep your brand details fresh and easy for shoppers to recognize.</p>
        </div>
        <ProfileForm
          initialProfile={{
            name: designerProfile.user.name ?? "",
            email: designerProfile.user.email ?? "",
            phone: designerProfile.user.phone ?? "",
            brandName: designerProfile.brandName,
            bio: designerProfile.bio ?? "",
            brandLogo: designerProfile.brandLogo ?? undefined,
            website: designerProfile.website ?? undefined,
            instagram: designerProfile.instagram ?? undefined,
            twitter: designerProfile.twitter ?? undefined,
            tiktok: designerProfile.tiktok ?? undefined
          }}
        />
      </div>
    </section>
  );
}
