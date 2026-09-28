# Product Requirements Document (PRD)
**Nama Produk:** StokKu (Manajer Inventaris Kos & Rumah Minimalis)
**Versi:** 1.0 (MVP)
**Platform:** Web Application (Responsive, Mobile-First)
**Tech Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS, PostgreSQL (Prisma ORM)

---

## 1. Deskripsi Aplikasi
**StokKu** adalah aplikasi manajemen inventaris berbasis web yang dirancang khusus untuk memantau pergerakan stok barang kebutuhan sehari-hari skala mikro (kamar kos, asrama, atau apartemen studio). Aplikasi ini berfokus pada **kecepatan pembaruan data** menggunakan indikator status visual, alih-alih mengharuskan pengguna memasukkan angka kuantitas yang merepotkan.

## 2. Latar Belakang & Masalah
Manajemen barang kebutuhan sehari-hari sering kali diabaikan hingga terjadi krisis (contoh: sabun habis saat sedang mandi, atau air galon kosong di tengah malam saat harus begadang mengerjakan tugas). 
* **Masalah 1:** Mencatat di aplikasi *Notes* biasa sangat tidak terstruktur dan mudah terlupa.
* **Masalah 2:** Aplikasi inventaris gudang yang ada di pasaran terlalu kompleks untuk penggunaan personal.
* **Masalah 3:** Saat tiba di minimarket, pengguna sering kali lupa barang apa saja yang statusnya sudah kritis di rumah.

## 3. Tujuan (Objectives)
1. **Efisiensi Waktu:** Memberikan antarmuka di mana pembaruan status barang dapat dilakukan di bawah 3 detik.
2. **Otomatisasi Keseharian:** Mengubah tugas mengingat barang habis menjadi sistem otomatis yang men-generate daftar belanja.
3. **Ketenangan Pikiran (Peace of Mind):** Memastikan pengguna tidak pernah lagi mengalami krisis kehabisan barang esensial di momen penting.

## 4. Hasil Akhir yang Diharapkan (Expected Outcomes)
* **Zero Stock-out Emergencies:** Pengguna mengetahui barang yang harus dibeli sebelum barang tersebut benar-benar habis.
* **Seamless Grocery Shopping:** Pengguna menghabiskan waktu lebih sedikit di minimarket karena daftar belanja sudah tersusun otomatis dan akurat.
* **Frictionless Adoption:** Karena tidak perlu mengetik angka (hanya tap status), retensi pengguna untuk terus memakai aplikasi ini setiap hari akan tinggi.

## 5. Target Pengguna (User Personas)
* **Mahasiswa/Penghuni Kos:** Ruang penyimpanan terbatas, budget ketat, dan sering sibuk dengan tugas akademik.
* **Pekerja Lepas (Freelancer) / Remote Worker:** Menghabiskan banyak waktu di kamar/rumah dan sangat bergantung pada ketersediaan logistik harian (kopi, camilan, air, listrik).

---

## 6. Kebutuhan Fungsional (Fitur Utama)

### F1. Smart Inventory Catalog
* **Deskripsi:** Halaman utama (Dashboard) yang menampilkan seluruh barang yang didaftarkan dalam bentuk *Cards*.
* **Fungsi:** 
  * Tambah barang baru (Nama Barang, Kategori opsional).
  * Hapus atau edit nama barang.
  * Pencarian barang (*Search bar*).

### F2. 1-Tap Status Toggles
* **Deskripsi:** Indikator status stok barang tanpa input angka kuantitas.
* **Logika Status:**
  * 🟢 **Aman:** Stok masih cukup untuk lebih dari 1 minggu.
  * 🟡 **Menipis:** Stok akan habis dalam 1-3 hari, perlu segera masuk radar belanja.
  * 🔴 **Habis:** Stok kosong, krisis, harus dibeli hari ini.
* **Aksi:** Pengguna cukup menekan (tap) kartu barang untuk merotasi atau memilih status ini.

### F3. Auto-Shopping List (Daftar Belanja Pintar)
* **Deskripsi:** Halaman dedikasi (Tab Belanja) yang melakukan kurasi otomatis.
* **Fungsi:**
  * Sistem otomatis memfilter dan menarik semua barang berstatus **Menipis** dan **Habis** ke dalam satu daftar (*checklist*).
  * Saat berbelanja, pengguna dapat mencentang (✅) barang yang sudah dimasukkan ke keranjang fisik.
  * Tombol **"Selesai Belanja"** untuk mereset massal semua barang yang dicentang kembali ke status **Aman**.

### F4. Activity Log (Riwayat Restok)
* **Deskripsi:** Pencatatan di latar belakang (*background logging*).
* **Fungsi:** Setiap kali status barang berubah menjadi "Aman" (via daftar belanja), sistem mencatat stempel waktu (*timestamp*). Ini berguna di masa depan untuk memprediksi seberapa cepat sabun mandi atau air galon habis per bulannya.

---

## 7. Kebutuhan Non-Fungsional & UI/UX
* **Mobile-First Design:** Karena aplikasi ini paling sering dibuka sambil berdiri di kamar mandi atau di lorong minimarket, UI harus 100% dioptimalkan untuk layar sentuh HP (tombol besar, *swipeable*).
* **Tema Visual (Dark Theme & Glassmorphism):** Menggunakan latar belakang gelap (*dark mode default*) dengan elemen kartu bergaya *glassmorphism* (transparan, *blur background*, border tipis menyala). Warna aksen menggunakan gradasi Ungu (Purple) dan Biru (Cyan) ala *cyberpunk/developer vibe*.
* **Performance:** Penggunaan **Next.js Server Actions** agar pembaruan status (toggles) terasa instan tanpa waktu *loading* halaman.

---

## 8. Draf Struktur Database (Prisma)
Sebagai gambaran teknis, ini adalah entitas utama yang akan dibangun:

```prisma
model Item {
  id        String      @id @default(uuid())
  name      String
  status    StockStatus @default(AMAN)
  category  String?     // Contoh: "Mandi", "Pantry", "Listrik"
  updatedAt DateTime    @updatedAt
  logs      RestockLog[]
}

enum StockStatus {
  AMAN
  MENIPIS
  HABIS
}

model RestockLog {
  id        String   @id @default(uuid())
  itemId    String
  item      Item     @relation(fields: [itemId], references: [id])
  restockedAt DateTime @default(now())
}
```

---

## 9. Batasan Sistem (Out of Scope - Versi 1.0)
Agar proyek solo ini dapat diselesaikan dalam waktu terbatas, fitur berikut **TIDAK** disertakan di versi MVP:
1. Otentikasi multi-user yang rumit (Fokus pada *single-user* atau *shared-password* untuk satu kamar kos).
2. Pemindai (*Barcode Scanner*) menggunakan kamera HP.
3. Input harga barang dan kalkulasi estimasi total biaya belanja harian (difokuskan murni pada *inventory status* terlebih dahulu).
4. Notifikasi Push / WhatsApp (Pengguna harus membuka web app untuk melihat status).