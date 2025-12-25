/**
 * User Repository Interface - Domain Layer
 *
 * Defines the contract for user persistence.
 * Infrastructure layer implements this interface.
 */

import { User } from '../entities';

export interface IUserRepository {
  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find all users in a studio
   */
  findByStudioId(studioId: string): Promise<User[]>;

  /**
   * Create a new user
   */
  create(user: User): Promise<User>;

  /**
   * Update an existing user
   */
  update(user: User): Promise<User>;

  /**
   * Delete a user
   */
  delete(id: string): Promise<void>;

  /**
   * Check if email exists
   */
  emailExists(email: string): Promise<boolean>;
}
