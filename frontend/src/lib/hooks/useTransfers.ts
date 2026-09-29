import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { transfersApi, CreateTransferData } from '@/lib/api';

export type { StockTransfer, CreateTransferData } from '@/lib/api/transfers';
export {
  getTransferFromName, getTransferToName, getTransferStaffName, getTransferCounterparty,
} from '@/lib/api/transfers';

const TRANSFERS = ['transfers'] as const;

export function useTransfers(filters?: { branchId?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['transfers', filters],
    queryFn: () => transfersApi.getAll(filters),
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
      // Stock moved between locations, so every product's per-location figures
      // and the company-wide totals are all stale now.
      queryClient.invalidateQueries({ queryKey: TRANSFERS });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
