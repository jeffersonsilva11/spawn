/**
 * Register Player Use Case - Application Layer
 *
 * Register a new player in a project
 */

import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  IPlayerRepository,
  IProjectRepository,
} from '../../domain/repositories';
import { IHashService } from '../../domain/interfaces';
import { Player } from '../../domain/entities/player.entity';

export interface RegisterPlayerRequest {
  projectId: string;
  playerId: string; // Unique identifier from the game
  email?: string;
  password?: string;
  displayName?: string;
}

export interface RegisterPlayerResponse {
  playerId: string;
  id: string;
  message: string;
}

@Injectable()
export class RegisterPlayerUseCase {
  constructor(
    @Inject('IPlayerRepository')
    private readonly playerRepository: IPlayerRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('IHashService')
    private readonly hashService: IHashService,
  ) {}

  async execute(
    request: RegisterPlayerRequest,
  ): Promise<RegisterPlayerResponse> {
    // Verify project exists
    const project = await this.projectRepository.findById(request.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Check if playerId already exists
    const existingPlayer = await this.playerRepository.findByPlayerId(
      request.projectId,
      request.playerId,
    );

    if (existingPlayer) {
      throw new Error('Player ID already exists in this project');
    }

    // Check if email already exists (if provided)
    if (request.email) {
      const existingEmail = await this.playerRepository.findByEmail(
        request.projectId,
        request.email,
      );

      if (existingEmail) {
        throw new Error('Email already exists in this project');
      }
    }

    // Hash password if provided
    let passwordHash: string | undefined;
    if (request.password) {
      passwordHash = await this.hashService.hash(request.password);
    }

    // Create player
    const player = Player.create(
      randomUUID(),
      request.projectId,
      request.playerId,
      request.email,
      passwordHash,
      request.displayName,
    );

    // Save to repository
    await this.playerRepository.save(player);

    return {
      playerId: player.playerId,
      id: player.id,
      message: 'Player registered successfully',
    };
  }
}
