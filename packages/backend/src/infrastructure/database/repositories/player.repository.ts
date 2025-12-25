/**
 * Player Repository Implementation - Infrastructure Layer
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPlayerRepository } from '../../../domain/repositories/player.repository.interface';
import { Player, PlayerProps } from '../../../domain/entities/player.entity';
import { PlayerEntityOrm } from '../entities/player.entity.orm';

@Injectable()
export class PlayerRepository implements IPlayerRepository {
  constructor(
    @InjectRepository(PlayerEntityOrm)
    private readonly repository: Repository<PlayerEntityOrm>,
  ) {}

  async save(player: Player): Promise<Player> {
    const props = player.toObject();
    const entity = this.repository.create(props);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Player | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByPlayerId(
    projectId: string,
    playerId: string,
  ): Promise<Player | null> {
    const entity = await this.repository.findOne({
      where: { projectId, playerId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(projectId: string, email: string): Promise<Player | null> {
    const entity = await this.repository.findOne({
      where: { projectId, email },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByProjectId(projectId: string): Promise<Player[]> {
    const entities = await this.repository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async playerIdExists(projectId: string, playerId: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { projectId, playerId },
    });
    return count > 0;
  }

  async emailExists(projectId: string, email: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { projectId, email },
    });
    return count > 0;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async countByProjectId(projectId: string): Promise<number> {
    return await this.repository.count({ where: { projectId } });
  }

  private toDomain(entity: PlayerEntityOrm): Player {
    const props: PlayerProps = {
      id: entity.id,
      projectId: entity.projectId,
      playerId: entity.playerId,
      email: entity.email,
      passwordHash: entity.passwordHash,
      displayName: entity.displayName,
      metadata: entity.metadata,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
    return new Player(props);
  }
}
