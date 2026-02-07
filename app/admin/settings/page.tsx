import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import SettingsForm from "./SettingsForm";
import BackButton from "@/app/BackButton";

export default async function AdminSettingsPage() {
  await requireRole(["SUPER_ADMIN"]);

  const settings = await db.platformSetting.findFirst();

  return (
    <section>
      <div className="mb-4 md:mb-6">
        <BackButton fallbackUrl="/admin/dashboard" />
      </div>
      <h2 className="text-2xl font-bold mb-6">Platform Settings</h2>
      <div className="max-w-md rounded-2xl bg-white p-8 shadow-md">
        <SettingsForm initialSettings={settings} />
      </div>
    </section>
  );
}
