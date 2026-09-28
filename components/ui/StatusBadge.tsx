"use client";

import { StockStatus } from "@/lib/types";
import { STATUS_CONFIG } from "@/lib/utils";

interface StatusBadgeProps {
  status: StockStatus;
  size?: "sm" | "md";
  onClick?: () => void;
  showDot?: boolean;
}

export default function StatusBadge({
  status,
  size = "sm",
  onClick,
  showDot = true,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3.5 py-1.5 text-sm",
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      disabled={!onClick}
      className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold
        backdrop-blur-md transition-all duration-200
        border shadow-xs ${config.bgColor} ${config.borderColor} ${config.textColor}
        ${onClick ? `${config.hoverBg} cursor-pointer active:scale-95 hover:shadow-md` : ""}
        ${sizeClasses[size]}
      `}
    >
      {showDot && (
        <span
          className={`w-2 h-2 rounded-full ${config.dotColor} shadow-xs ${
            status === StockStatus.HABIS ? "animate-status-pulse ring-2 ring-rose-400/40" : ""
          }`}
        />
      )}
      {config.label}
    </button>
  );
}
