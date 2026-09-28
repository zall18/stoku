"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera, RefreshCw, AlertCircle } from "lucide-react";
import Modal from "@/components/ui/Modal";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onScan,
}: BarcodeScannerModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = "barcode-scanner-viewport";

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
        scannerRef.current = null;
        setIsScanning(false);
      }
      setError(null);
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      try {
        setError(null);
        const scanner = new Html5Qrcode(readerElementId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 160 },
          },
          (decodedText) => {
            if (!isMounted) return;
            if (typeof window !== "undefined" && navigator.vibrate) {
              navigator.vibrate([30, 40, 30]);
            }
            onScan(decodedText);
            onClose();
          },
          () => {
            // Ignore scan failures (normal while searching for code)
          }
        );

        if (isMounted) setIsScanning(true);
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("NotAllowedError") || msg.includes("Permission")) {
          setError("Izin akses kamera ditolak. Harap izinkan kamera di browser.");
        } else {
          setError("Kamera tidak dapat diakses atau sedang digunakan aplikasi lain.");
        }
      }
    };

    const timer = setTimeout(() => {
      startScanner();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [isOpen, onClose, onScan]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📷 Scan Barcode Barang">
      <div className="flex flex-col items-center">
        {error ? (
          <div className="w-full p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <p>{error}</p>
          </div>
        ) : (
          <div className="w-full relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 aspect-[4/3] flex items-center justify-center">
            {/* Viewport container for html5-qrcode */}
            <div id={readerElementId} className="w-full h-full" />

            {!isScanning && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900/80 gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                <span className="text-xs font-medium text-slate-300">
                  Menyiapkan kamera...
                </span>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-slate-500 text-center mt-4">
          Arahkan kamera ke barcode kemasan barang (misal sabun, pasta gigi, mie instan).
        </p>
      </div>
    </Modal>
  );
}
