interface CardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export default function Card({ title, value, subtitle }: CardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
      {subtitle ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p> : null}
    </div>
  );
}
