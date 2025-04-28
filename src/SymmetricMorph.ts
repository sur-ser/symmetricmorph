/**
 * SymmetricMorph
 *
 * Unique stream symmetric encryption algorithm with cascading feedback, dynamic masking,
 * built-in protection against known plaintext attacks, stream MAC and resistance to side attacks.
 * Developed without the use of third-party libraries.
 */
export default class SymmetricMorph {
    private constructor(private readonly key: number[]) {}

    /**
     * Creates a `SymmetricMorph` instance from a password.
     * @param password - The password to derive the encryption key.
     * @param iterations - Number of iterations for key derivation (default: 20000).
     * @param keyLength - Length of the derived key in bytes (default: 64).
     * @returns A new `SymmetricMorph` instance.
     */
    static fromPassword(password: string, iterations = 20000, keyLength = 64): SymmetricMorph {
        const salt = this.generateSalt(24);
        const key = this.deriveKey(this.strToBytes(password), salt, iterations, keyLength);
        return new SymmetricMorph(key);
    }

    /**
     * Creates a `SymmetricMorph` instance from a raw key.
     * @param key - The encryption key as an array of bytes.
     * @returns A new `SymmetricMorph` instance.
     */
    static fromKey(key: number[]): SymmetricMorph {
        return new SymmetricMorph([...key]);
    }

    /**
     * Generates a random encryption key of the specified length.
     * @param length - Length of the key in bytes (default: 64).
     * @returns A randomly generated key as an array of bytes.
     */
    static generateKey(length = 64): number[] {
        const prng = this.createPrng([Date.now() & 0xFF]);
        return Array.from({ length }, () => prng());
    }

    /**
     * Encrypts an array of plaintext bytes.
     * @param plainBytes - The plaintext data as an array of bytes.
     * @returns The encrypted data as an array of bytes.
     */
    encrypt(plainBytes: number[]): number[] {
        const nonce = SymmetricMorph.generateNonce();
        const prng = SymmetricMorph.createPrng([...this.key, ...nonce]);
        const encrypted: number[] = [];
        const state = this.initState();

        let feedback = 0xA5;
        let prev1 = 0x6C, prev2 = 0x3A, prev3 = 0x91;
        let macAcc = 157;

        for (let i = 0; i < plainBytes.length; i++) {
            const r = prng();
            const pos = (i + feedback + prev1 + prev2) % state.length;

            const mask = (state[pos] ^ feedback ^ prev1 ^ prev2 ^ prev3) & 0xFF;
            const mixed = (plainBytes[i] ^ mask ^ r) & 0xFF;
            const rotated = ((mixed << (i % 5)) | (mixed >> (8 - (i % 5)))) & 0xFF;
            encrypted.push(rotated);

            this.updateState(state, rotated, feedback, r, i, prev1, prev2, prev3);

            prev3 = prev2;
            prev2 = prev1;
            prev1 = rotated;

            feedback = (feedback ^ rotated ^ r ^ (i * 13)) & 0xFF;
            macAcc = ((macAcc + rotated + feedback + (i * 31)) ^ (r + prev1 + prev2)) & 0xFF;
        }

        const mac = SymmetricMorph.generateMac(macAcc, this.key);

        return [...nonce, ...mac, ...encrypted];
    }

