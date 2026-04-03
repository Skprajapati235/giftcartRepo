"use client";

import React from "react";

interface CardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export default function Card({ title, value, subtitle }: CardProps) {
  return (
    <div className="rounded-[2rem] bg-card p-6 shadow-md transition-transform hover:scale-[1.02] border border-transparent dark:border-border-theme">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className="mt-4 text-3xl font-extrabold text-foreground">{value}</p>
      {subtitle ? <p className="mt-1 text-xs text-slate-500 font-medium">{subtitle}</p> : null}
    </div>
  );
}
