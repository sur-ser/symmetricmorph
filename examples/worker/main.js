const worker = new Worker('./symmetricmorph-worker.js');

worker.postMessage({ type: 'init', password: 'StrongPassword123' });

worker.onmessage = (event) => {
  const { type, encrypted, decrypted } = event.data;

  if (type === 'ready') {
    console.log('Worker ready! Encrypting now...');
    const plainText = 'This is a big secret message!';
    const plainBytes = Array.from(plainText).map(c => c.charCodeAt(0));

    worker.postMessage({ type: 'encrypt', data: plainBytes });
  }

  if (type === 'encrypted') {
    console.log('Encrypted data:', encrypted);

    worker.postMessage({ type: 'decrypt', data: encrypted });
  }

  if (type === 'decrypted') {
    console.log('Decrypted data:', String.fromCharCode(...decrypted));
  }

  if (type === 'error') {
    console.error('Worker error:', event.data.message);
  }
};
