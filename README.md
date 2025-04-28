# SymmetricMorph
![npm](https://img.shields.io/npm/v/symmetricmorph)
![GitHub](https://img.shields.io/github/license/sur-ser/symmetricmorph)
![GitHub issues](https://img.shields.io/github/issues/sur-ser/symmetricmorph)

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

## ⚡ Quick Start

### Node.js (CommonJS)

```javascript
const SymmetricMorph = require('symmetricmorph').default;

const cipher = SymmetricMorph.fromPassword('MyStrongPassword');
const plain = Array.from('Hello Node!').map(c => c.charCodeAt(0));

const encrypted = cipher.encrypt(plain);
const decrypted = cipher.decrypt(encrypted);

console.log(String.fromCharCode(...decrypted)); // Hello Node!
```

### Node.js (ESM)

```typescript
import SymmetricMorph from 'symmetricmorph';

const cipher = SymmetricMorph.fromPassword('MyStrongPassword');
const plain = Array.from('Hello Node ESM!').map(c => c.charCodeAt(0));

const encrypted = cipher.encrypt(plain);
const decrypted = cipher.decrypt(encrypted);

console.log(String.fromCharCode(...decrypted)); // Hello Node ESM!
```

---

## 🌐 Browser Usage

### Browser (UMD build)

```html
<script src="symmetricmorph.umd.js"></script>
<script>
  const cipher = SymmetricMorph.fromPassword('BrowserPassword');
  const plain = Array.from('Hello Browser!').map(c => c.charCodeAt(0));

  const encrypted = cipher.encrypt(plain);
  const decrypted = cipher.decrypt(encrypted);

  console.log(String.fromCharCode(...decrypted)); // Hello Browser!
</script>
```

### Browser (ESM build)

```html
<script type="module">
  import SymmetricMorph from './dist/symmetricmorph.es.js';

  const cipher = SymmetricMorph.fromPassword('BrowserESM');
  const plain = Array.from('Hello ESM!').map(c => c.charCodeAt(0));

  const encrypted = cipher.encrypt(plain);
  const decrypted = cipher.decrypt(encrypted);

  console.log(String.fromCharCode(...decrypted));
</script>
```

---

## 🧠 Background Encryption with Web Workers

Encrypt large files in a Web Worker without blocking the main UI:

```html
<script>
  const worker = new Worker('./worker/symmetricmorph-worker.js');

  worker.postMessage({ type: 'init', password: 'WorkerPassword123' });

  worker.onmessage = (event) => {
    const { type, encrypted, decrypted } = event.data;

    if (type === 'ready') {
      const plainText = 'Encrypt large data easily!';
      const plainBytes = Array.from(plainText).map(c => c.charCodeAt(0));

      worker.postMessage({ type: 'encrypt', data: plainBytes });
    }

    if (type === 'encrypted') {
      console.log('Encrypted:', encrypted);
      worker.postMessage({ type: 'decrypt', data: encrypted });
    }

    if (type === 'decrypted') {
      console.log('Decrypted:', String.fromCharCode(...decrypted));
    }
  };
</script>
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
| `SymmetricMorph.fromPassword(password: string, iterations?: number, keyLength?: number)` | Creates a cipher instance from a password. |
| `SymmetricMorph.fromKey(key: number[])` | Creates a cipher instance from a raw key. |
| `SymmetricMorph.generateKey(length?: number)` | Generates a secure random key. |
| `cipher.encrypt(plainBytes: number[])` | Encrypts an array of bytes. |
| `cipher.decrypt(encryptedBytes: number[])` | Decrypts an array of bytes and verifies integrity. |
| `cipher.encryptChunks(chunks: number[][])` | Encrypts multiple data chunks. |
| `cipher.decryptChunks(chunks: number[][])` | Decrypts multiple data chunks. |

---

## 📄 License

MIT License  
Copyright (c) 2025
