
import CryptoJS from 'crypto-js';

const fileToWordArray = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
      resolve(wordArray);
    };
    reader.onerror = (err) => {
      reject(err);
    };
    reader.readAsArrayBuffer(file);
  });
};

const wordArrayToBlob = (wordArray, type) => {
  const
    l = wordArray.sigBytes,
    words = wordArray.words,
    u8_array = new Uint8Array(l);
  for (let i = 0; i < l; i++) {
    u8_array[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  return new Blob([u8_array], { type: type });
};

export const encryptFile = async (file) => {
  const key = CryptoJS.lib.WordArray.random(32).toString(); // 256-bit key
  const wordArray = await fileToWordArray(file);
  const encrypted = CryptoJS.AES.encrypt(wordArray, key).toString();
  const encryptedFileBlob = new Blob([encrypted], { type: 'application/octet-stream' });
  return { encryptedFileBlob, key };
};

export const decryptFile = async (encryptedFileBlob, key) => {
  const encryptedString = await encryptedFileBlob.text();
  const decrypted = CryptoJS.AES.decrypt(encryptedString, key);
  const decryptedBlob = wordArrayToBlob(decrypted, 'application/octet-stream');
  return decryptedBlob;
};
