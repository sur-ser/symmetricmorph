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
