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
