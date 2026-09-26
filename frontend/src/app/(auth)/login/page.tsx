// 'use client';
// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useLogin } from '@/lib/hooks';
// import { useAuthStore } from '@/store/authStore';

// export default function LoginPage() {
//   const router = useRouter();
//   const loginMutation = useLogin();
//   const { user } = useAuthStore();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [formError, setFormError] = useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setFormError('');

//     if (!email || !password) {
//       setFormError('Please fill in all fields');
//       return;
//     }

//     try {
//       await loginMutation.mutateAsync({ email, password });
//     } catch {
//       // Error is handled by Axios interceptor
//     }
//   };

//   if (loginMutation.isSuccess && user) {
//     router.push('/dashboard');
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
//       <div className="w-full max-w-md p-8">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-extrabold text-white mb-2">RetailCore POS</h1>
//           <p className="text-slate-400">Sign in to your account</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           {formError && (
//             <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
//               {formError}
//             </div>
//           )}

//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
//               Email Address
//             </label>
//             <input
//               id="email"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full h-11 px-4 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
//               placeholder="you@example.com"
//               autoComplete="email"
//             />
//           </div>

//           <div>
//             <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
//               Password
//             </label>
//             <input
//               id="password"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full h-11 px-4 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
//               placeholder="Enter your password"
//               autoComplete="current-password"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loginMutation.isPending}
//             className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center"
//           >
//             {loginMutation.isPending ? (
//               <span className="flex items-center gap-2">
//                 <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
//                 </svg>
//                 Signing in...
//               </span>
//             ) : (
//               'Sign In'
//             )}
//           </button>
//         </form>

//         <div className="mt-6 text-center">
//           <p className="text-slate-500 text-sm">
//             Demo credentials: <span className="text-slate-400">admin@example.com</span> / <span className="text-slate-400">password</span>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/lib/hooks";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const { user } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  if (loginMutation.isSuccess && user) {
    router.push("/dashboard");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="w-full max-w-md p-8">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <div
            className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-[0_4px_16px_rgba(59,130,246,0.35)]"
            style={{
              background:
                "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4M6 9h.01M9 9h6" />
            </svg>
          </div>
          <h1
            className="text-2xl font-extrabold mb-1.5"
            style={{ color: "var(--color-text)" }}
          >
            RetailCore POS
          </h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 border"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div
                className="px-4 py-3 rounded-lg text-sm border"
                style={{
                  backgroundColor: "rgba(239,68,68,0.08)",
                  borderColor: "rgba(239,68,68,0.25)",
                  color: "var(--color-danger)",
                }}
              >
                {formError}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
                style={{ color: "var(--color-text-subtle)" }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-4 rounded-lg text-sm outline-none transition-all focus:ring-2"
                style={{
                  backgroundColor: "var(--color-input-bg)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
                style={{ color: "var(--color-text-subtle)" }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-4 rounded-lg text-sm outline-none transition-all focus:ring-2"
                style={{
                  backgroundColor: "var(--color-input-bg)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-11 text-white font-semibold rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center mt-2"
              style={{
                backgroundColor: loginMutation.isPending
                  ? "var(--color-primary)80"
                  : "var(--color-primary)",
              }}
            >
              {loginMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Demo credentials */}
        <p
          className="mt-5 text-center text-xs"
          style={{ color: "var(--color-text-subtle)" }}
        >
          Demo credentials:{" "}
          <span style={{ color: "var(--color-text-muted)" }}>
            admin@example.com
          </span>
          {" / "}
          <span style={{ color: "var(--color-text-muted)" }}>password</span>
        </p>
      </div>
    </div>
  );
}