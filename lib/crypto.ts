import crypto from 'crypto';

/**
 * FindIt Campus Cryptographic Security Engine
 * Implements:
 * 1. PBKDF2-HMAC-SHA512 password hashing with cryptographically secure random salt
 * 2. AES-256-GCM authenticated encryption for private user data (Phone, Student ID, Private Clues)
 * 3. Timing-safe password verification
 * 4. Masking utilities for safe public projection
 */

const DEFAULT_ITERATIONS = 100000;
const KEY_LENGTH = 64; // 512 bits
const DIGEST = 'sha512';

// 256-bit encryption key derived or configured from environment
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || 'findit-campus-2026-production-grade-encryption-key-32b';
// Ensure key is 32 bytes for AES-256
const AES_KEY = crypto.createHash('sha256').update(ENCRYPTION_SECRET).digest();

export interface PasswordHashResult {
  hash: string;
  salt: string;
  iterations: number;
  algorithm: string;
}

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
  version: string;
}

/**
 * Secure password hashing using PBKDF2 with SHA-512 and random 32-byte salt
 */
export function hashPassword(password: string): PasswordHashResult {
  const salt = crypto.randomBytes(32).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(
    password,
    salt,
    DEFAULT_ITERATIONS,
    KEY_LENGTH,
    DIGEST
  );

  return {
    hash: derivedKey.toString('hex'),
    salt,
    iterations: DEFAULT_ITERATIONS,
    algorithm: 'PBKDF2-HMAC-SHA512',
  };
}

/**
 * Constant-time password verification to prevent timing attacks
 */
export function verifyPassword(
  password: string,
  storedHash: string,
  storedSalt: string,
  iterations: number = DEFAULT_ITERATIONS
): boolean {
  try {
    const derivedKey = crypto.pbkdf2Sync(
      password,
      storedSalt,
      iterations,
      KEY_LENGTH,
      DIGEST
    );
    const storedHashBuffer = Buffer.from(storedHash, 'hex');
    if (storedHashBuffer.length !== derivedKey.length) {
      return false;
    }
    return crypto.timingSafeEqual(storedHashBuffer, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Encrypt sensitive private data using AES-256-GCM with randomized 12-byte IV
 * and 16-byte authentication tag
 */
export function encryptData(plaintext: string): EncryptedPayload {
  const iv = crypto.randomBytes(12); // Recommended 96 bits for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', AES_KEY, iv);
  
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    ciphertext,
    iv: iv.toString('hex'),
    authTag,
    version: 'aes-256-gcm-v1',
  };
}

/**
 * Decrypt data and verify authentication tag to prevent tampering
 */
export function decryptData(payload: EncryptedPayload): string | null {
  try {
    const iv = Buffer.from(payload.iv, 'hex');
    const authTag = Buffer.from(payload.authTag, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', AES_KEY, iv);
    
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(payload.ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return null;
  }
}

/**
 * Generate cryptographically secure random token (e.g. for Pickup tokens or Ticket IDs)
 */
export function generateSecureToken(byteLength: number = 24): string {
  return crypto.randomBytes(byteLength).toString('hex');
}

/**
 * Hash a pickup token with SHA-256 so only the hash is stored at rest
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Safe public data maskers to avoid leaking PII on public listings
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@campus.edu';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***-***-****';
  return `(***) ***-${digits.slice(-4)}`;
}

export function maskStudentId(id: string): string {
  if (id.length <= 4) return '****';
  return `${id.slice(0, 2)}****${id.slice(-2)}`;
}
