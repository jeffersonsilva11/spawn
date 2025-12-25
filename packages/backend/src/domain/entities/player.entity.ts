/**
 * Player Entity - Domain Layer
 *
 * Represents a game player within a project
 */

export interface PlayerProps {
  id: string;
  projectId: string;
  playerId: string; // Unique identifier from the game (username, device ID, etc.)
  email?: string;
  passwordHash?: string;
  displayName?: string;
  metadata: Record<string, any>; // Custom game data
  createdAt: Date;
  updatedAt: Date;
}

export class Player {
  private props: PlayerProps;

  constructor(props: PlayerProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get projectId(): string {
    return this.props.projectId;
  }

  get playerId(): string {
    return this.props.playerId;
  }

  get email(): string | undefined {
    return this.props.email;
  }

  get displayName(): string | undefined {
    return this.props.displayName;
  }

  get metadata(): Record<string, any> {
    return this.props.metadata;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Verify password matches the stored hash
   */
  verifyPassword(hash: string): boolean {
    if (!this.props.passwordHash) {
      return false;
    }
    return this.props.passwordHash === hash;
  }

  /**
   * Update player's display name
   */
  updateDisplayName(displayName: string): void {
    this.props.displayName = displayName;
    this.props.updatedAt = new Date();
  }

  /**
   * Update player's metadata
   */
  updateMetadata(metadata: Record<string, any>): void {
    this.props.metadata = { ...this.props.metadata, ...metadata };
    this.props.updatedAt = new Date();
  }

  /**
   * Check if player belongs to a specific project
   */
  belongsToProject(projectId: string): boolean {
    return this.props.projectId === projectId;
  }

  /**
   * Convert to plain object for persistence
   */
  toObject(): PlayerProps {
    return { ...this.props };
  }

  /**
   * Create a new Player
   */
  static create(
    id: string,
    projectId: string,
    playerId: string,
    email?: string,
    passwordHash?: string,
    displayName?: string,
  ): Player {
    return new Player({
      id,
      projectId,
      playerId,
      email,
      passwordHash,
      displayName,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
