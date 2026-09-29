"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/lib/hooks";
import { useAuthStore } from "@/store/authStore";
import { IconMail, IconLock, IconEye, IconCheck } from "@/components/ui/Icons";

const highlights = [
  "Lightning-fast checkout with barcode scanning",
  "Real-time inventory across every branch",
  "Sales analytics that update as you sell",
];

// Dev-only login hint. The password is deliberately absent: it lives only in
// backend/.env. NEXT_PUBLIC_* values are inlined into the client bundle at
// build time whether or not this renders, so a password here would ship to
// every visitor.
const demoAdminEmail = process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL;
const showDemoHint = process.env.NODE_ENV !== "production" && Boolean(demoAdminEmail);

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const { user } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!email || !password) {
      setFormError("Please fill in all fields");
      return;
    }
    try {
      await loginMutation.mutateAsync({ email, password });
    } catch {
      // Error is handled by Axios interceptor
    }
  };

  const isAuthenticated = loginMutation.isSuccess && Boolean(user);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div
        className="relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between"
        style={{
          background:
            "linear-gradient(150deg, color-mix(in srgb, var(--primary) 85%, #000), color-mix(in srgb, var(--accent) 55%, #050814))",
        }}
      >
        <div
          className="animate-float-slow pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, #fff6, transparent 65%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #fff4, transparent 65%)" }}
        />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.1" strokeLinecap="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4M6 9h.01M9 9h6" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">RetailCore POS</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-4xl font-bold leading-tight tracking-tight text-white">
            Run every register, branch and receipt from one place.
          </h2>
          <ul className="mt-8 space-y-3.5">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-[14px] text-white/85">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/18">
                  <IconCheck size={13} className="text-white" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-6 text-white/70">
          <div>
            <div className="text-2xl font-bold text-white">12k+</div>
            <div className="text-[11px] uppercase tracking-widest">Daily orders</div>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div>
            <div className="text-2xl font-bold text-white">99.9%</div>
            <div className="text-[11px] uppercase tracking-widest">Uptime</div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-12" style={{ backgroundColor: "var(--bg)" }}>
        <div className="animate-fade-up w-full max-w-[400px]">
          <div className="mb-8 lg:hidden">
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.1" strokeLinecap="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4M6 9h.01M9 9h6" />
              </svg>
            </div>
          </div>

          <h1 className="text-[26px] font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-[13.5px] text-muted">Sign in to continue to your dashboard.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {formError && (
              <div
                className="animate-fade-in rounded-xl border px-4 py-3 text-[13px]"
                style={{
                  backgroundColor: "var(--danger-soft)",
                  borderColor: "color-mix(in srgb, var(--danger) 30%, transparent)",
                  color: "var(--danger)",
                }}
              >
                {formError}
              </div>
            )}

            <div>
              <label htmlFor="email" className="label">Email address</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle">
                  <IconMail size={15} />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input h-11 pl-10"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="label">Password</label>
                <button type="button" className="mb-1.5 text-[11.5px] font-semibold" style={{ color: "var(--primary)" }}>
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle">
                  <IconLock size={15} />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input h-11 pl-10 pr-10"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle transition-colors hover:text-[var(--text)]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <IconEye size={15} />
                </button>
              </div>
            </div>

            <button type="submit" disabled={loginMutation.isPending} className="btn btn-primary btn-lg mt-2 w-full">
              {loginMutation.isPending ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {showDemoHint && (
            <div
              className="mt-6 rounded-xl border px-4 py-3 text-[12.5px]"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border)" }}
            >
              <span className="eyebrow">Demo credentials</span>
              <div className="mt-1.5 font-mono text-[12px] text-muted">{demoAdminEmail}</div>
              <div className="mt-1 text-[12px] text-subtle">
                Password is in <span className="font-mono">backend/.env</span> as{" "}
                <span className="font-mono">ADMIN_PASSWORD</span>.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
