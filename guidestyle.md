# Style Guide: StokKu 🟢

**Tema Utama:** Minimalist, Glassmorphism, Dark Theme
**Warna Utama (Primary):** Hijau (Emerald/Neon Green)

Panduan ini dirancang agar sangat mudah diimplementasikan menggunakan **Tailwind CSS**. Tidak perlu konfigurasi CSS kustom yang ribet, cukup gunakan kombinasi *utility classes* bawaan.

---

## 1. Palet Warna (Color Palette)

Kita menggunakan warna bawaan Tailwind agar praktis.

*   **Background (Latar Belakang Utama):** 
    *   Gunakan warna gelap pekat agar efek kacanya terlihat jelas.
    *   *Tailwind:* `bg-zinc-950` atau `bg-slate-900`
*   **Primary (Hijau - Warna Aksen & Brand):**
    *   *Tailwind:* `emerald-500` (Hex: `#10b981`)
    *   *Hover State:* `emerald-600` (Hex: `#059669`)
*   **Status Toggles (Indikator Barang):**
    *   🟢 **Aman:** `text-emerald-400` / `bg-emerald-500/20`
    *   🟡 **Menipis:** `text-amber-400` / `bg-amber-500/20`
    *   🔴 **Habis:** `text-rose-400` / `bg-rose-500/20`
*   **Teks:**
    *   *Heading:* `text-zinc-100` (Putih terang)
    *   *Sub-teks:* `text-zinc-400` (Abu-abu redup)

---

## 2. Tipografi (Typography)

Pilih satu font Sans-Serif yang bersih dan modern dari Google Fonts (via `next/font/google`).
*   **Font Utama:** **Inter** atau **Poppins** (Sangat disarankan untuk UI modern).
*   **Hierarki Ukuran:**
    *   Judul Aplikasi/Halaman: `text-2xl font-bold tracking-tight`
    *   Nama Barang (Cards): `text-lg font-semibold`
    *   Label Kategori/Status: `text-sm font-medium`

---

## 3. Resep Glassmorphism (UI Components)

Ini adalah kunci visual StokKu. Jangan gunakan warna solid untuk *Card* inventaris, gunakan kombinasi transparan (*opacity*) dan *backdrop-blur*.

### A. Kartu Barang (Glass Card)
Gunakan kombinasi *class* ini untuk *container* setiap barang:
```html
<div class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl">
  <!-- Konten Barang -->
</div>
```
*   *Penjelasan:* `bg-white/5` memberi warna putih sangat tipis (5%), `backdrop-blur-md` memberikan efek kaca buram di belakangnya, dan `border-white/10` memberi garis pinggir bercahaya tipis khas kaca.

### B. Tombol Utama (Primary Button - Hijau)
Gunakan untuk aksi utama seperti "Simpan", "Tambah Barang", atau "Selesai Belanja".
```html
<button class="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-xl transition-all active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
  Simpan Barang
</button>
```
*   *Catatan:* Tambahan `shadow-[...]` memberikan efek *glowing* (bercahaya) hijau yang sangat cocok dengan tema gelap.

### C. Tombol Status (Toggles Kaca)
Tombol untuk mengganti status stok barang. Contoh untuk status "Aman" (Hijau):
```html
<button class="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg px-3 py-1 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-emerald-500/20">
  Aman
</button>
```
*(Ganti kata `emerald` menjadi `amber` untuk Menipis, dan `rose` untuk Habis).*

---

## 4. Background Kustom (Opsional tapi Keren)

Agar *glassmorphism* tidak membosankan, kita bisa menaruh gradasi samar di latar belakang (`body`). Anda bisa menaruh ini di *wrapper* utama layout:

```html
<div class="min-h-screen bg-zinc-950 relative overflow-hidden text-zinc-100">
  <!-- Efek cahaya hijau samar di pojok -->
  <div class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]"></div>
  <div class="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-500/10 rounded-full blur-[120px]"></div>
  
  <!-- Konten Aplikasi Anda di sini, z-index relatif -->
  <main class="relative z-10 container mx-auto p-4">
    <!-- Cards Glassmorphism ditaruh di sini -->
  </main>
</div>
```
*Ini akan membuat efek kaca di atas kartu merespons warna hijau samar dari latar belakang.*