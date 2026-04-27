"""
ElGamal Cipher - Implementasi Python dengan GUI (Tkinter)
================================================
"""

import random
import tkinter as tk
from tkinter import messagebox
from sympy import nextprime

# ─────────────────────────────────────────────
# FUNGSI INTI ELGAMAL (Tetap sama seperti kode Anda)
# ─────────────────────────────────────────────
def generate_prime(bits=16):
    start = 2 ** (bits - 1)
    candidate = random.randint(start, start * 2)
    return nextprime(candidate)

def generate_keys(bits=16):
    p = generate_prime(bits)          
    g = random.randint(2, p - 2)     
    x = random.randint(2, p - 2)     
    y = pow(g, x, p)                  
    return (p, g, y), x

def enkripsi(kunci_publik, m: int):
    p, g, y = kunci_publik
    k  = random.randint(2, p - 2)    
    c1 = pow(g, k, p)                
    c2 = (m * pow(y, k, p)) % p      
    return c1, c2

def dekripsi(kunci_publik, kunci_privat, ciphertext):
    p, g, y = kunci_publik
    c1, c2  = ciphertext
    x       = kunci_privat
    s       = pow(c1, x, p)            
    s_inv   = pow(s, -1, p)            
    m       = (c2 * s_inv) % p         
    return m

def teks_ke_angka(teks: str):
    return [ord(c) for c in teks]

def angka_ke_teks(angka: list):
    return ''.join(chr(n) for n in angka)

def enkripsi_teks(kunci_publik, plaintext: str):
    return [enkripsi(kunci_publik, m) for m in teks_ke_angka(plaintext)]

def dekripsi_teks(kunci_publik, kunci_privat, cipher_list: list):
    angka = [dekripsi(kunci_publik, kunci_privat, c) for c in cipher_list]
    return angka_ke_teks(angka)


# ─────────────────────────────────────────────
# KELAS GUI TKINTER
# ─────────────────────────────────────────────
class ElGamalApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Aplikasi Kriptografi ElGamal")
        self.root.geometry("500x650")
        
        # Variabel global untuk menyimpan kunci & ciphertext
        self.kunci_publik = None
        self.kunci_privat = None
        self.cipher_list = None
        
        self.create_widgets()

    def create_widgets(self):
        # --- Frame Kunci ---
        frame_kunci = tk.LabelFrame(self.root, text="1. Manajemen Kunci", padx=10, pady=10)
        frame_kunci.pack(fill="x", padx=10, pady=5)
        
        self.btn_gen_key = tk.Button(frame_kunci, text="Generate Kunci Baru", command=self.proses_generate_key)
        self.btn_gen_key.pack(pady=5)
        
        self.lbl_pub_key = tk.Label(frame_kunci, text="Kunci Publik (p, g, y) : -")
        self.lbl_pub_key.pack(anchor="w")
        self.lbl_priv_key = tk.Label(frame_kunci, text="Kunci Privat (x) : -")
        self.lbl_priv_key.pack(anchor="w")

        # --- Frame Enkripsi ---
        frame_enkripsi = tk.LabelFrame(self.root, text="2. Enkripsi Pesan", padx=10, pady=10)
        frame_enkripsi.pack(fill="x", padx=10, pady=5)
        
        tk.Label(frame_enkripsi, text="Masukkan Pesan Asli:").pack(anchor="w")
        self.txt_pesan = tk.Text(frame_enkripsi, height=3)
        self.txt_pesan.pack(fill="x", pady=5)
        
        self.btn_enkripsi = tk.Button(frame_enkripsi, text="Enkripsi Pesan", command=self.proses_enkripsi)
        self.btn_enkripsi.pack(pady=5)
        
        tk.Label(frame_enkripsi, text="Hasil Ciphertext:").pack(anchor="w")
        self.txt_cipher = tk.Text(frame_enkripsi, height=4, state=tk.DISABLED)
        self.txt_cipher.pack(fill="x", pady=5)

        # --- Frame Dekripsi ---
        frame_dekripsi = tk.LabelFrame(self.root, text="3. Dekripsi Pesan", padx=10, pady=10)
        frame_dekripsi.pack(fill="x", padx=10, pady=5)
        
        self.btn_dekripsi = tk.Button(frame_dekripsi, text="Dekripsi Pesan", command=self.proses_dekripsi)
        self.btn_dekripsi.pack(pady=5)
        
        tk.Label(frame_dekripsi, text="Pesan Kembali:").pack(anchor="w")
        self.txt_hasil = tk.Text(frame_dekripsi, height=3, state=tk.DISABLED)
        self.txt_hasil.pack(fill="x", pady=5)

    def proses_generate_key(self):
        self.kunci_publik, self.kunci_privat = generate_keys(bits=16)
        self.lbl_pub_key.config(text=f"Kunci Publik (p, g, y) : {self.kunci_publik}")
        self.lbl_priv_key.config(text=f"Kunci Privat (x) : {self.kunci_privat}")
        messagebox.showinfo("Sukses", "Pasangan Kunci Berhasil Dibuat!")

    def proses_enkripsi(self):
        if not self.kunci_publik:
            messagebox.showwarning("Peringatan", "Harap generate kunci terlebih dahulu!")
            return
            
        pesan = self.txt_pesan.get("1.0", tk.END).strip()
        if not pesan:
            messagebox.showwarning("Peringatan", "Pesan tidak boleh kosong!")
            return
            
        self.cipher_list = enkripsi_teks(self.kunci_publik, pesan)
        
        # Tampilkan di textbox cipher
        self.txt_cipher.config(state=tk.NORMAL)
        self.txt_cipher.delete("1.0", tk.END)
        self.txt_cipher.insert(tk.END, str(self.cipher_list))
        self.txt_cipher.config(state=tk.DISABLED)
        messagebox.showinfo("Sukses", "Pesan Berhasil Dienkripsi!")

    def proses_dekripsi(self):
        if not self.cipher_list or not self.kunci_privat:
            messagebox.showwarning("Peringatan", "Belum ada pesan yang dienkripsi!")
            return
            
        hasil = dekripsi_teks(self.kunci_publik, self.kunci_privat, self.cipher_list)
        
        # Tampilkan di textbox hasil
        self.txt_hasil.config(state=tk.NORMAL)
        self.txt_hasil.delete("1.0", tk.END)
        self.txt_hasil.insert(tk.END, hasil)
        self.txt_hasil.config(state=tk.DISABLED)

# ─────────────────────────────────────────────
# JALANKAN APLIKASI
# ─────────────────────────────────────────────
if __name__ == "__main__":
    root = tk.Tk()
    app = ElGamalApp(root)
    root.mainloop()