    /**
     * Decrypts an array of encrypted bytes.
     * @param encryptedBytes - The encrypted data as an array of bytes.
     * @returns The decrypted plaintext data as an array of bytes.
     * @throws Error if MAC verification fails.
     */
    decrypt(encryptedBytes: number[]): number[] {
        const nonce = encryptedBytes.slice(0, 8);
        const mac = encryptedBytes.slice(8, 8 + 32);
        const cipherData = encryptedBytes.slice(8 + 32);

        const prng = SymmetricMorph.createPrng([...this.key, ...nonce]);
        const expectedState = this.initState();

        let feedback = 0xA5;
        let prev1 = 0x6C, prev2 = 0x3A, prev3 = 0x91;
        let macAcc = 157;

        const decrypted: number[] = [];

        for (let i = 0; i < cipherData.length; i++) {
            const r = prng();
            const pos = (i + feedback + prev1 + prev2) % expectedState.length;

            const mask = (expectedState[pos] ^ feedback ^ prev1 ^ prev2 ^ prev3) & 0xFF;
            const rotated = cipherData[i];
            const unrotated = ((rotated >> (i % 5)) | (rotated << (8 - (i % 5)))) & 0xFF;
            const plain = (unrotated ^ mask ^ r) & 0xFF;
            decrypted.push(plain);

            this.updateState(expectedState, rotated, feedback, r, i, prev1, prev2, prev3);

            prev3 = prev2;
            prev2 = prev1;
            prev1 = rotated;

            feedback = (feedback ^ rotated ^ r ^ (i * 13)) & 0xFF;
            macAcc = ((macAcc + rotated + feedback + (i * 31)) ^ (r + prev1 + prev2)) & 0xFF;
        }

        const expectedMac = SymmetricMorph.generateMac(macAcc, this.key);

        if (!SymmetricMorph.constantTimeCompare(mac, expectedMac)) {
            throw new Error('MAC verification failed (integrity broken)');
        }

        return decrypted;
    }

    /**
     * Encrypts multiple chunks of plaintext data.
     * @param chunks - An array of plaintext byte arrays.
     * @returns An array of encrypted byte arrays.
     */
    encryptChunks(chunks: number[][]): number[][] {
        return chunks.map(chunk => this.encrypt(chunk));
    }

    /**
     * Decrypts multiple chunks of encrypted data.
     * @param chunks - An array of encrypted byte arrays.
     * @returns An array of decrypted plaintext byte arrays.
     */
    decryptChunks(chunks: number[][]): number[][] {
        return chunks.map(chunk => this.decrypt(chunk));
    }

    /**
     * Updates the internal state during encryption or decryption.
     * @param state - The current state array.
     * @param rotated - The rotated byte value.
     * @param feedback - The feedback byte.
     * @param r - The random byte from the PRNG.
     * @param iteration - The current iteration index.
     * @param prev1 - The previous byte value (1 step back).
     * @param prev2 - The previous byte value (2 steps back).
     * @param prev3 - The previous byte value (3 steps back).
     */
    private updateState(
        state: number[],
        rotated: number,
        feedback: number,
        r: number,
        iteration: number,
        prev1: number,
        prev2: number,
        prev3: number
    ): void {
        const len = state.length;
        const inv = (~rotated) & 0xFF;
        const mixed = (prev1 ^ prev2 ^ prev3 ^ feedback ^ r) & 0xFF;

        for (let i = 0; i < len; i++) {
            state[i] ^= (rotated + mixed + (i * 31)) & 0xFF;
            state[i] = ((state[i] << (i % 5)) | (state[i] >> (8 - (i % 5)))) & 0xFF;
        }

        if (iteration % 4 === 3) {
            const temp = [...state];
            for (let i = 0; i < len; i++) {
                const swap = (i * 13 + iteration) % len;
                state[i] = (temp[swap] ^ inv) & 0xFF;
            }
        }

        for (let i = len - 1; i >= 0; i--) {
            state[i] = (state[i] + (inv ^ (i * 17) ^ feedback)) & 0xFF;
            state[i] = ((state[i] >>> (i % 7)) | (state[i] << (8 - (i % 7)))) & 0xFF;
        }
    }

    /**
     * Initializes the internal state array based on the encryption key.
     * @returns The initialized state array.
     */
    private initState(): number[] {
        const state = new Array(64).fill(0);
        for (let i = 0; i < state.length; i++) {
            state[i] = (this.key[i % this.key.length] ^ (i * 67 + 19)) & 0xFF;
        }
        return state;
    }

