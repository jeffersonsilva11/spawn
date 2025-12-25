/**
 * Project Entity - Domain Layer
 *
 * Represents a game project within a studio.
 * A project can have multiple builds and server instances.
 * Framework-agnostic domain entity.
 */

export class Project {
  constructor(
    public readonly id: string,
    public readonly studioId: string,
    public name: string,
    public description: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  /**
   * Update project details
   */
  updateDetails(name: string, description: string): void {
    this.name = name;
    this.description = description;
    this.updatedAt = new Date();
  }

  /**
   * Check if project belongs to a studio
   */
  belongsToStudio(studioId: string): boolean {
    return this.studioId === studioId;
  }

  /**
   * Domain validation
   */
  static validate(name: string, description: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push('Project name cannot be empty');
    }

    if (name.length > 100) {
      errors.push('Project name cannot exceed 100 characters');
    }

    if (description.length > 500) {
      errors.push('Project description cannot exceed 500 characters');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
