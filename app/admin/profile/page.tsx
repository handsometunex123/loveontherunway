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
    <section>
      <div className="mb-4 md:mb-6">
        <BackButton fallbackUrl="/admin/dashboard" />
      </div>
      <h2 className="text-2xl font-bold mb-6">My Profile</h2>
      <div className="max-w-xl rounded-2xl bg-white p-6 md:p-8 border border-slate-200">
        <ProfileForm
          initialProfile={{
            name: designerProfile.user.name ?? "",
            email: designerProfile.user.email ?? "",
            phone: designerProfile.user.phone ?? "",
            brandName: designerProfile.brandName,
            bio: designerProfile.bio ?? ""
          }}
        />
      </div>
    </section>
  );
}
