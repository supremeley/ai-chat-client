import CryptoJS from 'crypto-js';

interface UserData {
  username: string;
  createTime: string;
}

export function encrypt(data: UserData): string {
  const ciphertext: string = CryptoJS.AES.encrypt(JSON.stringify(data), 'secret key').toString();

  return ciphertext;
}

export function decrypt(str: string): UserData {
  const bytes = CryptoJS.AES.decrypt(str, 'secret key');

  const decryptedData: UserData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

  return decryptedData;
}
