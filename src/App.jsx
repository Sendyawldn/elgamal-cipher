// import React, { useMemo, useState } from 'react';

// const DEFAULT_BITS = 16;

// function randomInt(min, max) {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// function modPow(base, exponent, modulus) {
//   let result = 1n;
//   let currentBase = BigInt(base) % BigInt(modulus);
//   let currentExponent = BigInt(exponent);
//   const currentModulus = BigInt(modulus);

//   while (currentExponent > 0n) {
//     if (currentExponent % 2n === 1n) {
//       result = (result * currentBase) % currentModulus;
//     }

//     currentBase = (currentBase * currentBase) % currentModulus;
//     currentExponent /= 2n;
//   }

//   return Number(result);
// }

// function extendedGcd(a, b) {
//   if (b === 0n) {
//     return [a, 1n, 0n];
//   }

//   const [gcd, x1, y1] = extendedGcd(b, a % b);
//   return [gcd, y1, x1 - (a / b) * y1];
// }

// function modInverse(value, modulus) {
//   const [gcd, x] = extendedGcd(BigInt(value), BigInt(modulus));

//   if (gcd !== 1n) {
//     throw new Error('Invers modular tidak tersedia.');
//   }

//   return Number((x % BigInt(modulus) + BigInt(modulus)) % BigInt(modulus));
// }

// function isPrime(number) {
//   if (number < 2) return false;
//   if (number === 2) return true;
//   if (number % 2 === 0) return false;

//   for (let divisor = 3; divisor * divisor <= number; divisor += 2) {
//     if (number % divisor === 0) return false;
//   }

//   return true;
// }

// function nextPrime(candidate) {
//   let number = Math.max(2, candidate);

//   while (!isPrime(number)) {
//     number += 1;
//   }

//   return number;
// }

// function generatePrime(bits = DEFAULT_BITS) {
//   const start = 2 ** (bits - 1);
//   return nextPrime(randomInt(start, start * 2));
// }

// function generateKeys(bits = DEFAULT_BITS) {
//   const p = generatePrime(bits);
//   const g = randomInt(2, p - 2);
//   const x = randomInt(2, p - 2);
//   const y = modPow(g, x, p);

//   return {
//     publicKey: { p, g, y },
//     privateKey: x,
//   };
// }

// function encrypt(publicKey, messageNumber) {
//   const { p, g, y } = publicKey;
//   const k = randomInt(2, p - 2);
//   const c1 = modPow(g, k, p);
//   const c2 = (messageNumber * modPow(y, k, p)) % p;

//   return { c1, c2 };
// }

// function decrypt(publicKey, privateKey, cipher) {
//   const { p } = publicKey;
//   const s = modPow(cipher.c1, privateKey, p);
//   const sInv = modInverse(s, p);

//   return (cipher.c2 * sInv) % p;
// }

// function textToNumbers(text) {
//   return Array.from(text).map((character) => character.charCodeAt(0));
// }

// function numbersToText(numbers) {
//   return numbers.map((number) => String.fromCharCode(number)).join('');
// }

// function encryptText(publicKey, plaintext) {
//   return textToNumbers(plaintext).map((number) => encrypt(publicKey, number));
// }

// function decryptText(publicKey, privateKey, cipherList) {
//   return numbersToText(cipherList.map((cipher) => decrypt(publicKey, privateKey, cipher)));
// }

// function formatPublicKey(publicKey) {
//   if (!publicKey) return '-';
//   return `(${publicKey.p}, ${publicKey.g}, ${publicKey.y})`;
// }

// function formatCipher(cipherList) {
//   if (!cipherList.length) return '-';
//   return cipherList.map(({ c1, c2 }) => `(${c1}, ${c2})`).join(', ');
// }

// export default function App() {
//   const [publicKey, setPublicKey] = useState(null);
//   const [privateKey, setPrivateKey] = useState(null);
//   const [message, setMessage] = useState('');
//   const [cipherList, setCipherList] = useState([]);
//   const [plainResult, setPlainResult] = useState('');
//   const [notice, setNotice] = useState('Generate kunci terlebih dahulu untuk memulai.');

//   const canEncrypt = publicKey && message.trim().length > 0;
//   const canDecrypt = publicKey && privateKey && cipherList.length > 0;

//   const asciiPreview = useMemo(() => {
//     if (!message.trim()) return '-';
//     return textToNumbers(message).join(', ');
//   }, [message]);

//   function handleGenerateKey() {
//     const keys = generateKeys();
//     setPublicKey(keys.publicKey);
//     setPrivateKey(keys.privateKey);
//     setCipherList([]);
//     setPlainResult('');
//     setNotice('Pasangan kunci berhasil dibuat.');
//   }

