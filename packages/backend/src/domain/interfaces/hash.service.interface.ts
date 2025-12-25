/**
 * Hash Service Interface - Domain Layer
 *
 * Defines the contract for password hashing.
 * Infrastructure layer implements this interface.
 */

export interface IHashService {
  /**
   * Hash a plain text password
   */
  hash(plainText: string): Promise<string>;

  /**
   * Compare plain text with hashed value
   */
  compare(plainText: string, hashed: string): Promise<boolean>;

  /**
   * Generate a random API key
   */
  generateApiKey(): string;
}
