// frontend/src/app/superadmin/stores/new/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateStore } from "@/lib/hooks";

const THEMES = [
  { id: "dark", label: "Dark", preview: "#0F1829" },
  { id: "light", label: "Light", preview: "#F8F9FA" },
  { id: "gold", label: "Gold", preview: "#2A1F0D" },
] as const;

const COLORS = [
  { label: "Blue", value: "#3B82F6" },
  { label: "Indigo", value: "#6366F1" },
  { label: "Violet", value: "#8B5CF6" },
  { label: "Green", value: "#10B981" },
  { label: "Teal", value: "#14B8A6" },
  { label: "Orange", value: "#F97316" },
  { label: "Red", value: "#EF4444" },
  { label: "Gold", value: "#D4AF37" },
  { label: "Pink", value: "#EC4899" },
];

interface FormState {
  // Store Info
  name: string;
  subdomain: string;
  description: string;
  // Theme
  primaryColor: string;
  accentColor: string;
  theme: "dark" | "light" | "gold";
  // Owner Account
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  adminPasswordConfirm: string;
}

const empty: FormState = {
  name: "",
  subdomain: "",
  description: "",
  primaryColor: "#3B82F6",
  accentColor: "#6366F1",
  theme: "dark",
  adminName: "",
  adminEmail: "",
  adminPassword: "",
  adminPasswordConfirm: "",
};

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full h-9 px-3 bg-[#080C14] border border-white/[0.1] rounded-lg text-[13px] text-slate-100 placeholder:text-slate-600 outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all";
const inputErrCls =
  "w-full h-9 px-3 bg-[#080C14] border border-red-500/50 rounded-lg text-[13px] text-slate-100 placeholder:text-slate-600 outline-none focus:border-red-400/60 transition-all";

export default function CreateStorePage() {
  const router = useRouter();
  const createStore = useCreateStore();
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState<{
    storeName: string;
    email: string;
  } | null>(null);

  const set =
    (key: keyof FormState) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: "" }));
    };

  const autoSubdomain = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const validateStep1 = () => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) errs.name = "Store name is required";
    if (!form.subdomain.trim()) errs.subdomain = "Subdomain is required";
    else if (!/^[a-z0-9-]+$/.test(form.subdomain))
      errs.subdomain = "Only lowercase letters, numbers and hyphens";
    return errs;
  };

  const validateStep2 = () => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.adminName.trim()) errs.adminName = "Owner name is required";
    if (!form.adminEmail.trim()) errs.adminEmail = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.adminEmail))
      errs.adminEmail = "Invalid email address";
    if (!form.adminPassword) errs.adminPassword = "Password is required";
    else if (form.adminPassword.length < 8)
      errs.adminPassword = "Minimum 8 characters";
    if (form.adminPassword !== form.adminPasswordConfirm)
      errs.adminPasswordConfirm = "Passwords do not match";
    return errs;
  };

  const handleNext = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    const errs = validateStep2();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      await createStore.mutateAsync({
        name: form.name,
        subdomain: form.subdomain,
        description: form.description,
        adminName: form.adminName,
        adminEmail: form.adminEmail,
        adminPassword: form.adminPassword,
        settings: {
          primaryColor: form.primaryColor,
          accentColor: form.accentColor,
          theme: form.theme,
        },
      });
      setSuccess({ storeName: form.name, email: form.adminEmail });
    } catch {
      // error handled by axios interceptor
    }
  };

  if (success) {
    return (
      <div className="p-6 min-h-screen bg-[#080C14] flex items-center justify-center">
        <div className="bg-[#0F1829] border border-white/[0.06] rounded-2xl p-10 w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#34d399"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-[20px] font-bold text-white mb-2">
            Store Created!
          </h2>
          <p className="text-[13px] text-slate-400 mb-1">
            <span className="text-white font-semibold">
              {success.storeName}
            </span>{" "}
            is ready.
          </p>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-6">
            <p className="text-[12px] text-blue-300 mb-1">
              Welcome email sent to{" "}
              <span className="text-blue-200 font-medium">{success.email}</span>
            </p>
            <p className="text-[11px] text-slate-500">
              Check your backend terminal for the email preview link
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/superadmin/stores")}
              className="flex-1 h-9 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 rounded-lg text-[13px] font-medium transition-all"
            >
              All Stores
            </button>
            <button
              onClick={() => {
                setForm(empty);
                setStep(1);
                setSuccess(null);
              }}
              className="flex-1 h-9 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[13px] font-semibold transition-all"
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-[#080C14]">
      {/* Header */}
      <div className="flex items-center gap-2 text-[12px] text-slate-500 mb-5">
        <button
          onClick={() => router.push("/superadmin/stores")}
          className="hover:text-slate-300 transition-colors"
        >
          Stores
        </button>
        <span>/</span>
        <span className="text-slate-300">Create Store</span>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="mb-7">
          <h1 className="text-[22px] font-bold text-white tracking-tight">
            Create New Store
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Set up a new tenant store with an owner account
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-7">
          {[
            { n: 1, label: "Store Details" },
            { n: 2, label: "Owner Account" },
          ].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  step === n
                    ? "bg-blue-500 text-white"
                    : step > n
                      ? "bg-emerald-500 text-white"
                      : "bg-white/[0.06] text-slate-500"
                }`}
              >
                {step > n ? "✓" : n}
              </div>
              <span
                className={`text-[12px] font-medium ${step === n ? "text-slate-200" : "text-slate-600"}`}
              >
                {label}
              </span>
              {n < 2 && <span className="text-slate-700 mx-1">—</span>}
            </div>
          ))}
        </div>

        <div className="bg-[#0F1829] border border-white/[0.06] rounded-xl p-6">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-[15px] font-semibold text-white mb-1">
                  Store Information
                </h2>
                <p className="text-[12px] text-slate-500">
                  Basic details about this tenant store
                </p>
              </div>

              <Field label="Store Name" required error={errors.name}>
                <input
                  className={errors.name ? inputErrCls : inputCls}
                  placeholder="e.g. Acme Retail Lagos"
                  value={form.name}
                  onChange={(e) => {
                    setForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                      subdomain: autoSubdomain(e.target.value),
                    }));
                    setErrors((prev) => ({ ...prev, name: "", subdomain: "" }));
                  }}
                />
              </Field>

              <Field label="Subdomain" required error={errors.subdomain}>
                <div className="relative">
                  <input
                    className={errors.subdomain ? inputErrCls : inputCls}
                    placeholder="acme-retail"
                    value={form.subdomain}
                    onChange={set("subdomain")}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-600 font-mono">
                    .yourdomain.com
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 mt-1">
                  Lowercase letters, numbers and hyphens only
                </p>
              </Field>

              <Field label="Description">
                <textarea
                  className="w-full h-20 px-3 py-2 bg-[#080C14] border border-white/[0.1] rounded-lg text-[13px] text-slate-100 placeholder:text-slate-600 outline-none focus:border-blue-500/60 transition-all resize-none"
                  placeholder="Brief description of this store (optional)"
                  value={form.description}
                  onChange={set("description")}
                />
              </Field>

              {/* Theme */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                  UI Theme
                </label>
                <div className="flex gap-2">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, theme: t.id }))
                      }
                      className={`flex-1 h-16 rounded-lg border transition-all flex flex-col items-center justify-center gap-1.5 ${
                        form.theme === t.id
                          ? "border-blue-500/50 bg-blue-500/10"
                          : "border-white/[0.08] bg-[#080C14] hover:border-white/[0.15]"
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded border border-white/20"
                        style={{ backgroundColor: t.preview }}
                      />
                      <span
                        className={`text-[11px] font-semibold ${form.theme === t.id ? "text-blue-400" : "text-slate-500"}`}
                      >
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Color */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                  Brand Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, primaryColor: c.value }))
                      }
                      title={c.label}
                      className={`w-7 h-7 rounded-lg transition-all ${form.primaryColor === c.value ? "ring-2 ring-offset-2 ring-offset-[#0F1829] ring-white/50 scale-110" : "hover:scale-105"}`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                  <div className="flex items-center gap-2 ml-1">
                    <input
                      type="color"
                      value={form.primaryColor}
                      onChange={set("primaryColor")}
                      className="w-7 h-7 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-500 font-mono">
                      {form.primaryColor}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNext}
                  className="h-9 px-6 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-semibold rounded-lg transition-all shadow-[0_2px_12px_rgba(59,130,246,0.35)]"
                >
                  Next: Owner Account →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => setStep(1)}
                  className="text-[12px] text-slate-500 hover:text-slate-300 transition-colors"
                >
                  ← Back
                </button>
                <div>
                  <h2 className="text-[15px] font-semibold text-white">
                    Owner Account
                  </h2>
                  <p className="text-[12px] text-slate-500">
                    Create the admin account for this store
                  </p>
                </div>
              </div>

              {/* Store preview */}
              <div className="flex items-center gap-3 p-3 bg-[#080C14] border border-white/[0.07] rounded-lg">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold text-white"
                  style={{
                    backgroundColor: form.primaryColor + "30",
                    border: `1px solid ${form.primaryColor}40`,
                  }}
                >
                  {form.name.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-slate-200">
                    {form.name || "Store Name"}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {form.subdomain || "subdomain"}
                  </div>
                </div>
                <div className="ml-auto">
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ backgroundColor: form.primaryColor }}
                  />
                </div>
              </div>

              <Field label="Owner Full Name" required error={errors.adminName}>
                <input
                  className={errors.adminName ? inputErrCls : inputCls}
                  placeholder="John Doe"
                  value={form.adminName}
                  onChange={set("adminName")}
                />
              </Field>

              <Field label="Owner Email" required error={errors.adminEmail}>
                <input
                  type="email"
                  className={errors.adminEmail ? inputErrCls : inputCls}
                  placeholder="john@acmeretail.com"
                  value={form.adminEmail}
                  onChange={set("adminEmail")}
                />
              </Field>

              <Field
                label="Initial Password"
                required
                error={errors.adminPassword}
              >
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`${errors.adminPassword ? inputErrCls : inputCls} pr-10`}
                    placeholder="Minimum 8 characters"
                    value={form.adminPassword}
                    onChange={set("adminPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </Field>

              <Field
                label="Confirm Password"
                required
                error={errors.adminPasswordConfirm}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  className={
                    errors.adminPasswordConfirm ? inputErrCls : inputCls
                  }
                  placeholder="Re-enter password"
                  value={form.adminPasswordConfirm}
                  onChange={set("adminPasswordConfirm")}
                />
              </Field>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-[11px] text-blue-300">
                  <strong>Note:</strong> Share these credentials with the store
                  owner. They can change their password after first login.
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="h-9 px-4 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 rounded-lg text-[13px] font-medium transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createStore.isPending}
                  className="flex-1 h-9 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-[13px] font-semibold rounded-lg transition-all shadow-[0_2px_12px_rgba(59,130,246,0.35)] flex items-center justify-center gap-2"
                >
                  {createStore.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{" "}
                      Creating Store...
                    </>
                  ) : (
                    "Create Store & Owner Account"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
