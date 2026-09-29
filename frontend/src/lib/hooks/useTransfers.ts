import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { transfersApi, CreateTransferData } from '@/lib/api';
import { toBranchQueryId } from '@/lib/utils/branchQuery';
import { MOVEMENTS_KEY } from './useStockMovements';

export type { StockTransfer, CreateTransferData } from '@/lib/api/transfers';
export {
  getTransferFromName, getTransferToName, getTransferStaffName, getTransferCounterparty,
} from '@/lib/api/transfers';

const TRANSFERS = ['transfers'] as const;

export function useTransfers(filters?: { branchId?: string; startDate?: string; endDate?: string }) {
  /**
   * A UI sentinel like "all" must not reach the API — the backend would try to
   * cast it to an ObjectId and reject the request. Sanitised before it reaches
   * the query, and the same object feeds the cache key so the two cannot drift.
   * No memo needed: TanStack hashes the key, so a fresh object is harmless.
   */
  const params = { ...filters, branchId: toBranchQueryId(filters?.branchId) };

  return useQuery({
    queryKey: ['transfers', params],
    queryFn: () => transfersApi.getAll(params),
    staleTime: 30 * 1000,
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransferData) => transfersApi.create(data),
    onSuccess: (transfer) => {
      const from = (transfer.fromBranchId as { name?: string })?.name;
      const to = (transfer.toBranchId as { name?: string })?.name;
      toast.success(`Moved stock from ${from} to ${to}`);
    },
    // No optimistic insert: a transfer is all-or-nothing server-side, and
    // showing a row that a validation error will later retract reads as a
    // phantom movement.
    onSettled: () => {
      // Stock moved between locations, so every product's per-location figures,
      // the company-wide totals, and the movement log are all stale now.
      queryClient.invalidateQueries({ queryKey: TRANSFERS });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: MOVEMENTS_KEY });
    },
  });
}
