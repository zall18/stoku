"use client";

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "ghost" | "danger" | "google";
  size?: "sm" | "md" | "lg";
  className?: string;
  fullWidth?: boolean;
}

export default function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  loading = false,
  variant = "primary",
  size = "md",
  className = "",
  fullWidth = false,
}: PrimaryButtonProps) {
  const variants = {
    primary:
      "btn-emerald-glow text-white font-semibold shadow-md",
    ghost:
      "bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 shadow-xs hover:shadow-md backdrop-blur-md",
    danger:
      "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 shadow-xs font-semibold",
    google:
      "btn-google text-slate-800 font-semibold",
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs rounded-xl",
    md: "px-4.5 py-2.5 text-sm rounded-xl",
    lg: "px-6 py-3.5 text-base rounded-2xl",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 cursor-pointer
        transition-all duration-200 select-none
        active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
      {children}
    </button>
  );
}
