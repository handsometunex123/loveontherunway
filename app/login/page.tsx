import LoginForm from "./LoginForm";
import BackButton from "../BackButton";

export default function LoginPage() {
  return (
    <section className="flex justify-center px-4 py-8 md:py-10 min-h-screen">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton fallbackUrl="/" />
        </div>
        
        <div className="rounded-2xl md:rounded-3xl bg-white/80 backdrop-blur-xl p-6 md:p-8 shadow-2xl border border-slate-200/50">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white mb-4 shadow-lg">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-xs md:text-sm text-slate-600">Sign in to your account to continue</p>
          </div>

          <LoginForm />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">New to the platform?</span>
            </div>
          </div>

          {/* Registration Section */}
          <div className="space-y-3">
            <p className="text-center text-xs md:text-sm text-slate-600 font-medium">
              Designer registration is invite-only.
            </p>
            <p className="text-center text-xs text-slate-500">
              If you received an invite email, use the registration link provided.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6 px-4">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </section>
  );
}
