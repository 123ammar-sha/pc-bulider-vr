# Product Requirements Document (PRD)

**Nama Produk:** VR Mobile PC Assembly Emulator (WebXR)  
**Penulis:** Ammar Shafiy (NIM: IF0224009)  
**Institusi:** Program Studi Informatika, UMUKA  
**Tanggal:** Mei 2026  
**Status Dokumen:** Draf / Versi 1.0  

---

## 1. Ringkasan Eksekutif (*Executive Summary*)
Proyek ini bertujuan untuk membangun sebuah aplikasi simulasi *Virtual Reality* (VR) berbasis *mobile web* yang memungkinkan pengguna untuk belajar merakit komponen Personal Computer (PC). Dengan memanfaatkan arsitektur *decoupled* yang ringan menggunakan React Three Fiber dan WebXR, aplikasi ini dapat diakses langsung melalui *browser smartphone* (seperti Google Chrome) dan perangkat *VR headset mobile* (seperti Google Cardboard) tanpa perlu melakukan instalasi APK berukuran besar.

## 2. Tujuan & Sasaran (*Goals & Objectives*)
* **Aksesibilitas Tinggi:** Menciptakan media pembelajaran perakitan perangkat keras yang bisa diakses oleh siapa saja hanya dengan *smartphone* dan koneksi internet.
* **Efisiensi *Resource*:** Menghindari penggunaan *game engine* berat, memastikan aplikasi berjalan mulus (target 60 FPS) di berbagai spesifikasi ponsel kelas menengah.
* **Keamanan Pembelajaran:** Memberikan ruang aman bagi mahasiswa atau pemula untuk memahami tata letak komponen (*motherboard*, RAM, CPU) tanpa risiko merusak komponen fisik yang mahal.

## 3. Target Pengguna (*User Personas*)
* Mahasiswa IT/Informatika yang sedang mengambil mata kuliah arsitektur perangkat keras atau pengantar jaringan.
* Siswa SMK jurusan Teknik Komputer dan Jaringan (TKJ).
* Hobiis pemula yang ingin memahami struktur internal PC sebelum merakit secara fisik.

## 4. Spesifikasi Teknis (*Tech Stack*)

| Kategori | Teknologi Utama | Alasan Pemilihan |
| :--- | :--- | :--- |
| **Framework UI** | React.js (Vite) / Next.js | Ekosistem *frontend* modern, modular, dan mempermudah pemisahan komponen. |
| **3D & VR Engine** | React Three Fiber & @react-three/xr | Wrapper deklaratif untuk Three.js dan WebXR; sangat ringan dan integrasi mulus dengan React. |
| **State Management**| Zustand | Ringan, *boilerplate-free*, ideal untuk melacak status pemasangan komponen secara *real-time*. |
| **Aset 3D** | Format `.glb` (*Low-Poly*) | Format biner standar web yang dikompresi untuk mempercepat waktu pemuatan (*load time*). |

## 5. Fitur Utama MVP (*Minimum Viable Product*)
Berikut adalah batasan fitur untuk fase peluncuran pertama:

1. **WebXR Entry Point:** Tombol "Enter VR" yang otomatis membagi layar menjadi mode *stereoscopic* saat diakses dari *smartphone*.
2. **Gaze & Reticle Interaction:** Sistem kontrol berbasis pandangan mata. Pengguna tidak memerlukan *controller* Bluetooth; cukup menatap objek selama 2 detik untuk mengambil atau meletakkan komponen.
3. **Sistem *Snapping* Akurat:** Deteksi *collider* pintar di mana komponen (misal: RAM) akan otomatis terkunci pada koordinat dan rotasi yang benar jika didekatkan ke slot yang sesuai di *motherboard*.
4. **Komponen Dasar PC:** Aset 3D *low-poly* yang mencakup Casing, Motherboard, CPU, RAM (2 keping), Kartu Grafis (GPU), dan Power Supply (PSU).
5. **HUD Informasi:** Panel teks virtual sederhana yang muncul saat objek disorot, menampilkan nama komponen dan instruksi dasar.

## 6. Alur Pengguna (*User Flow*)
1. Pengguna membuka URL aplikasi melalui *browser smartphone*.
2. Layar menampilkan ruang kerja 3D (kamera statis atau *orbit controls*).
3. Pengguna menekan tombol "Enter VR" dan memasukkan ponsel ke dalam *VR Headset* (Cardboard).
4. Pengguna mengarahkan pandangan (*reticle*) ke kepingan RAM di atas meja. Objek akan sedikit membesar (*scale up*) sebagai indikasi terpilih.
5. Pengguna menahan pandangan untuk "mengambil" RAM.
6. Pengguna mengarahkan pandangan ke area slot RAM di *motherboard*.
7. Sistem *Zustand* memvalidasi posisi; RAM otomatis terpasang (*snap*) ke slot, dan status komponen diubah menjadi `installed: true`.
8. Langkah diulang untuk komponen CPU, GPU, dan PSU.

## 7. Kriteria Sukses (*Non-Functional Requirements*)
* **Performa:** Aplikasi harus memuat aset awal di bawah 4 detik pada koneksi 4G standar. Rendering harus dipertahankan pada 60 FPS untuk mencegah *motion sickness*.
* **Kompatibilitas:** Berfungsi penuh pada browser berbasis Chromium (Google Chrome, Edge) terbaru di sistem operasi Android.
* **Desain:** Antarmuka harus bersih, minim distraksi, dan fokus pada efisiensi.

## 8. Ruang Lingkup Masa Depan (*Future Scope*)
Jika MVP berhasil, fitur-fitur berikut akan ditambahkan pada iterasi selanjutnya:
* **Modul Manajemen Jaringan:** Setelah perakitan PC selesai, simulasi dilanjutkan dengan menyambungkan kabel LAN (RJ45) ke *switch/router* virtual sebagai pengantar mata kuliah administrasi jaringan komputer.
* **Simulasi Instalasi OS:** Layar monitor virtual di dalam VR yang mensimulasikan proses masuk BIOS dan instalasi sistem operasi dasar (seperti distro Linux).
* **Sistem *Scoring*:** Batas waktu perakitan dan sistem penilaian objektif untuk keperluan evaluasi kelas. 