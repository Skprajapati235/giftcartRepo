"use client";

import React from "react";
import { DecorationLayout } from "@/decoration";

export default function DecorationPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DecorationLayout>{children}</DecorationLayout>;
}
