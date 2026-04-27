# ElGamal Cipher (Python)

Proyek ini berisi implementasi algoritma kriptografi **ElGamal** dalam Python dengan dua versi:

- Versi terminal/CLI untuk demonstrasi langkah enkripsi-dekripsi.
- Versi GUI menggunakan Tkinter agar lebih mudah dicoba secara interaktif.

## Fitur

- Generate pasangan kunci ElGamal:
  - Kunci publik `(p, g, y)`
  - Kunci privat `x`
- Enkripsi pesan teks menjadi list ciphertext `(c1, c2)`.
- Dekripsi ciphertext kembali ke plaintext.
- Demo alur lengkap pada versi CLI.
- Antarmuka sederhana berbasis Tkinter pada versi GUI.

## Struktur Proyek

- `elgamal.py` → implementasi ElGamal + antarmuka GUI (Tkinter)
- `elgamal-cipher.py` → implementasi ElGamal + demo CLI di terminal

## Prasyarat

- Python 3.10+ (disarankan Python 3.12)
- Paket Python:
  - `sympy`

> Catatan: Pada Debian/Ubuntu terbaru, instalasi pip global bisa gagal karena kebijakan PEP 668 (externally-managed-environment). Solusi terbaik adalah menggunakan virtual environment.

## Instalasi (Disarankan: Virtual Environment)

1. Masuk ke folder proyek.
2. Buat virtual environment:

```bash
python3 -m venv .venv
```

3. Aktifkan virtual environment:

```bash
source .venv/bin/activate
```

4. Install dependency:

```bash
pip install --upgrade pip
pip install sympy
```

## Menjalankan Program

### 1) Versi CLI

```bash
python elgamal.py
```

Program akan:

- Membuat kunci publik dan privat
- Mengenkripsi pesan contoh
- Mendekripsi kembali
- Menampilkan hasil verifikasi

### 2) Versi GUI (Tkinter)

```bash
python elgamal-cipher.py
```

Langkah penggunaan GUI:

1. Klik **Generate Kunci Baru**
2. Masukkan pesan pada kolom input
3. Klik **Enkripsi Pesan**
4. Klik **Dekripsi Pesan** untuk melihat hasil kembali

## Catatan Keamanan

- Nilai `bits=16` digunakan untuk tujuan pembelajaran/demonstrasi.
- Untuk penggunaan nyata, ukuran kunci harus jauh lebih besar dan proses pemilihan parameter harus mengikuti standar kriptografi yang aman.

## Lisensi

Belum ditentukan.
