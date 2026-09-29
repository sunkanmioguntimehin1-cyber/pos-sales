'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ActiveBranchState {
  /**
   * The location the POS is selling from. `null` means "not resolved yet" —
   * the branch list has not loaded, or the persisted choice points at a branch
   * that has since been deleted. Callers resolve it to head office rather
   * than guessing.
   */
  activeBranchId: string | null;
  setActiveBranchId: (branchId: string | null) => void;
  clearActiveBranchId: () => void;
}

/**
 * Persisted so a cashier does not have to pick their location again after
 * every refresh, and so the choice survives switching tabs mid-sale.
 */
export const useActiveBranchStore = create<ActiveBranchState>()(
  persist(
    (set) => ({
      activeBranchId: null,
      setActiveBranchId: (activeBranchId) => set({ activeBranchId }),
      clearActiveBranchId: () => set({ activeBranchId: null }),
    }),
    {
      name: 'active-branch-storage',
    }
  )
);
