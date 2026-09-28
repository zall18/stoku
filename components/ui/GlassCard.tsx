"use client";

import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  onClick,
  hoverable = false,
}: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        glass rounded-2xl p-4
        transition-all duration-300 ease-out
        ${hoverable ? "hover:bg-white/90 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer active:scale-[0.98]" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
