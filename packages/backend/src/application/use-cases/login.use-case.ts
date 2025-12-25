/**
 * Login Use Case - Application Layer
 *
 * Business logic for user authentication.
 */

import { IUserRepository } from '../../domain/repositories';
import { IHashService } from '../../domain/interfaces';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  email: string;
  studioId: string;
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: IHashService,
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    // Find user by email
    const user = await this.userRepository.findByEmail(request.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.hashService.compare(
      request.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return {
      userId: user.id,
      email: user.email,
      studioId: user.studioId,
    };
  }
}