//   function handleEncrypt() {
//     if (!publicKey) {
//       setNotice('Harap generate kunci terlebih dahulu.');
//       return;
//     }

//     if (!message.trim()) {
//       setNotice('Pesan tidak boleh kosong.');
//       return;
//     }

//     const nextCipherList = encryptText(publicKey, message.trim());
//     setCipherList(nextCipherList);
//     setPlainResult('');
//     setNotice('Pesan berhasil dienkripsi.');
//   }

//   function handleDecrypt() {
//     if (!canDecrypt) {
//       setNotice('Belum ada pesan yang dienkripsi.');
//       return;
//     }

//     setPlainResult(decryptText(publicKey, privateKey, cipherList));
//     setNotice('Ciphertext berhasil didekripsi.');
//   }

//   return (
//     <main className="app-shell">
//       <section className="workspace" aria-label="Aplikasi kriptografi ElGamal">
//         <header className="app-header">
//           <div>
//             <p className="eyebrow">Kriptografi klasik</p>
//             <h1>ElGamal Cipher</h1>
//           </div>
//           <button className="primary-button" type="button" onClick={handleGenerateKey}>
//             Generate Kunci
//           </button>
//         </header>

//         <div className="notice" role="status">
//           {notice}
//         </div>

//         <section className="panel key-panel">
//           <div>
//             <h2>Manajemen Kunci</h2>
//             <p>Gunakan pasangan kunci publik dan privat untuk enkripsi dan dekripsi.</p>
//           </div>

//           <div className="key-grid">
//             <div className="key-item">
//               <span>Kunci Publik (p, g, y)</span>
//               <strong>{formatPublicKey(publicKey)}</strong>
//             </div>
//             <div className="key-item">
//               <span>Kunci Privat (x)</span>
//               <strong>{privateKey ?? '-'}</strong>
//             </div>
//           </div>
//         </section>

//         <section className="content-grid">
//           <div className="panel">
//             <div className="panel-title">
//               <h2>Enkripsi Pesan</h2>
//               <button type="button" onClick={handleEncrypt} disabled={!canEncrypt}>
//                 Enkripsi
//               </button>
//             </div>

//             <label htmlFor="message">Pesan Asli</label>
//             <textarea
//               id="message"
//               value={message}
//               onChange={(event) => setMessage(event.target.value)}
//               placeholder="Masukkan pesan..."
//               rows={6}
//             />

//             <div className="output-box">
//               <span>ASCII</span>
//               <p>{asciiPreview}</p>
//             </div>

//             <div className="output-box">
//               <span>Hasil Ciphertext</span>
//               <p>{formatCipher(cipherList)}</p>
//             </div>
//           </div>

//           <div className="panel">
//             <div className="panel-title">
//               <h2>Dekripsi Pesan</h2>
//               <button type="button" onClick={handleDecrypt} disabled={!canDecrypt}>
//                 Dekripsi
//               </button>
//             </div>

//             <div className="result-area">
//               <span>Pesan Kembali</span>
//               <strong>{plainResult || '-'}</strong>
//             </div>

//             <div className="formula-list" aria-label="Rumus ElGamal">
//               <div>
//                 <span>Public key</span>
//                 <code>y = g^x mod p</code>
//               </div>
//               <div>
//                 <span>Encrypt</span>
//                 <code>c1 = g^k mod p</code>
//                 <code>c2 = m . y^k mod p</code>
//               </div>
//               <div>
//                 <span>Decrypt</span>
//                 <code>m = c2 . (c1^x)^-1 mod p</code>
//               </div>
//             </div>
//           </div>
//         </section>
//       </section>
//     </main>
//   );
// }

import React, { useState } from "react";

// ==========================================
// 1. FUNGSI MATEMATIKA KRIPTOGRAFI ELGAMAL
// ==========================================

// Cek bilangan prima
const isPrime = (num) => {
  for (let i = 2, s = Math.sqrt(num); i <= s; i++) {
    if (num % i === 0) return false;
  }
  return num > 1;
};

// Generate bilangan prima acak (12-bit agar cukup untuk ASCII)
const generatePrime = (bits = 12) => {
  const min = 2 ** (bits - 1);
  const max = 2 ** bits - 1;
  while (true) {
    const p = Math.floor(Math.random() * (max - min + 1)) + min;
    if (isPrime(p)) return p;
  }
};

