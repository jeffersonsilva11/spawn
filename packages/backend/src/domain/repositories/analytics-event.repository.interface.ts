/**
 * AnalyticsEvent Repository Interface - Domain Layer
 */

import { AnalyticsEvent } from '../entities/analytics-event.entity';

export interface IAnalyticsEventRepository {
  /**
   * Save an analytics event
   */
  save(event: AnalyticsEvent): Promise<AnalyticsEvent>;

  /**
   * Find event by ID
   */
  findById(id: string): Promise<AnalyticsEvent | null>;

  /**
   * Find events by project ID
   */
  findByProjectId(
    projectId: string,
    limit?: number,
    offset?: number,
  ): Promise<AnalyticsEvent[]>;

  /**
   * Find events by player ID
   */
  findByPlayerId(
    playerId: string,
    limit?: number,
    offset?: number,
  ): Promise<AnalyticsEvent[]>;

  /**
   * Find events by event name
   */
  findByEventName(
    projectId: string,
    eventName: string,
    limit?: number,
    offset?: number,
  ): Promise<AnalyticsEvent[]>;

  /**
   * Find events within a time range
   */
  findByTimeRange(
    projectId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AnalyticsEvent[]>;

  /**
   * Count total events for a project
   */
  countByProjectId(projectId: string): Promise<number>;

  /**
   * Count events by event name
   */
  countByEventName(projectId: string, eventName: string): Promise<number>;

  /**
   * Get unique event names for a project
   */
  getUniqueEventNames(projectId: string): Promise<string[]>;

  /**
   * Delete events older than a specific date
   */
  deleteOlderThan(date: Date): Promise<void>;
}
