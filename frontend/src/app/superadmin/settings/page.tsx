// frontend/src/app/superadmin/settings/page.tsx
"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";

export default function SuperadminSettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    "account" | "platform" | "security"
  >("account");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputCls =
    "w-full h-9 px-3 bg-[#080C14] border border-white/[0.1] rounded-lg text-[13px] text-slate-100 placeholder:text-slate-600 outline-none focus:border-blue-500/60 transition-all";
  const labelCls =
    "block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5";

  const tabs = [
    { id: "account", label: "Account" },
    { id: "platform", label: "Platform" },
    { id: "security", label: "Security" },
  ] as const;

  return (
    <div className="p-6 min-h-screen bg-[#080C14]">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-white tracking-tight">
          Settings
        </h1>
        <p className="text-[13px] text-slate-500 mt-0.5">
          Manage your superadmin account and platform configuration
        </p>
      </div>

      <div className="flex gap-0.5 bg-[#0F1829] border border-white/[0.06] rounded-xl p-1 w-fit mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`h-8 px-4 rounded-lg text-[12px] font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-blue-500 text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-xl">
        {activeTab === "account" && (
          <div className="bg-[#0F1829] border border-white/[0.06] rounded-xl p-6 space-y-5">
            <div>
              <h2 className="text-[14px] font-semibold text-white">
                Account Information
              </h2>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Update your superadmin profile
              </p>
            </div>
            <div className="flex items-center gap-4 p-4 bg-[#080C14] border border-white/[0.07] rounded-xl">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[16px] font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "S"}
              </div>
              <div>
                <div className="text-[14px] font-semibold text-white">
                  {user?.name}
                </div>
                <div className="text-[12px] text-slate-400">{user?.email}</div>
                <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">
                  Superadmin
                </div>
              </div>
            </div>
            <div>
              <label className={labelCls}>Display Name</label>
              <input className={inputCls} defaultValue={user?.name} />
            </div>
            <div>
              <label className={labelCls}>Email Address</label>
              <input
                type="email"
                className={inputCls}
                defaultValue={user?.email}
              />
            </div>
            <div className="pt-2">
              <button
                onClick={handleSave}
                className={`h-9 px-5 rounded-lg text-[13px] font-semibold transition-all ${
                  saved
                    ? "bg-emerald-500 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white shadow-[0_2px_12px_rgba(59,130,246,0.3)]"
                }`}
              >
                {saved ? "✓ Saved" : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "platform" && (
          <div className="bg-[#0F1829] border border-white/[0.06] rounded-xl p-6 space-y-5">
            <div>
              <h2 className="text-[14px] font-semibold text-white">
                Platform Configuration
              </h2>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Global settings for the SaaS platform
              </p>
            </div>
            <div>
              <label className={labelCls}>Platform Name</label>
              <input className={inputCls} defaultValue="RetailCore POS" />
            </div>
            <div>
              <label className={labelCls}>Default Currency</label>
              <select className={inputCls + " appearance-none"}>
                <option>NGN (₦)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Max Staff Per Store</label>
              <input type="number" className={inputCls} defaultValue={50} />
            </div>
            <div>
              <label className={labelCls}>Max Products Per Store</label>
              <input type="number" className={inputCls} defaultValue={1000} />
            </div>
            <div className="flex items-center justify-between py-3 border-t border-white/[0.05]">
              <div>
                <div className="text-[13px] text-slate-200 font-medium">
                  Allow Self-Registration
                </div>
                <div className="text-[11px] text-slate-500">
                  Let store owners sign up on their own
                </div>
              </div>
              <div className="w-10 h-6 bg-slate-700 rounded-full relative cursor-not-allowed opacity-50">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-all" />
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-white/[0.05]">
              <div>
                <div className="text-[13px] text-slate-200 font-medium">
                  Maintenance Mode
                </div>
                <div className="text-[11px] text-slate-500">
                  Disable all store access temporarily
                </div>
              </div>
              <div className="w-10 h-6 bg-slate-700 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-all" />
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={handleSave}
                className="h-9 px-5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[13px] font-semibold transition-all shadow-[0_2px_12px_rgba(59,130,246,0.3)]"
              >
                Save Platform Settings
              </button>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="bg-[#0F1829] border border-white/[0.06] rounded-xl p-6 space-y-5">
            <div>
              <h2 className="text-[14px] font-semibold text-white">Security</h2>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Manage your superadmin password and security settings
              </p>
            </div>
            <div>
              <label className={labelCls}>Current Password</label>
              <input
                type="password"
                className={inputCls}
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className={labelCls}>New Password</label>
              <input
                type="password"
                className={inputCls}
                placeholder="Minimum 8 characters"
              />
            </div>
            <div>
              <label className={labelCls}>Confirm New Password</label>
              <input
                type="password"
                className={inputCls}
                placeholder="Re-enter new password"
              />
            </div>
            <div className="pt-2">
              <button className="h-9 px-5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[13px] font-semibold transition-all shadow-[0_2px_12px_rgba(59,130,246,0.3)]">
                Update Password
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
