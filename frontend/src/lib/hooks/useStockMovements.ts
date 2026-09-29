import { useQuery } from '@tanstack/react-query';
import { stockMovementsApi, StockMovementFilters } from '@/lib/api';

export type { StockMovement, StockMovementType } from '@/lib/api/stockMovements';
export { stockMovementsApi } from '@/lib/api/stockMovements';

/**
 * The Inventory screen's Movement Log feed.
 *
 * One query, filtered the same way the screen is scoped (a product, a branch,
 * neither). Entries are one per location per movement, so a transfer arrives
 * as two rows with matching refs. `branchId` is passed through `toBranchQueryId`
 * by the caller so the "All locations" sentinel never reaches the API.
 */
export function useStockMovements(filters?: StockMovementFilters) {
  return useQuery({
    queryKey: ['stock-movements', filters],
    queryFn: () => stockMovementsApi.getAll(filters),
    staleTime: 30 * 1000,
  });
}

export const MOVEMENTS_KEY = ['stock-movements'] as const;