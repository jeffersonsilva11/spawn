/**
 * Studio Entity - Domain Layer
 *
 * Represents a game studio (tenant) in the platform.
 * A studio can have multiple projects and users.
 * Framework-agnostic domain entity.
 */

export class Studio {
  constructor(
    public readonly id: string,
    public name: string,
    public readonly apiKey: string,
    public maxServers: number,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  /**
   * Update studio name
   */
  updateName(newName: string): void {
    this.name = newName;
    this.updatedAt = new Date();
  }

  /**
   * Update max servers limit
   */
  updateMaxServers(newLimit: number): void {
    if (newLimit < 1) {
      throw new Error('Max servers must be at least 1');
    }
    this.maxServers = newLimit;
    this.updatedAt = new Date();
  }

  /**
   * Check if studio can create more servers
   */
  canCreateServer(currentServerCount: number): boolean {
    return currentServerCount < this.maxServers;
  }

  /**
   * Verify API key
   */
  verifyApiKey(providedKey: string): boolean {
    return this.apiKey === providedKey;
  }

  /**
   * Domain validation
   */
  static validate(name: string, maxServers: number): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push('Studio name cannot be empty');
    }

    if (name.length > 100) {
      errors.push('Studio name cannot exceed 100 characters');
    }

    if (maxServers < 1) {
      errors.push('Max servers must be at least 1');
    }

    if (maxServers > 1000) {
      errors.push('Max servers cannot exceed 1000');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
