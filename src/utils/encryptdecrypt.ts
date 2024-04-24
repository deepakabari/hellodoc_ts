import crypto from 'crypto';

const SECRET = process.env.KEY as string;
const ALGORITHM = process.env.ALGORITHM as string;
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

// Function to encrypt the ID
const encryptId = (id: string): string => {
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(id, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

// Function to decrypt the ID
const decryptId = (encryptedId: string): string => {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedId, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

export { encryptId, decryptId };
