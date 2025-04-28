# SymmetricMorph
![npm](https://img.shields.io/npm/v/symmetricmorph)
![GitHub](https://img.shields.io/github/license/sur-ser/symmetricmorph)
![GitHub issues](https://img.shields.io/github/issues/sur-ser/symmetricmorph)
[![Symmorph CLI](https://img.shields.io/badge/CLI-Available-green)](https://github.com/sur-ser/symmorph-cli)


Unique symmetric stream cipher with dynamic masking, cascading feedback, chunked streaming support, and internal MAC.

**SymmetricMorph** is a lightweight, dependency-free encryption library that provides:

- High entropy stream output
- Cascading feedback structure
- Dynamic masking against known-plaintext attacks
- Built-in MAC for integrity verification
- Chunked encryption for large data streams
- Works in **Node.js**, **browsers**, and **Web Workers**
- Written in **TypeScript**, zero external dependencies

---

## 🚀 Universal Compatibility

SymmetricMorph is designed to work seamlessly across a wide range of JavaScript environments:

✅ Node.js (`require` and `import`)  
✅ Browsers via `<script>` (UMD)  
✅ Browsers via `import` (ESM)  
✅ Web Workers (background encryption)  
✅ Full TypeScript type support  
✅ No external dependencies  
✅ Efficient for large file encryption

Perfect for:

- Node.js servers
- Web applications
- Mobile browsers
- Desktop Electron apps
- Progressive Web Apps (PWA)
- Background data encryption with Web Workers
- Embedded JavaScript runtimes (e.g., Deno)

---

## 📦 Installation

```bash
npm install symmetricmorph
```

or

```bash
yarn add symmetricmorph
```

---

## 🌐 CDN Usage (Optional)
You can also load SymmetricMorph directly from a CDN without installing:

**Using** unpkg:
```html
<script src="https://unpkg.com/symmetricmorph/dist/browser/symmetricmorph.umd.js"></script>
```
Or **using** jsDelivr:
```html
<script src="https://cdn.jsdelivr.net/npm/symmetricmorph/dist/browser/symmetricmorph.umd.js"></script>
```
Then use it via global SymmetricMorph object in your scripts.


---

## ⚡ Quick Start

"**Important**: Always save the salt after encryption. It's required for correct decryption."

### Node.js (CommonJS)

```javascript
const SymmetricMorph = require('symmetricmorph').default;

// Step 1: Encrypt
const cipherEnc = SymmetricMorph.fromPassword('MyStrongPassword');
const salt = cipherEnc.getSalt();
const plain = new Uint8Array(Array.from('Hello Node!').map(c => c.charCodeAt(0)));
const encrypted = cipherEnc.encrypt(plain);

// Step 2: Decrypt using the saved salt
const cipherDec = SymmetricMorph.fromPasswordWithSalt('MyStrongPassword', salt);
const decrypted = cipherDec.decrypt(encrypted);

console.log(String.fromCharCode(...decrypted)); // Hello Node!

```

### Node.js (ESM)

```typescript
import SymmetricMorph from 'symmetricmorph';

// Step 1: Encrypt
const cipherEnc = SymmetricMorph.fromPassword('MyStrongPassword');
const salt = cipherEnc.getSalt();
const plain = new Uint8Array(Array.from('Hello Node ESM!').map(c => c.charCodeAt(0)));
const encrypted = cipherEnc.encrypt(plain);

// Step 2: Decrypt using the saved salt
const cipherDec = SymmetricMorph.fromPasswordWithSalt('MyStrongPassword', salt);
const decrypted = cipherDec.decrypt(encrypted);

console.log(String.fromCharCode(...decrypted)); // Hello Node ESM!

```

---

## 🌐 Browser Usage

### Browser (UMD build)

```html
<script src="symmetricmorph.umd.js"></script>
<script>
    // Step 1: Encrypt
    const cipherEnc = SymmetricMorph.fromPassword('MyStrongPassword');
    const salt = cipherEnc.getSalt();
    const plain = new Uint8Array(Array.from('Hello Browser!').map(c => c.charCodeAt(0)));
    const encrypted = cipherEnc.encrypt(plain);

    // Step 2: Decrypt using the saved salt
    const cipherDec = SymmetricMorph.fromPasswordWithSalt('MyStrongPassword', salt);
    const decrypted = cipherDec.decrypt(encrypted);

    console.log(String.fromCharCode(...decrypted)); // Hello Browser!
</script>
```

### Browser (ESM build)

```html
<script type="module">
  import SymmetricMorph from './symmetricmorph.es.js';

  // Step 1: Encrypt
  const cipherEnc = SymmetricMorph.fromPassword('Secret123');
  const salt = cipherEnc.getSalt();
  const plain = new Uint8Array(Array.from('Hello Browser!').map(c => c.charCodeAt(0)));
  const encrypted = cipherEnc.encrypt(plain);

  // Step 2: Decrypt using the saved salt
  const cipherDec = SymmetricMorph.fromPasswordWithSalt('Secret123', salt);
  const decrypted = cipherDec.decrypt(encrypted);

  console.log(String.fromCharCode(...decrypted)); // Hello Browser!
</script>
```

---

## 🧠 Background Encryption with Web Workers

Encrypt large files in a Web Worker without blocking the main UI:

```html
<script>
    const worker = new Worker('./symmetricmorph-worker.js');

    let savedSalt = null;
    let encryptedData = null;

    worker.postMessage({ type: 'init', password: 'StrongPassword123' });

    worker.onmessage = (event) => {
        const { type, encrypted, decrypted, salt } = event.data;

        if (type === 'ready') {
            console.log('Worker ready! Encrypting now...');
            const plainText = 'This is a big secret message!';
            const plainBytes = new Uint8Array(Array.from(plainText).map(c => c.charCodeAt(0)));

            worker.postMessage({ type: 'encrypt', data: plainBytes });
        }

        if (type === 'encrypted') {
            console.log('Encrypted data:', encrypted);
            encryptedData = encrypted;
            savedSalt = event.data.salt;

            worker.postMessage({ type: 'decrypt', data: encryptedData, salt: savedSalt });
        }

        if (type === 'decrypted') {
            console.log('Decrypted data:', String.fromCharCode(...decrypted));
        }

        if (type === 'error') {
            console.error('Worker error:', event.data.message);
        }
    };
</script>
```
**and in `symmetricmorph-worker.js`:**

```javascript
importScripts('../../../dist/browser/symmetricmorph.umd.js');

let cipher = null;
let currentPassword = null;
let currentSalt = null;

self.addEventListener('message', (event) => {
  const { type, password, data, salt } = event.data;

  if (type === 'init') {
    currentPassword = password;
    cipher = SymmetricMorph.fromPassword(currentPassword);
    currentSalt = cipher.getSalt();
    postMessage({ type: 'ready' });
  } else if (type === 'encrypt' && cipher) {
    const encrypted = cipher.encrypt(data);
    postMessage({ type: 'encrypted', encrypted, salt: currentSalt });
  } else if (type === 'decrypt' && data && salt) {
    const decryptCipher = SymmetricMorph.fromPasswordWithSalt(currentPassword, salt);
    const decrypted = decryptCipher.decrypt(data);
    postMessage({ type: 'decrypted', decrypted });
  } else {
    postMessage({ type: 'error', message: 'Invalid operation' });
  }
});
```

---

## 🧩 Advanced Features

### Chunked Encryption (Stream API)

Encrypt and decrypt multiple chunks of data independently:

```typescript
import SymmetricMorph from 'symmetricmorph';

const cipher = SymmetricMorph.fromPassword('ChunkyPassword');
const chunks = [
  Array.from('First chunk').map(c => c.charCodeAt(0)),
  Array.from('Second chunk').map(c => c.charCodeAt(0)),
  Array.from('Third chunk').map(c => c.charCodeAt(0))
];

const encryptedChunks = cipher.encryptChunks(chunks);
const decryptedChunks = cipher.decryptChunks(encryptedChunks);

console.log(decryptedChunks.map(chunk => String.fromCharCode(...chunk)).join(' '));
```

### Random Key Generation

```typescript
import SymmetricMorph from 'symmetricmorph';

const randomKey = SymmetricMorph.generateKey(64);
const cipher = SymmetricMorph.fromKey(randomKey);

const message = Array.from('Random key encryption!').map(c => c.charCodeAt(0));
const encrypted = cipher.encrypt(message);
const decrypted = cipher.decrypt(encrypted);

console.log(String.fromCharCode(...decrypted)); // Random key encryption!
```

---

## 📚 API Reference

| Method | Description |
|:---|:---|
| `SymmetricMorph.fromPassword(password: string, iterations?: number, keyLength?: number)` | Creates a cipher instance from a password and generates a random salt. |
| `SymmetricMorph.fromPasswordWithSalt(password: string, salt: Uint8Array \| number[], iterations?: number, keyLength?: number)` | Creates a cipher instance from a password and a provided salt. |
| `SymmetricMorph.fromKey(key: Uint8Array)` | Creates a cipher instance from a raw encryption key. |
| `SymmetricMorph.generateKey(length?: number)` | Generates a secure random encryption key. |
| `cipher.getSalt()` | Returns the salt used during password-based key derivation (or `undefined` if using a raw key). |
| `cipher.encrypt(plainBytes: Uint8Array)` | Encrypts an array of bytes. |
| `cipher.decrypt(encryptedBytes: Uint8Array)` | Decrypts an array of bytes and verifies integrity. |
| `cipher.encryptChunks(chunks: Uint8Array[])` | Encrypts multiple data chunks. |
| `cipher.decryptChunks(chunks: Uint8Array[])` | Decrypts multiple data chunks. |

---

## 📦 Also Available: SymmetricMorph CLI

You can encrypt and decrypt files easily from the command line using the official **[SymmetricMorph CLI](https://www.npmjs.com/package/symmorph-cli)**.
✅ Simple usage:
✅ Supports encryption and decryption of any files
✅ Automatically handles salt and password securely
✅ Lightweight and fast

Install globally:

```bash
npm install -g symmorph-cli
```

Usage example:
```bash
# Encrypt a file
symmorph encrypt --input myfile.txt --output encrypted.bin --password "MyStrongPassword"

# Decrypt a file
symmorph decrypt --input encrypted.bin --output decrypted.txt --password "MyStrongPassword"
```
➡️ Learn more: [https://github.com/sur-ser/symmorph-cli](https://github.com/sur-ser/symmorph-cli)

---

## 📄 License

MIT License  
Copyright (c) 2025
