# ElGamal Cipher (React)

Proyek ini berisi implementasi algoritma kriptografi **ElGamal** dengan antarmuka **React**.

File Python lama tetap tersedia sebagai referensi implementasi, tetapi tampilan utama sekarang berjalan di browser menggunakan React.

## Fitur

- Generate pasangan kunci ElGamal:
  - Kunci publik `(p, g, y)`
  - Kunci privat `x`
- Enkripsi pesan teks menjadi list ciphertext `(c1, c2)`.
- Dekripsi ciphertext kembali ke plaintext.
- Enkripsi pesan teks menjadi ciphertext langsung di browser.
- Dekripsi ciphertext kembali ke plaintext.
- Tampilan interaktif berbasis React.

## Struktur Proyek

- `src/App.jsx` → aplikasi React + logika ElGamal
- `src/styles.css` → styling tampilan React
- `elgamal.py` → implementasi Python CLI lama
- `elgamal-cipher.py` → implementasi Python Tkinter lama

## Prasyarat

- Node.js 18+
- npm

## Instalasi

1. Masuk ke folder proyek.
2. Install dependency:

```bash
npm install
```

## Menjalankan Aplikasi React

```bash
npm run dev
```

Lalu buka URL yang ditampilkan oleh Vite di browser.

Langkah penggunaan:

1. Klik **Generate Kunci Baru**
2. Masukkan pesan pada kolom input
3. Klik **Enkripsi Pesan**
4. Klik **Dekripsi Pesan** untuk melihat hasil kembali

## Catatan Keamanan

- Nilai `bits=16` digunakan untuk tujuan pembelajaran/demonstrasi.
- Untuk penggunaan nyata, ukuran kunci harus jauh lebih besar dan proses pemilihan parameter harus mengikuti standar kriptografi yang aman.

## Lisensi

Belum ditentukan.
