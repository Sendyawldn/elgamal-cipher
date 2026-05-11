import React, { useState } from "react";

const FORMULA_CARDS = [
  {
    title: "Bangkitkan kunci publik",
    formula: "y = g^x mod p",
    description:
      "Bob menghitung y dari parameter publik g dan kunci rahasia x.",
  },
  {
    title: "Enkripsi langkah 1",
    formula: "c1 = g^k mod p",
    description: "Alice memilih k acak untuk setiap huruf yang dikirim.",
  },
  {
    title: "Enkripsi langkah 2",
    formula: "c2 = (m × y^k) mod p",
    description: "m adalah ASCII huruf, lalu dikalikan dengan shared secret.",
  },
  {
    title: "Dekripsi",
    formula: "m = (c2 × (c1^x)^-1) mod p",
    description: "Bob membalik shared secret dengan kunci privat x.",
  },
];

const VARIABLE_CARDS = [
  {
    name: "p",
    value: "Bilangan prima modulus",
    note: "Semua operasi dihitung modulo p.",
  },
  {
    name: "g",
    value: "Parameter dasar",
    note: "Dipakai untuk membentuk kunci publik dan c1.",
  },
  {
    name: "x",
    value: "Kunci privat Bob",
    note: "Hanya Bob yang boleh tahu nilainya.",
  },
  {
    name: "y",
    value: "Kunci publik Bob",
    note: "Dikirim ke Alice untuk proses enkripsi.",
  },
  {
    name: "k",
    value: "Nonce acak per pesan",
    note: "Berubah setiap huruf agar ciphertext berbeda.",
  },
  {
    name: "m",
    value: "Nilai ASCII pesan",
    note: "Karakter diubah dulu ke angka.",
  },
];

