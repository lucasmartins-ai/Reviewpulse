import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
};

export function MetricCard({ label, value, detail, icon: Icon }: MetricCardProps) {
  return (
    <article className="metric-card">
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
      <span className="metric-icon" aria-hidden="true">
        <Icon size={22} />
      </span>
      <span className="metric-detail">{detail}</span>
    </article>
  );
}
