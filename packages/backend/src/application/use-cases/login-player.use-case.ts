/**
 * Login Player Use Case - Application Layer
 *
 * Authenticate a player and return session token
 */

import { Injectable, Inject } from '@nestjs/common';
import { IPlayerRepository } from '../../domain/repositories';
import { IHashService } from '../../domain/interfaces';

export interface LoginPlayerRequest {
  projectId: string;
  playerId?: string; // Can login with playerId or email
  email?: string;
  password: string;
}

export interface LoginPlayerResponse {
  playerId: string;
  id: string;
  displayName?: string;
  message: string;
}

@Injectable()
export class LoginPlayerUseCase {
  constructor(
    @Inject('IPlayerRepository')
    private readonly playerRepository: IPlayerRepository,
    @Inject('IHashService')
    private readonly hashService: IHashService,
  ) {}

  async execute(request: LoginPlayerRequest): Promise<LoginPlayerResponse> {
    // Find player by playerId or email
    let player;

    if (request.playerId) {
      player = await this.playerRepository.findByPlayerId(
        request.projectId,
        request.playerId,
      );
    } else if (request.email) {
      player = await this.playerRepository.findByEmail(
        request.projectId,
        request.email,
      );
    } else {
      throw new Error('Either playerId or email must be provided');
    }

    if (!player) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.hashService.compare(
      request.password,
      player.passwordHash || '',
    );

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return {
      playerId: player.playerId,
      id: player.id,
      displayName: player.displayName,
      message: 'Login successful',
    };
  }
}
