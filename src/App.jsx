import React, { useMemo, useState } from 'react';

const DEFAULT_BITS = 16;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function modPow(base, exponent, modulus) {
  let result = 1n;
  let currentBase = BigInt(base) % BigInt(modulus);
  let currentExponent = BigInt(exponent);
  const currentModulus = BigInt(modulus);

  while (currentExponent > 0n) {
    if (currentExponent % 2n === 1n) {
      result = (result * currentBase) % currentModulus;
    }

    currentBase = (currentBase * currentBase) % currentModulus;
    currentExponent /= 2n;
  }

  return Number(result);
}

function extendedGcd(a, b) {
  if (b === 0n) {
    return [a, 1n, 0n];
  }

  const [gcd, x1, y1] = extendedGcd(b, a % b);
  return [gcd, y1, x1 - (a / b) * y1];
}

function modInverse(value, modulus) {
  const [gcd, x] = extendedGcd(BigInt(value), BigInt(modulus));

  if (gcd !== 1n) {
    throw new Error('Invers modular tidak tersedia.');
  }

  return Number((x % BigInt(modulus) + BigInt(modulus)) % BigInt(modulus));
}

function isPrime(number) {
  if (number < 2) return false;
  if (number === 2) return true;
  if (number % 2 === 0) return false;

  for (let divisor = 3; divisor * divisor <= number; divisor += 2) {
    if (number % divisor === 0) return false;
  }

  return true;
}

function nextPrime(candidate) {
  let number = Math.max(2, candidate);

  while (!isPrime(number)) {
    number += 1;
  }

  return number;
}

function generatePrime(bits = DEFAULT_BITS) {
  const start = 2 ** (bits - 1);
  return nextPrime(randomInt(start, start * 2));
}

function generateKeys(bits = DEFAULT_BITS) {
  const p = generatePrime(bits);
  const g = randomInt(2, p - 2);
  const x = randomInt(2, p - 2);
  const y = modPow(g, x, p);

  return {
    publicKey: { p, g, y },
    privateKey: x,
  };
}

function encrypt(publicKey, messageNumber) {
  const { p, g, y } = publicKey;
  const k = randomInt(2, p - 2);
  const c1 = modPow(g, k, p);
  const c2 = (messageNumber * modPow(y, k, p)) % p;

  return { c1, c2 };
}

function decrypt(publicKey, privateKey, cipher) {
  const { p } = publicKey;
  const s = modPow(cipher.c1, privateKey, p);
  const sInv = modInverse(s, p);

  return (cipher.c2 * sInv) % p;
}

function textToNumbers(text) {
  return Array.from(text).map((character) => character.charCodeAt(0));
}

function numbersToText(numbers) {
  return numbers.map((number) => String.fromCharCode(number)).join('');
}

function encryptText(publicKey, plaintext) {
  return textToNumbers(plaintext).map((number) => encrypt(publicKey, number));
}

function decryptText(publicKey, privateKey, cipherList) {
  return numbersToText(cipherList.map((cipher) => decrypt(publicKey, privateKey, cipher)));
}

function formatPublicKey(publicKey) {
  if (!publicKey) return '-';
  return `(${publicKey.p}, ${publicKey.g}, ${publicKey.y})`;
}

function formatCipher(cipherList) {
  if (!cipherList.length) return '-';
  return cipherList.map(({ c1, c2 }) => `(${c1}, ${c2})`).join(', ');
}

export default function App() {
  const [publicKey, setPublicKey] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);
  const [message, setMessage] = useState('');
  const [cipherList, setCipherList] = useState([]);
  const [plainResult, setPlainResult] = useState('');
  const [notice, setNotice] = useState('Generate kunci terlebih dahulu untuk memulai.');

  const canEncrypt = publicKey && message.trim().length > 0;
  const canDecrypt = publicKey && privateKey && cipherList.length > 0;

  const asciiPreview = useMemo(() => {
    if (!message.trim()) return '-';
    return textToNumbers(message).join(', ');
  }, [message]);

  function handleGenerateKey() {
    const keys = generateKeys();
    setPublicKey(keys.publicKey);
    setPrivateKey(keys.privateKey);
    setCipherList([]);
    setPlainResult('');
    setNotice('Pasangan kunci berhasil dibuat.');
  }

  function handleEncrypt() {
    if (!publicKey) {
      setNotice('Harap generate kunci terlebih dahulu.');
      return;
    }

    if (!message.trim()) {
      setNotice('Pesan tidak boleh kosong.');
      return;
    }

    const nextCipherList = encryptText(publicKey, message.trim());
    setCipherList(nextCipherList);
    setPlainResult('');
    setNotice('Pesan berhasil dienkripsi.');
  }

  function handleDecrypt() {
    if (!canDecrypt) {
      setNotice('Belum ada pesan yang dienkripsi.');
      return;
    }

    setPlainResult(decryptText(publicKey, privateKey, cipherList));
    setNotice('Ciphertext berhasil didekripsi.');
  }

  return (
    <main className="app-shell">
      <section className="workspace" aria-label="Aplikasi kriptografi ElGamal">
        <header className="app-header">
          <div>
            <p className="eyebrow">Kriptografi klasik</p>
            <h1>ElGamal Cipher</h1>
          </div>
          <button className="primary-button" type="button" onClick={handleGenerateKey}>
            Generate Kunci
          </button>
        </header>

        <div className="notice" role="status">
          {notice}
        </div>

        <section className="panel key-panel">
          <div>
            <h2>Manajemen Kunci</h2>
            <p>Gunakan pasangan kunci publik dan privat untuk enkripsi dan dekripsi.</p>
          </div>

          <div className="key-grid">
            <div className="key-item">
              <span>Kunci Publik (p, g, y)</span>
              <strong>{formatPublicKey(publicKey)}</strong>
            </div>
            <div className="key-item">
              <span>Kunci Privat (x)</span>
              <strong>{privateKey ?? '-'}</strong>
            </div>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel">
            <div className="panel-title">
              <h2>Enkripsi Pesan</h2>
              <button type="button" onClick={handleEncrypt} disabled={!canEncrypt}>
                Enkripsi
              </button>
            </div>

            <label htmlFor="message">Pesan Asli</label>
            <textarea
              id="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Masukkan pesan..."
              rows={6}
            />

            <div className="output-box">
              <span>ASCII</span>
              <p>{asciiPreview}</p>
            </div>

            <div className="output-box">
              <span>Hasil Ciphertext</span>
              <p>{formatCipher(cipherList)}</p>
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">
              <h2>Dekripsi Pesan</h2>
              <button type="button" onClick={handleDecrypt} disabled={!canDecrypt}>
                Dekripsi
              </button>
            </div>

            <div className="result-area">
              <span>Pesan Kembali</span>
              <strong>{plainResult || '-'}</strong>
            </div>

            <div className="formula-list" aria-label="Rumus ElGamal">
              <div>
                <span>Public key</span>
                <code>y = g^x mod p</code>
              </div>
              <div>
                <span>Encrypt</span>
                <code>c1 = g^k mod p</code>
                <code>c2 = m . y^k mod p</code>
              </div>
              <div>
                <span>Decrypt</span>
                <code>m = c2 . (c1^x)^-1 mod p</code>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
