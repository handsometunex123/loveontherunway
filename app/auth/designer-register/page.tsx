import DesignerRegisterForm from "./DesignerRegisterForm";
import Link from "next/link";
import crypto from "crypto";
import { db } from "@/lib/db";
import BackButton from "../../BackButton";

export default async function DesignerRegisterPage({
  searchParams
}: {
  searchParams?: { token?: string };
}) {
  const rawToken = searchParams?.token?.toString().trim();
  const tokenHash = rawToken
    ? crypto.createHash("sha256").update(rawToken).digest("hex")
    : null;

  const invite = tokenHash
    ? await db.designerInvite.findFirst({
        where: {
          tokenHash,
          usedAt: null,
          expiresAt: { gt: new Date() }
        }
      })
    : null;

  return (
    <section className="flex items-center justify-center min-h-screen px-4 py-8 md:py-10">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton fallbackUrl="/login" />
        </div>
        
        <div className="rounded-2xl md:rounded-3xl bg-white p-6 md:p-8 shadow-2xl">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              Designer Registration
            </h1>
            <p className="text-xs md:text-sm text-slate-600">
              Join our platform and start showcasing your designs
            </p>
          </div>

          {invite ? (
            <DesignerRegisterForm inviteEmail={invite.email} inviteToken={rawToken!} />
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">Invite required</p>
              <p className="text-xs text-amber-800 mt-1">
                This registration link is invalid or expired. Please contact the administrator for a new invite.
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2">
            <span className="text-xs md:text-sm text-slate-600">Already have an account?</span>
            <Link
              href="/login"
              className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
