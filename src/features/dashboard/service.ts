import "server-only";

import { getDemoDashboardData } from "@/features/demo/store";
import type { DashboardData } from "@/types/domain";

export async function getDashboardData(): Promise<DashboardData> {
  return getDemoDashboardData();
}
