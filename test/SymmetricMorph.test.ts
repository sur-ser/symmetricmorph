import { describe, it, expect, test } from 'vitest';
import SymmetricMorph from '../src/SymmetricMorph';

describe('SymmetricMorph', () => {
    const toBytes = (str: string) => Array.from(str).map(c => c.charCodeAt(0));
    const toString = (bytes: number[]) => String.fromCharCode(...bytes);

    it('should encrypt and decrypt simple string correctly', () => {
        const cipher = SymmetricMorph.fromPassword('StrongPassword123');
        const text = 'Hello, SymmetricMorph!';
        const plainBytes = toBytes(text);

        const encrypted = cipher.encrypt(plainBytes);
        const decrypted = cipher.decrypt(encrypted);

        expect(toString(decrypted)).toBe(text);
    });

    it('should fail decryption if ciphertext is tampered', () => {
        const cipher = SymmetricMorph.fromPassword('AnotherPassword!');
        const text = 'Protect this message!';
        const plainBytes = toBytes(text);

        const encrypted = cipher.encrypt(plainBytes);
        encrypted[20] ^= 0xFF; // Corrupt a random byte

        expect(() => cipher.decrypt(encrypted)).toThrow('MAC verification failed');
    });

    it('should encrypt and decrypt large random data correctly', () => {
        const cipher = SymmetricMorph.fromPassword('LargeDataPassword');
        const plainBytes = Array.from({ length: 100_000 }, () => Math.floor(Math.random() * 256));

        const encrypted = cipher.encrypt(plainBytes);
        const decrypted = cipher.decrypt(encrypted);

        expect(decrypted).toEqual(plainBytes);
    });

    it('should work with chunked encryption and decryption', () => {
        const cipher = SymmetricMorph.fromPassword('ChunkedPassword');
        const chunks = [
            toBytes('First chunk of data.'),
            toBytes('Second chunk goes here.'),
            toBytes('Third and final chunk!')
        ];

        const encryptedChunks = cipher.encryptChunks(chunks);
        const decryptedChunks = cipher.decryptChunks(encryptedChunks);

        decryptedChunks.forEach((chunk, index) => {
            expect(toString(chunk)).toBe(toString(chunks[index]));
        });
    });

    it('should generate a key of specified length', () => {
        const key = SymmetricMorph.generateKey(128);
        expect(key.length).toBe(128);
        key.forEach(byte => {
            expect(byte).toBeGreaterThanOrEqual(0);
            expect(byte).toBeLessThanOrEqual(255);
        });
    });

    it('should encrypt and decrypt empty data correctly', () => {
        const cipher = SymmetricMorph.fromPassword('EmptyPassword');
        const plainBytes: number[] = [];

        const encrypted = cipher.encrypt(plainBytes);
        const decrypted = cipher.decrypt(encrypted);

        expect(decrypted).toEqual([]);
    });

    it('should handle very small data (1 byte)', () => {
        const cipher = SymmetricMorph.fromPassword('SmallData');
        const plainBytes = [42]; // Single byte

        const encrypted = cipher.encrypt(plainBytes);
        const decrypted = cipher.decrypt(encrypted);

        expect(decrypted).toEqual(plainBytes);
    });

    it('should produce different ciphertexts for same plaintext with different keys', () => {
        const text = 'Same plaintext';
        const plainBytes = toBytes(text);

        const cipher1 = SymmetricMorph.fromPassword('PasswordOne');
        const cipher2 = SymmetricMorph.fromPassword('PasswordTwo');

        const encrypted1 = cipher1.encrypt(plainBytes);
        const encrypted2 = cipher2.encrypt(plainBytes);

        expect(encrypted1).not.toEqual(encrypted2);
    });
});

describe('SymmetricMorph Performance', () => {
    const generateRandomBytes = (size: number) => Array.from({ length: size }, () => Math.floor(Math.random() * 256));

    it('should measure encryption and decryption speed', () => {
        const cipher = SymmetricMorph.fromPassword('PerformanceTestPassword');
        const dataSizeBytes = 10 * 1024 * 1024; // 10 MB
        const plainBytes = generateRandomBytes(dataSizeBytes);

        console.log(`Testing encryption of ${dataSizeBytes / (1024 * 1024)} MB...`);

        const encryptStart = performance.now();
        const encrypted = cipher.encrypt(plainBytes);
        const encryptEnd = performance.now();
        const encryptTime = (encryptEnd - encryptStart) / 1000; // seconds

        console.log(`Encryption time: ${encryptTime.toFixed(3)} seconds`);
        console.log(`Encryption speed: ${(dataSizeBytes / 1024 / 1024 / encryptTime).toFixed(2)} MB/s`);

        console.log(`Testing decryption of ${encrypted.length / (1024 * 1024)} MB...`);

        const decryptStart = performance.now();
        const decrypted = cipher.decrypt(encrypted);
        const decryptEnd = performance.now();
        const decryptTime = (decryptEnd - decryptStart) / 1000; // seconds

        console.log(`Decryption time: ${decryptTime.toFixed(3)} seconds`);
        console.log(`Decryption speed: ${(encrypted.length / 1024 / 1024 / decryptTime).toFixed(2)} MB/s`);

        if (JSON.stringify(plainBytes) !== JSON.stringify(decrypted)) {
            throw new Error('Decrypted data does not match original!');
        }
    });
});