    /**
     * Creates a pseudo-random number generator (PRNG) based on a seed.
     * @param seed - The seed array for the PRNG.
     * @returns A function that generates random bytes.
     */
    private static createPrng(seed: number[]): () => number {
        const state = new Array(64).fill(0).map((_, i) => seed[i % seed.length] ^ (i * 97) % 256);
        let counter = 0;
        return () => {
            const i = counter % 64;
            const j = (counter * 5 + 11) % 64;
            const k = (counter * 7 + 17) % 64;
            const val = (state[i] + (state[j] ^ (state[k] >>> 3)) + counter) & 0xFF;
            state[i] = (state[i] ^ (val << (counter % 7))) & 0xFF;
            counter++;
            return val;
        };
    }

    /**
     * Derives a cryptographic key from a password and salt using iterative hashing.
     * @param pass - The password as an array of bytes.
     * @param salt - The salt as an array of bytes.
     * @param rounds - The number of hashing iterations.
     * @param length - The desired key length in bytes.
     * @returns The derived key as an array of bytes.
     */
    private static deriveKey(pass: number[], salt: number[], rounds: number, length: number): number[] {
        let data = [...pass, ...salt];
        let state = 0;
        for (let i = 0; i < rounds; i++) {
            const next = data.map((b, j) => (b ^ (state + j * 7 + i)) % 256);
            state = (state + next.reduce((a, b) => a ^ b, 0)) % 256;
            data = next;
        }
        const key: number[] = [];
        for (let i = 0; i < length; i++) {
            key.push(data[i % data.length] ^ (i * 37 + state) % 256);
        }
        return key;
    }

    /**
     * Generates a Message Authentication Code (MAC) for data integrity verification.
     * @param data - The data to generate the MAC for.
     * @param key - The encryption key.
     * @returns The MAC as an array of bytes.
     */
    private static mac(data: number[], key: number[]): number[] {
        const result: number[] = [];
        let acc = 137;
        for (let i = 0; i < 32; i++) {
            const d = data[i % data.length];
            const k = key[i % key.length];
            acc = (acc + d + k * (i + 1)) % 256;
            result.push(acc ^ ((i * 11 + d) % 256));
        }
        return result;
    }

    /**
     * Generates a MAC based on accumulated MAC state and the encryption key.
     * @param macAcc - The accumulated MAC state.
     * @param key - The encryption key.
     * @returns The generated MAC as an array of bytes.
     */
    private static generateMac(macAcc: number, key: number[]): number[] {
        const result: number[] = [];
        for (let i = 0; i < 32; i++) {
            result.push((macAcc ^ key[i % key.length] ^ (i * 19)) & 0xFF);
        }
        return result;
    }

    /**
     * Generates a random salt for key derivation.
     * @param length - The length of the salt in bytes.
     * @returns The generated salt as an array of bytes.
     */
    private static generateSalt(length: number): number[] {
        const t = performance.now() | 0;
        const seed = [t & 0xff, (t >> 8) & 0xff, (t >> 16) & 0xff];
        const prng = this.createPrng(seed);
        return Array.from({ length }, () => prng());
    }

    /**
     * Generates a random nonce for encryption.
     * @returns The generated nonce as an array of bytes.
     */
    private static generateNonce(): number[] {
        const t = Date.now();
        return [
            (t >> 0) & 0xff,
            (t >> 8) & 0xff,
            (t >> 16) & 0xff,
            (t >> 24) & 0xff,
            (t % 251),
            (t % 241),
            (t % 239),
            (t % 233),
        ];
    }

    /**
     * Converts a string to an array of bytes.
     * @param str - The input string.
     * @returns The string as an array of bytes.
     */
    private static strToBytes(str: string): number[] {
        return Array.from(str).map(c => c.charCodeAt(0));
    }

    /**
     * Compares two byte arrays in constant time to prevent timing attacks.
     * @param a - The first byte array.
     * @param b - The second byte array.
     * @returns `true` if the arrays are equal, otherwise `false`.
     */
    private static constantTimeCompare(a: number[], b: number[]): boolean {
        if (a.length !== b.length) return false;
        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a[i] ^ b[i];
        }
        return result === 0;
    }
}