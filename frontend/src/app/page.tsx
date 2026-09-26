'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!token || !user) {
      router.push('/login');
    } else {
      router.push('/dashboard');
    }
  }, [token, user, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4" style={{ backgroundColor: 'var(--bg)' }}>
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.1" strokeLinecap="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4M6 9h.01M9 9h6" />
        </svg>
      </div>
      <div className="text-[13px] text-muted">Loading your workspace…</div>
    </div>
  );
}