// Perpangkatan Modulo (base^exp mod m) menggunakan BigInt agar tidak overflow
const modPow = (b, e, m) => {
  let res = 1n;
  let base = BigInt(b) % BigInt(m);
  let exp = BigInt(e);
  const mod = BigInt(m);
  while (exp > 0n) {
    if (exp % 2n === 1n) res = (res * base) % mod;
    exp /= 2n;
    base = (base * base) % mod;
  }
  return Number(res);
};

// Mencari Invers Modulo
const modInverse = (a, m) => {
  let m0 = BigInt(m),
    y = 0n,
    x = 1n;
  let a0 = BigInt(a);
  if (m0 === 1n) return 0n;
  while (a0 > 1n) {
    let q = a0 / m0;
    let t = m0;
    m0 = a0 % m0;
    a0 = t;
    t = y;
    y = x - q * y;
    x = t;
  }
  if (x < 0n) x += BigInt(m);
  return Number(x);
};

// ==========================================
// 2. KOMPONEN UTAMA (UI ALICE & BOB)
// ==========================================

export default function App() {
  // STATE BOB (Penerima)
  const [bobKeys, setBobKeys] = useState(null);
  const [bobReceivedCipher, setBobReceivedCipher] = useState(null);
  const [bobDecrypted, setBobDecrypted] = useState("");

  // STATE ALICE (Pengirim)
  const [alicePubKey, setAlicePubKey] = useState(null);
  const [aliceMsg, setAliceMsg] = useState("");
  const [aliceCipher, setAliceCipher] = useState(null);

  // --- AKSI BOB ---
  const handleGenerateKeys = () => {
    const p = generatePrime(12);
    const g = Math.floor(Math.random() * (p - 3)) + 2;
    const x = Math.floor(Math.random() * (p - 3)) + 2; // Kunci Privat
    const y = modPow(g, x, p); // Kunci Publik

    setBobKeys({ p, g, x, y });
    setAlicePubKey(null);
    setAliceCipher(null);
    setBobReceivedCipher(null);
    setBobDecrypted("");
    setAliceMsg("");
  };

  const handleSendPublicKey = () => {
    if (bobKeys) setAlicePubKey({ p: bobKeys.p, g: bobKeys.g, y: bobKeys.y });
  };

  const handleDecrypt = () => {
    if (!bobReceivedCipher || !bobKeys) return;
    const { p, x } = bobKeys;
    let text = "";

    bobReceivedCipher.forEach(({ c1, c2 }) => {
      // Rumus Dekripsi: m = c2 * (c1^x)^-1 mod p
      const s = modPow(c1, x, p);
      const sInv = modInverse(s, p);
      const m = Number((BigInt(c2) * BigInt(sInv)) % BigInt(p));
      text += String.fromCharCode(m); // Kembalikan angka ke huruf ASCII
    });
    setBobDecrypted(text);
  };

  // --- AKSI ALICE ---
  const handleEncrypt = () => {
    if (!alicePubKey || !aliceMsg) return;
    const { p, g, y } = alicePubKey;
    const cipherArray = [];

    for (let i = 0; i < aliceMsg.length; i++) {
      const m = aliceMsg.charCodeAt(i);
      const k = Math.floor(Math.random() * (p - 3)) + 2; // Bilangan acak k
      // Rumus Enkripsi
      const c1 = modPow(g, k, p);
      const c2 = Number((BigInt(m) * BigInt(modPow(y, k, p))) % BigInt(p));
      cipherArray.push({ c1, c2 });
    }
    setAliceCipher(cipherArray);
  };

  const handleSendCipher = () => {
    if (aliceCipher) setBobReceivedCipher(aliceCipher);
  };

  return (
    <div style={styles.container}>
      {/* ================================================= */}
      {/* PANEL KIRI: PENERIMA (BOB) */}
      {/* ================================================= */}
      <div style={{ ...styles.column, borderTop: "5px solid #007bff" }}>
        <h2 style={styles.header}>👤 Layar Penerima (Bob)</h2>

        <div style={styles.card}>
          <h3>1. Buat Kunci</h3>
          <p style={styles.helpText}>
            Bob membangkitkan kunci asimetris secara lokal.
          </p>
          <button style={styles.btnPrimary} onClick={handleGenerateKeys}>
            Generate Kunci Baru
          </button>

          {bobKeys && (
            <div style={{ marginTop: "15px" }}>
              <p>
                <strong>Kunci Privat (Rahasia):</strong>{" "}
                <span style={styles.secret}>x = {bobKeys.x}</span>
              </p>
              <p>
                <strong>Kunci Publik:</strong> p={bobKeys.p}, g={bobKeys.g}, y=
                {bobKeys.y}
              </p>
              <button style={styles.btnAction} onClick={handleSendPublicKey}>
                Bagikan Kunci Publik ke Alice ➔
              </button>
            </div>
          )}
        </div>

        <div style={styles.card}>
          <h3>4. Terima & Dekripsi Pesan</h3>
          {bobReceivedCipher ? (
            <>
              <p>
                <strong>Pesan Masuk (Ciphertext):</strong>
              </p>
              <p style={styles.cipherText}>
                {bobReceivedCipher.map((c) => `(${c.c1}, ${c.c2})`).join(", ")}
              </p>
              <button style={styles.btnSuccess} onClick={handleDecrypt}>
                Bongkar Sandi (Dekripsi)
              </button>
              {bobDecrypted && (
                <div style={styles.resultBox}>
                  <strong>Hasil Dekripsi: </strong> {bobDecrypted}
                </div>
              )}
            </>
          ) : (
            <p style={styles.helpText}>Menunggu pesan masuk dari Alice...</p>
          )}
        </div>
      </div>

      {/* ================================================= */}
      {/* PANEL KANAN: PENGIRIM (ALICE) */}
      {/* ================================================= */}
      <div style={{ ...styles.column, borderTop: "5px solid #28a745" }}>
        <h2 style={styles.header}>👱‍♀️ Layar Pengirim (Alice)</h2>

        <div style={styles.card}>
          <h3>2. Tulis Pesan</h3>
          {alicePubKey ? (
            <>
              <p style={styles.helpText}>
                Kunci Publik Bob diterima: (p={alicePubKey.p}, g={alicePubKey.g}
                , y={alicePubKey.y})
              </p>
              <textarea
                style={styles.input}
                rows="3"
                placeholder="Ketik rahasia di sini..."
                value={aliceMsg}
                onChange={(e) => setAliceMsg(e.target.value)}
              />
              <button style={styles.btnPrimary} onClick={handleEncrypt}>
                Enkripsi Pesan
              </button>
            </>
          ) : (
            <p style={styles.helpText}>
              Menunggu Bob membagikan kunci publiknya...
            </p>
          )}
        </div>

        <div style={styles.card}>
          <h3>3. Hasil Enkripsi</h3>
          {aliceCipher ? (
            <>
              <p style={styles.cipherText}>
                {aliceCipher.map((c) => `(${c.c1}, ${c.c2})`).join(", ")}
              </p>
              <button style={styles.btnAction} onClick={handleSendCipher}>
                Kirim Pesan Sandi ke Bob ➔
              </button>
            </>
          ) : (
            <p style={styles.helpText}>Belum ada pesan yang dienkripsi.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. STYLING (CSS in JS)
// ==========================================
const styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    gap: "20px",
    padding: "30px",
    fontFamily: "system-ui, -apple-system, sans-serif",
    backgroundColor: "#e9ecef",
    minHeight: "100vh",
    color: "#333",
  },
  column: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "25px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  header: {
    margin: "0 0 10px 0",
    paddingBottom: "15px",
    borderBottom: "1px solid #ddd",
    fontSize: "1.4rem",
  },
  card: {
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid #dee2e6",
  },
  helpText: {
    fontSize: "0.9rem",
    color: "#6c757d",
    fontStyle: "italic",
    marginBottom: "15px",
  },
  btnPrimary: {
    padding: "10px 16px",
    backgroundColor: "#0d6efd",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "600",
    width: "100%",
  },
  btnAction: {
    padding: "10px 16px",
    backgroundColor: "#ffc107",
    color: "#000",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "600",
    marginTop: "10px",
    width: "100%",
  },
  btnSuccess: {
    padding: "10px 16px",
    backgroundColor: "#198754",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "600",
    width: "100%",
    marginBottom: "15px",
  },
  input: {
    padding: "12px",
    borderRadius: "5px",
    border: "1px solid #ced4da",
    width: "100%",
    boxSizing: "border-box",
    marginBottom: "10px",
    fontSize: "1rem",
  },
  secret: {
    backgroundColor: "#dc3545",
    color: "white",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  cipherText: {
    fontFamily: "monospace",
    wordBreak: "break-all",
    color: "#d63384",
    backgroundColor: "#fff",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    marginBottom: "15px",
  },
  resultBox: {
    backgroundColor: "#d1e7dd",
    color: "#0f5132",
    padding: "15px",
    borderRadius: "5px",
    border: "1px solid #badbcc",
    fontSize: "1.1rem",
  },
};
