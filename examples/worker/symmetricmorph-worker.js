importScripts('../../dist/symmetricmorph.umd.js');

let cipher = null;

self.addEventListener('message', async (event) => {
  const { type, password, data } = event.data;

  if (type === 'init') {
    cipher = SymmetricMorph.fromPassword(password);
    postMessage({ type: 'ready' });
  } else if (type === 'encrypt' && cipher) {
    const encrypted = cipher.encrypt(data);
    postMessage({ type: 'encrypted', encrypted });
  } else if (type === 'decrypt' && cipher) {
    const decrypted = cipher.decrypt(data);
    postMessage({ type: 'decrypted', decrypted });
  } else {
    postMessage({ type: 'error', message: 'Invalid operation' });
  }
});
