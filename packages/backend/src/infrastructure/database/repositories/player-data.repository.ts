/**
 * PlayerData Repository Implementation - Infrastructure Layer
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPlayerDataRepository } from '../../../domain/repositories/player-data.repository.interface';
import { PlayerData, PlayerDataProps } from '../../../domain/entities/player-data.entity';
import { PlayerDataEntityOrm } from '../entities/player-data.entity.orm';

@Injectable()
export class PlayerDataRepository implements IPlayerDataRepository {
  constructor(
    @InjectRepository(PlayerDataEntityOrm)
    private readonly repository: Repository<PlayerDataEntityOrm>,
  ) {}

  async save(data: PlayerData): Promise<PlayerData> {
    const props = data.toObject();
    const entity = this.repository.create(props);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<PlayerData | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByPlayerIdAndKey(
    playerId: string,
    key: string,
  ): Promise<PlayerData | null> {
    const entity = await this.repository.findOne({
      where: { playerId, key },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByPlayerId(playerId: string): Promise<PlayerData[]> {
    const entities = await this.repository.find({
      where: { playerId },
      order: { key: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByPlayerId(playerId: string): Promise<void> {
    await this.repository.delete({ playerId });
  }

  private toDomain(entity: PlayerDataEntityOrm): PlayerData {
    const props: PlayerDataProps = {
      id: entity.id,
      playerId: entity.playerId,
      key: entity.key,
      value: entity.value,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
    return new PlayerData(props);
  }
}
