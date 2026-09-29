export const ALL_LOCATIONS_SENTINEL = 'all';

/** Removes the "All locations" UI sentinel from an id before passing to the API. */
export function toBranchQueryId(branchId?: string | null): string | undefined {
  if (!branchId) return undefined;
  return branchId === ALL_LOCATIONS_SENTINEL ? undefined : branchId;
}
