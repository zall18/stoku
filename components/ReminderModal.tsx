"use client";

import { useState, useTransition } from "react";
import { ReminderFrequency, ReminderSetting } from "@/lib/types";
import { updateReminderSetting } from "@/app/actions/reminder";
import Modal from "@/components/ui/Modal";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { Bell, Clock, Calendar, Check, Volume2 } from "lucide-react";

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  setting: ReminderSetting;
}

export default function ReminderModal({
  isOpen,
  onClose,
  setting,
}: ReminderModalProps) {
  const [enabled, setEnabled] = useState(setting.enabled);
  const [frequency, setFrequency] = useState<ReminderFrequency>(
    setting.frequency
  );
  const [reminderTime, setReminderTime] = useState(setting.reminderTime);
  const [testSent, setTestSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      await updateReminderSetting({
        enabled,
        frequency,
        reminderTime,
      });
      onClose();
    });
  };

  const handleTestNotification = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      alert("Browser kamu tidak mendukung Web Notification API.");
      return;
    }

    let permission = Notification.permission;
    if (permission !== "granted") {
      permission = await Notification.requestPermission();
    }

    if (permission === "granted") {
      new Notification("🛒 StokKu: Waktunya Cek Stok!", {
        body: "Pengingat aktif! Saatnya cek stok barang yang diprediksi menipis sebelum istirahat.",
        icon: "/favicon.ico",
      });
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } else {
      alert("Izin notifikasi ditolak di browser. Aktifkan di pengaturan browser.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🔔 Pengingat Cek Stok">
      <div className="space-y-4">
        {/* Toggle Enabled */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Aktifkan Pengingat
              </span>
              <span className="text-[11px] text-slate-500">
                Diingatkan saat santai tanpa harus terus mengecek
              </span>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {enabled && (
          <>
            {/* Frequency Options */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Pilih Waktu Pengingat
              </label>

              <button
                type="button"
                onClick={() => {
                  setFrequency("DAILY_EVENING");
                  setReminderTime("20:00");
                }}
                className={`
                  w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer
                  ${
                    frequency === "DAILY_EVENING"
                      ? "bg-emerald-50/90 border-emerald-400 text-emerald-900 shadow-xs"
                      : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold block">
                      🌙 Akhir Hari (Setiap Malam 20:00)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Rekomendasi terbaik: cek kilat sebelum tidur malam
                    </span>
                  </div>
                </div>
                {frequency === "DAILY_EVENING" && (
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFrequency("WEEKEND_MORNING");
                  setReminderTime("09:00");
                }}
                className={`
                  w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer
                  ${
                    frequency === "WEEKEND_MORNING"
                      ? "bg-emerald-50/90 border-emerald-400 text-emerald-900 shadow-xs"
                      : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold block">
                      ☀️ Akhir Pekan (Sabtu & Minggu 09:00)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Sebelum belanja mingguan di akhir pekan
                    </span>
                  </div>
                </div>
                {frequency === "WEEKEND_MORNING" && (
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setFrequency("CUSTOM")}
                className={`
                  w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer
                  ${
                    frequency === "CUSTOM"
                      ? "bg-emerald-50/90 border-emerald-400 text-emerald-900 shadow-xs"
                      : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold block">
                      ⚙️ Jam Kustom
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Tentukan sendiri jam pengingat harianmu
                    </span>
                  </div>
                </div>
                {frequency === "CUSTOM" && (
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                )}
              </button>

              {frequency === "CUSTOM" && (
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">
                    Jam Pengingat:
                  </span>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                  />
                </div>
              )}
            </div>

            {/* Test Notification button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleTestNotification}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                {testSent ? "✅ Notifikasi Terkirim!" : "Uji Coba Notifikasi Browser"}
              </button>
            </div>
          </>
        )}

        {/* Save button */}
        <div className="pt-2">
          <PrimaryButton
            onClick={handleSave}
            loading={isPending}
            fullWidth
            size="md"
          >
            Simpan Pengaturan
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}
