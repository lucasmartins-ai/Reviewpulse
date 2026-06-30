import "server-only";

import { getDemoOrganization } from "@/features/demo/store";
import type { PublicOrganization } from "@/types/domain";

export type AppContext = {
  isDemo: true;
  userId: null;
  organization: PublicOrganization;
};

export function getAppContext(): AppContext {
  return {
    isDemo: true,
    userId: null,
    organization: getDemoOrganization()
  };
}
