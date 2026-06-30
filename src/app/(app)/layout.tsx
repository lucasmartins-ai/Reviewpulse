import { AppShell } from "@/components/app/app-shell";
import { getAppContext } from "@/features/demo/context";

export default async function DemoLayout({ children }: { children: React.ReactNode }) {
  const context = getAppContext();

  return (
    <AppShell organization={context.organization} isDemo={context.isDemo}>
      {children}
    </AppShell>
  );
}
