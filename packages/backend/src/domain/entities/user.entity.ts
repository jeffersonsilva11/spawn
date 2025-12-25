/**
 * User Entity - Domain Layer
 *
 * Represents a user in the platform. Each user belongs to a Studio.
 * Framework-agnostic domain entity.
 */

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public passwordHash: string,
    public studioId: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  /**
   * Update user email
   */
  updateEmail(newEmail: string): void {
    this.email = newEmail;
    this.updatedAt = new Date();
  }

  /**
   * Update password hash
   */
  updatePassword(newPasswordHash: string): void {
    this.passwordHash = newPasswordHash;
    this.updatedAt = new Date();
  }

  /**
   * Check if user belongs to a specific studio
   */
  belongsToStudio(studioId: string): boolean {
    return this.studioId === studioId;
  }

  /**
   * Domain validation
   */
  static validate(email: string, password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }

    // Password validation
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
