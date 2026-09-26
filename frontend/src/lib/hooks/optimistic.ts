import type { QueryClient } from '@tanstack/react-query';

/**
 * List queries are keyed as `['products', filters]`, so the filters live in a
 * second key segment. The mutations used to snapshot and patch a bare
 * `['products']` key, which no query ever registered under — so optimistic
 * inserts never appeared and rollbacks were no-ops.
 *
 * These helpers address every query whose key *starts with* the prefix, which
 * keeps per-filter caching intact while making optimistic updates visible.
 */
export async function snapshotLists<T>(
  queryClient: QueryClient,
  prefix: readonly unknown[],
): Promise<[readonly unknown[], T[] | undefined][]> {
  await queryClient.cancelQueries({ queryKey: prefix });
  return queryClient.getQueriesData<T[]>({ queryKey: prefix });
}

export function patchLists<T>(
  queryClient: QueryClient,
  prefix: readonly unknown[],
  updater: (current: T[]) => T[],
) {
  queryClient.setQueriesData<T[]>({ queryKey: prefix }, (current) => updater(current ?? []));
}

export function restoreLists<T>(
  queryClient: QueryClient,
  snapshot: [readonly unknown[], T[] | undefined][],
) {
  for (const [key, data] of snapshot) {
    queryClient.setQueryData(key, data);
  }
}
