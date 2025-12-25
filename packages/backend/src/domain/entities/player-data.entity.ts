/**
 * PlayerData Entity - Domain Layer
 *
 * Key-value storage for player data (like cloud save)
 */

export interface PlayerDataProps {
  id: string;
  playerId: string;
  key: string;
  value: any; // JSON serializable value
  createdAt: Date;
  updatedAt: Date;
}

export class PlayerData {
  private props: PlayerDataProps;

  constructor(props: PlayerDataProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get playerId(): string {
    return this.props.playerId;
  }

  get key(): string {
    return this.props.key;
  }

  get value(): any {
    return this.props.value;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Update the value
   */
  updateValue(value: any): void {
    this.props.value = value;
    this.props.updatedAt = new Date();
  }

  /**
   * Check if data belongs to a specific player
   */
  belongsToPlayer(playerId: string): boolean {
    return this.props.playerId === playerId;
  }

  /**
   * Convert to plain object for persistence
   */
  toObject(): PlayerDataProps {
    return { ...this.props };
  }

  /**
   * Create new PlayerData
   */
  static create(id: string, playerId: string, key: string, value: any): PlayerData {
    return new PlayerData({
      id,
      playerId,
      key,
      value,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
