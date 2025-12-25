/**
 * Studio Repository Interface - Domain Layer
 */

import { Studio } from '../entities';

export interface IStudioRepository {
  findById(id: string): Promise<Studio | null>;
  findByApiKey(apiKey: string): Promise<Studio | null>;
  create(studio: Studio): Promise<Studio>;
  update(studio: Studio): Promise<Studio>;
  delete(id: string): Promise<void>;
  apiKeyExists(apiKey: string): Promise<boolean>;
}