function isPrime(num) {
  for (
    let divisor = 2, limit = Math.sqrt(num);
    divisor <= limit;
    divisor += 1
  ) {
    if (num % divisor === 0) return false;
  }

  return num > 1;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePrime(bits = 12) {
  const min = 2 ** (bits - 1);
  const max = 2 ** bits - 1;

  while (true) {
    const candidate = randomInt(min, max);
    if (isPrime(candidate)) return candidate;
  }
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

function modInverse(value, modulus) {
  let remainder = BigInt(modulus);
  let nextRemainder = BigInt(value);
  let coefficient = 0n;
  let nextCoefficient = 1n;

  while (nextRemainder !== 0n) {
    const quotient = remainder / nextRemainder;
    [remainder, nextRemainder] = [
      nextRemainder,
      remainder - quotient * nextRemainder,
    ];
    [coefficient, nextCoefficient] = [
      nextCoefficient,
      coefficient - quotient * nextCoefficient,
    ];
  }

  if (remainder !== 1n) {
    throw new Error("Invers modular tidak tersedia.");
  }

  if (coefficient < 0n) {
    coefficient += BigInt(modulus);
  }

  return Number(coefficient);
}

function formatCharacter(character) {
  return JSON.stringify(character);
}

function textToNumbers(text) {
  return Array.from(text).map((character) => character.charCodeAt(0));
}

function formatPublicKey(publicKey) {
  if (!publicKey) return "-";

  return `(${publicKey.p}, ${publicKey.g}, ${publicKey.y})`;
}

function formatCipher(cipherList) {
  if (!cipherList.length) return "-";

  return cipherList.map(({ c1, c2 }) => `(${c1}, ${c2})`).join(", ");
}

function buildEncryptionTrace(publicKey, plaintext) {
  const { p, g, y } = publicKey;
  const cipherList = [];
  const trace = [];

  Array.from(plaintext).forEach((character) => {
    const ascii = character.charCodeAt(0);
    const k = randomInt(2, p - 2);
    const c1 = modPow(g, k, p);
    const sharedSecret = modPow(y, k, p);
    const c2 = Number((BigInt(ascii) * BigInt(sharedSecret)) % BigInt(p));

    cipherList.push({ c1, c2 });
    trace.push({ character, ascii, k, c1, sharedSecret, c2 });
  });

  return { cipherList, trace };
}

function buildDecryptionTrace(publicKey, privateKey, cipherList) {
  const { p } = publicKey;
  const trace = [];
  const numbers = cipherList.map(({ c1, c2 }) => {
    const sharedSecret = modPow(c1, privateKey, p);
    const sharedInverse = modInverse(sharedSecret, p);
    const ascii = Number((BigInt(c2) * BigInt(sharedInverse)) % BigInt(p));
    const character = String.fromCharCode(ascii);

    trace.push({ c1, c2, sharedSecret, sharedInverse, ascii, character });
    return ascii;
  });

  return {
    text: numbers.map((number) => String.fromCharCode(number)).join(""),
    trace,
  };
}

function FormulaCard({ title, formula, description }) {
  return (
    <article className="formula-card">
      <span className="formula-card__label">Rumus</span>
      <h3>{title}</h3>
      <code>{formula}</code>
      <p>{description}</p>
    </article>
  );
}

function VariableCard({ name, value, note }) {
  return (
    <article className="variable-card">
      <strong>{name}</strong>
      <span>{value}</span>
      <p>{note}</p>
    </article>
  );
}

function TraceSection({ title, subtitle, items, mode }) {
  if (!items.length) return null;

  return (
    <section className="trace-panel" aria-label={title}>
      <div className="trace-panel__header">
        <div>
          <h4>{title}</h4>
          <p>{subtitle}</p>
        </div>
        <span className="trace-count">{items.length} langkah</span>
      </div>

      <div className="trace-grid">
        {items.map((item, index) => (
          <article className="trace-card" key={`${mode}-${index}`}>
            <div className="trace-card__header">
              <strong>
                {mode === "encrypt"
                  ? formatCharacter(item.character)
                  : `Cipher ${index + 1}`}
              </strong>
              <span>
                {mode === "encrypt"
                  ? `m = ${item.ascii}`
                  : `(${item.c1}, ${item.c2})`}
              </span>
            </div>

            <div className="trace-card__body">
              {mode === "encrypt" ? (
                <>
                  <code>k = {item.k}</code>
                  <code>c1 = g^k mod p = {item.c1}</code>
                  <code>s = y^k mod p = {item.sharedSecret}</code>
                  <code>c2 = (m × s) mod p = {item.c2}</code>
                </>
              ) : (
                <>
                  <code>s = c1^x mod p = {item.sharedSecret}</code>
                  <code>s^-1 mod p = {item.sharedInverse}</code>
                  <code>m = (c2 × s^-1) mod p = {item.ascii}</code>
                  <code>karakter = {formatCharacter(item.character)}</code>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [bobKeys, setBobKeys] = useState(null);
  const [bobReceivedCipher, setBobReceivedCipher] = useState(null);
  const [bobDecrypted, setBobDecrypted] = useState("");
  const [bobTrace, setBobTrace] = useState([]);

  const [alicePubKey, setAlicePubKey] = useState(null);
  const [aliceMsg, setAliceMsg] = useState("");
  const [aliceCipher, setAliceCipher] = useState(null);
  const [aliceTrace, setAliceTrace] = useState([]);

  const [notice, setNotice] = useState(
    "Generate kunci terlebih dahulu untuk memulai.",
  );

  const canEncrypt = alicePubKey && aliceMsg.trim().length > 0;
  const canDecrypt = Boolean(bobReceivedCipher && bobKeys);

  function handleGenerateKeys() {
    const p = generatePrime(12);
    const g = randomInt(2, p - 2);
    const x = randomInt(2, p - 2);
    const y = modPow(g, x, p);

    setBobKeys({ p, g, x, y });
    setAlicePubKey(null);
    setAliceCipher(null);
    setAliceTrace([]);
    setBobReceivedCipher(null);
    setBobTrace([]);
    setBobDecrypted("");
    setAliceMsg("");
    setNotice("Pasangan kunci berhasil dibuat. Bagikan kunci publik ke Alice.");
  }

  function handleSendPublicKey() {
    if (!bobKeys) return;

    setAlicePubKey({ p: bobKeys.p, g: bobKeys.g, y: bobKeys.y });
    setNotice("Kunci publik Bob sudah diterima Alice.");
  }

  function handleEncrypt() {
    if (!alicePubKey) {
      setNotice("Harap generate kunci terlebih dahulu.");
      return;
    }

    const plaintext = aliceMsg.trim();
    if (!plaintext) {
      setNotice("Pesan tidak boleh kosong.");
      return;
    }

    const { cipherList, trace } = buildEncryptionTrace(alicePubKey, plaintext);
    setAliceCipher(cipherList);
    setAliceTrace(trace);
    setBobReceivedCipher(null);
    setBobTrace([]);
    setBobDecrypted("");
    setNotice(
      "Pesan berhasil dienkripsi. Kirim ciphertext ke Bob untuk dekripsi.",
    );
  }

  function handleSendCipher() {
    if (!aliceCipher) return;

    setBobReceivedCipher(aliceCipher);
    setBobTrace([]);
    setBobDecrypted("");
    setNotice("Ciphertext sudah dikirim ke Bob.");
  }

  function handleDecrypt() {
    if (!bobReceivedCipher || !bobKeys) {
      setNotice("Belum ada pesan yang dienkripsi.");
      return;
    }

    const { text, trace } = buildDecryptionTrace(
      bobKeys,
      bobKeys.x,
      bobReceivedCipher,
    );
    setBobDecrypted(text);
    setBobTrace(trace);
    setNotice("Ciphertext berhasil didekripsi.");
  }

  return (
    <main className="chat-page">
      <section className="intro-panel">
        <div className="intro-panel__copy">
          <p className="eyebrow">Kriptografi klasik</p>
          <h1>ElGamal Cipher</h1>
          <p className="intro-copy">
            Setiap tombol di web ini sekarang menampilkan rumus dan nilai
            antara, jadi proses enkripsi dan dekripsi bisa diikuti langkah demi
            langkah.
          </p>
        </div>

        <div className="intro-panel__meta">
          <div>
            <span>Alur belajar</span>
            <strong>Bob bikin kunci, Alice enkripsi, Bob dekripsi</strong>
          </div>
          <div>
            <span>Yang ditampilkan</span>
            <strong>p, g, x, y, k, c1, c2, dan hasil ASCII</strong>
          </div>
        </div>
      </section>

      <section className="notice" role="status">
        {notice}
      </section>

      <section className="formula-grid" aria-label="Rumus utama ElGamal">
        {FORMULA_CARDS.map((card) => (
          <FormulaCard
            key={card.title}
            title={card.title}
            formula={card.formula}
            description={card.description}
          />
        ))}
      </section>

      <section className="variable-panel">
        <div className="panel-heading">
          <h2>Arti simbol</h2>
          <p>
            Bagian ini membantu membaca langkah hitung yang muncul di bawahnya.
          </p>
        </div>

        <div className="variable-grid">
          {VARIABLE_CARDS.map((variable) => (
            <VariableCard
              key={variable.name}
              name={variable.name}
              value={variable.value}
              note={variable.note}
            />
          ))}
        </div>
      </section>

      <section className="chat-demo-shell">
        <section className="chat-column chat-column--bob">
          <h2 className="chat-header">👤 Layar Penerima (Bob)</h2>

          <div className="chat-card">
            <h3>1. Buat Kunci</h3>
            <p className="chat-help-text">
              Bob membangkitkan parameter p, g, x, lalu menghitung y = g^x mod
              p.
            </p>
            <button
              className="chat-button chat-button--primary"
              type="button"
              onClick={handleGenerateKeys}
            >
              Generate Kunci Baru
            </button>

            {bobKeys && (
              <div className="key-detail">
                <p>
                  <strong>Kunci Privat (Rahasia):</strong>{" "}
                  <span className="secret-badge">x = {bobKeys.x}</span>
                </p>
                <p>
                  <strong>Kunci Publik:</strong> p={bobKeys.p}, g={bobKeys.g},
                  y={bobKeys.y}
                </p>
                <button
                  className="chat-button chat-button--action"
                  type="button"
                  onClick={handleSendPublicKey}
                >
                  Bagikan Kunci Publik ke Alice ➔
                </button>
              </div>
            )}
          </div>

          <div className="chat-card">
            <h3>4. Terima & Dekripsi Pesan</h3>
            {bobReceivedCipher ? (
              <>
                <p>
                  <strong>Pesan Masuk (Ciphertext):</strong>
                </p>
                <p className="cipher-text">{formatCipher(bobReceivedCipher)}</p>
                <button
                  className="chat-button chat-button--success"
                  type="button"
                  onClick={handleDecrypt}
                >
                  Bongkar Sandi (Dekripsi)
                </button>
                {bobDecrypted && (
                  <div className="result-box">
                    <strong>Hasil Dekripsi:</strong> {bobDecrypted}
                  </div>
                )}
                <TraceSection
                  title="Langkah dekripsi"
                  subtitle="Bob menghitung shared secret dari c1 lalu mengalikannya dengan invers modulo."
                  items={bobTrace}
                  mode="decrypt"
                />
              </>
            ) : (
              <p className="chat-help-text">
                Menunggu pesan masuk dari Alice...
              </p>
            )}
          </div>
        </section>

        <section className="chat-column chat-column--alice">
          <h2 className="chat-header">👱‍♀️ Layar Pengirim (Alice)</h2>

          <div className="chat-card">
            <h3>2. Tulis Pesan</h3>
            {alicePubKey ? (
              <>
                <p className="chat-help-text">
                  Kunci publik Bob diterima: (p={alicePubKey.p}, g=
                  {alicePubKey.g}, y={alicePubKey.y})
                </p>
                <textarea
                  className="message-input"
                  rows="3"
                  placeholder="Ketik rahasia di sini..."
                  value={aliceMsg}
                  onChange={(event) => setAliceMsg(event.target.value)}
                />
                <div className="output-strip">
                  <span>ASCII pesan</span>
                  <p>
                    {aliceMsg.trim()
                      ? textToNumbers(aliceMsg.trim()).join(", ")
                      : "-"}
                  </p>
                </div>
                <button
                  className="chat-button chat-button--primary"
                  type="button"
                  onClick={handleEncrypt}
                >
                  Enkripsi Pesan
                </button>
              </>
            ) : (
              <p className="chat-help-text">
                Menunggu Bob membagikan kunci publiknya...
              </p>
            )}
          </div>

          <div className="chat-card">
            <h3>3. Hasil Enkripsi</h3>
            {aliceCipher ? (
              <>
                <p className="cipher-text">{formatCipher(aliceCipher)}</p>
                <button
                  className="chat-button chat-button--action"
                  type="button"
                  onClick={handleSendCipher}
                >
                  Kirim Pesan Sandi ke Bob ➔
                </button>
                <TraceSection
                  title="Langkah enkripsi"
                  subtitle="Untuk setiap huruf, Alice memilih k acak lalu menghitung c1 dan c2."
                  items={aliceTrace}
                  mode="encrypt"
                />
              </>
            ) : (
              <p className="chat-help-text">Belum ada pesan yang dienkripsi.</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
