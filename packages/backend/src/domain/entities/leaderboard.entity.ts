/**
 * Leaderboard Entity - Domain Layer
 *
 * Represents a leaderboard entry with player score
 */

export interface LeaderboardProps {
  id: string;
  projectId: string;
  leaderboardName: string; // e.g., "global_score", "weekly_wins", "level_1_time"
  playerId: string;
  score: number;
  metadata: Record<string, any>; // Additional data like rank, player name, etc.
  createdAt: Date;
  updatedAt: Date;
}

export class Leaderboard {
  private props: LeaderboardProps;

  constructor(props: LeaderboardProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get projectId(): string {
    return this.props.projectId;
  }

  get leaderboardName(): string {
    return this.props.leaderboardName;
  }

  get playerId(): string {
    return this.props.playerId;
  }

  get score(): number {
    return this.props.score;
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
   * Update the score
   */
  updateScore(newScore: number): void {
    this.props.score = newScore;
    this.props.updatedAt = new Date();
  }

  /**
   * Update metadata
   */
  updateMetadata(metadata: Record<string, any>): void {
    this.props.metadata = { ...this.props.metadata, ...metadata };
    this.props.updatedAt = new Date();
  }

  /**
   * Check if entry belongs to a specific project
   */
  belongsToProject(projectId: string): boolean {
    return this.props.projectId === projectId;
  }

  /**
   * Check if entry belongs to a specific player
   */
  belongsToPlayer(playerId: string): boolean {
    return this.props.playerId === playerId;
  }

  /**
   * Convert to plain object for persistence
   */
  toObject(): LeaderboardProps {
    return { ...this.props };
  }

  /**
   * Create a new Leaderboard entry
   */
  static create(
    id: string,
    projectId: string,
    leaderboardName: string,
    playerId: string,
    score: number,
    metadata: Record<string, any> = {},
  ): Leaderboard {
    return new Leaderboard({
      id,
      projectId,
      leaderboardName,
      playerId,
      score,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
