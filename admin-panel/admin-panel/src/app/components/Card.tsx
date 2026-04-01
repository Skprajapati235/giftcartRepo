interface CardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export default function Card({ title, value, subtitle }: CardProps) {
  return (
    <div className="rounded-3xl border border-border-theme bg-card p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</p>
      <p className="mt-4 text-3xl font-extrabold text-foreground">{value}</p>
      {subtitle ? <p className="mt-2 text-sm text-slate-500 font-medium">{subtitle}</p> : null}
    </div>
  );
}
