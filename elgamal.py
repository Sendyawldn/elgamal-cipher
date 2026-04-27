"""
ElGamal Cipher - Implementasi Python
================================================
Notasi:
  Kunci Publik  : (p, g, y)   → y = g^x mod p
  Kunci Privat  : x
  Enkripsi      : pakai kunci publik (p, g, y)
  Dekripsi      : pakai kunci privat (x, p)
"""

import random
from sympy import nextprime


# ─────────────────────────────────────────────
# 1. GENERATE BILANGAN PRIMA
# ─────────────────────────────────────────────
def generate_prime(bits=16):
    start = 2 ** (bits - 1)
    candidate = random.randint(start, start * 2)
    return nextprime(candidate)


# ─────────────────────────────────────────────
# 2. PEMBENTUKAN KUNCI
#    y = g^x mod p
#    Kunci Publik  : (p, g, y)
#    Kunci Privat  : x
# ─────────────────────────────────────────────
def generate_keys(bits=16):
    p = generate_prime(bits)          # bilangan prima
    g = random.randint(2, p - 2)     # bilangan random g < p
    x = random.randint(2, p - 2)     # kunci privat x < p

    y = pow(g, x, p)                  # y = g^x mod p  ← rumus

    kunci_publik  = (p, g, y)         # (p, g, y)
    kunci_privat  = x

    return kunci_publik, kunci_privat


# ─────────────────────────────────────────────
# 3. ENKRIPSI
#    Menggunakan kunci publik (p, g, y)
#    c1 = g^k mod p
#    c2 = m * y^k mod p
#    k  = bilangan acak (ephemeral)
# ─────────────────────────────────────────────
def enkripsi(kunci_publik, m: int):
    p, g, y = kunci_publik
    k  = random.randint(2, p - 2)    # k = bilangan acak sementara

    c1 = pow(g, k, p)                # c1 = g^k mod p
    c2 = (m * pow(y, k, p)) % p      # c2 = m * y^k mod p

    return c1, c2


# ─────────────────────────────────────────────
# 4. DEKRIPSI
#    Menggunakan kunci privat (x, p)
#    m = c2 * (c1^x)^-1 mod p
# ─────────────────────────────────────────────
def dekripsi(kunci_publik, kunci_privat, ciphertext):
    p, g, y = kunci_publik
    c1, c2  = ciphertext
    x       = kunci_privat

    s     = pow(c1, x, p)            # shared secret = c1^x mod p
    s_inv = pow(s, -1, p)            # invers modular
    m     = (c2 * s_inv) % p         # m = c2 * s^-1 mod p

    return m


# ─────────────────────────────────────────────
# 5. HELPER: TEKS ↔ ANGKA
# ─────────────────────────────────────────────
def teks_ke_angka(teks: str):
    return [ord(c) for c in teks]

def angka_ke_teks(angka: list):
    return ''.join(chr(n) for n in angka)


# ─────────────────────────────────────────────
# 6. ENKRIPSI & DEKRIPSI TEKS LENGKAP
# ─────────────────────────────────────────────
def enkripsi_teks(kunci_publik, plaintext: str):
    return [enkripsi(kunci_publik, m) for m in teks_ke_angka(plaintext)]

def dekripsi_teks(kunci_publik, kunci_privat, cipher_list: list):
    angka = [dekripsi(kunci_publik, kunci_privat, c) for c in cipher_list]
    return angka_ke_teks(angka)


# ─────────────────────────────────────────────
# 7. DEMO
# ─────────────────────────────────────────────
def demo():
    print("=" * 60)
    print("     IMPLEMENTASI ELGAMAL CIPHER - Python")
    print("=" * 60)

    # --- Pembentukan Kunci ---
    print("\n[1] PEMBENTUKAN KUNCI")
    print("    Rumus : y = g^x mod p")
    kunci_publik, kunci_privat = generate_keys(bits=16)
    p, g, y = kunci_publik

    print(f"    Bilangan Prima  (p) : {p}")
    print(f"    Generator       (g) : {g}")
    print(f"    Kunci Privat    (x) : {kunci_privat}")
    print(f"    Kunci Publik    (y) : {y}  → y = {g}^{kunci_privat} mod {p}")
    print(f"    Kunci Publik        : (p={p}, g={g}, y={y})")

    # --- Pesan 2 Kata ---
    pesan = "Halo Dunia"         # 2 kata sesuai permintaan
    print(f"\n[2] PESAN ASLI      : '{pesan}'")

    # --- Enkripsi ---
    print("\n[3] PROSES ENKRIPSI (menggunakan kunci publik: p, g, y)")
    print("    Rumus : c1 = g^k mod p | c2 = m * y^k mod p")
    cipher_list = enkripsi_teks(kunci_publik, pesan)
    for i, (c1, c2) in enumerate(cipher_list):
        print(f"    '{pesan[i]}' (ASCII={ord(pesan[i])}) -> c1={c1}, c2={c2}")

    # --- Dekripsi ---
    print("\n[4] PROSES DEKRIPSI (menggunakan kunci privat: x, p)")
    print("    Rumus : m = c2 * (c1^x)^-1 mod p")
    hasil = dekripsi_teks(kunci_publik, kunci_privat, cipher_list)
    print(f"    Hasil Dekripsi  : '{hasil}'")

    # --- Verifikasi ---
    print("\n[5] VERIFIKASI")
    if pesan == hasil:
        print("    BERHASIL! Pesan asli == Hasil dekripsi")
    else:
        print("    GAGAL!")

    print("=" * 60)


if __name__ == "__main__":
    demo()