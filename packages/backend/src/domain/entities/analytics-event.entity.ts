/**
 * AnalyticsEvent Entity - Domain Layer
 *
 * Represents an analytics event tracked from the game
 */

export interface AnalyticsEventProps {
  id: string;
  projectId: string;
  playerId?: string; // Optional - can track anonymous events
  eventName: string;
  eventData: Record<string, any>; // Custom event parameters
  timestamp: Date;
}

export class AnalyticsEvent {
  private props: AnalyticsEventProps;

  constructor(props: AnalyticsEventProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get projectId(): string {
    return this.props.projectId;
  }

  get playerId(): string | undefined {
    return this.props.playerId;
  }

  get eventName(): string {
    return this.props.eventName;
  }

  get eventData(): Record<string, any> {
    return this.props.eventData;
  }

  get timestamp(): Date {
    return this.props.timestamp;
  }

  /**
   * Check if event belongs to a specific project
   */
  belongsToProject(projectId: string): boolean {
    return this.props.projectId === projectId;
  }

  /**
   * Check if event was triggered by a specific player
   */
  isFromPlayer(playerId: string): boolean {
    return this.props.playerId === playerId;
  }

  /**
   * Convert to plain object for persistence
   */
  toObject(): AnalyticsEventProps {
    return { ...this.props };
  }

  /**
   * Create a new AnalyticsEvent
   */
  static create(
    id: string,
    projectId: string,
    eventName: string,
    eventData: Record<string, any>,
    playerId?: string,
  ): AnalyticsEvent {
    return new AnalyticsEvent({
      id,
      projectId,
      playerId,
      eventName,
      eventData,
      timestamp: new Date(),
    });
  }
}
