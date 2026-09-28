"use client";

import { useState } from "react";
import { Search, X, Camera } from "lucide-react";
import BarcodeScannerModal from "@/components/BarcodeScannerModal";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onScanBarcode?: (code: string) => void;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Cari barang kebutuhan...",
  onScanBarcode,
}: SearchBarProps) {
  const [showScanner, setShowScanner] = useState(false);

  return (
    <>
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="
            w-full pl-10 pr-16 py-2.5 text-sm
            glass-pill rounded-xl
            text-slate-800 placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-emerald-500/25
            focus:border-emerald-500/60
            transition-all duration-200
          "
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              onClick={() => onChange("")}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              title="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {onScanBarcode && (
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              title="Scan barcode untuk mencari"
            >
              <Camera className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {onScanBarcode && (
        <BarcodeScannerModal
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          onScan={(code) => {
            onScanBarcode(code);
            onChange(code);
          }}
        />
      )}
    </>
  );
}
