/**
 * Leaderboard Repository Implementation - Infrastructure Layer
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ILeaderboardRepository } from '../../../domain/repositories/leaderboard.repository.interface';
import {
  Leaderboard,
  LeaderboardProps,
} from '../../../domain/entities/leaderboard.entity';
import { LeaderboardEntityOrm } from '../entities/leaderboard.entity.orm';

@Injectable()
export class LeaderboardRepository implements ILeaderboardRepository {
  constructor(
    @InjectRepository(LeaderboardEntityOrm)
    private readonly repository: Repository<LeaderboardEntityOrm>,
  ) {}

  async save(entry: Leaderboard): Promise<Leaderboard> {
    const props = entry.toObject();
    const entity = this.repository.create({
      ...props,
      score: Number(props.score), // Ensure number type for decimal column
    });
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Leaderboard | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByPlayerAndLeaderboard(
    projectId: string,
    leaderboardName: string,
    playerId: string,
  ): Promise<Leaderboard | null> {
    const entity = await this.repository.findOne({
      where: { projectId, leaderboardName, playerId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async getTopEntries(
    projectId: string,
    leaderboardName: string,
    limit: number,
  ): Promise<Leaderboard[]> {
    const entities = await this.repository.find({
      where: { projectId, leaderboardName },
      order: { score: 'DESC' },
      take: limit,
    });
    return entities.map((e) => this.toDomain(e));
  }

  async getPlayerRank(
    projectId: string,
    leaderboardName: string,
    playerId: string,
  ): Promise<number | null> {
    const playerEntry = await this.findByPlayerAndLeaderboard(
      projectId,
      leaderboardName,
      playerId,
    );

    if (!playerEntry) {
      return null;
    }

    const rank = await this.repository
      .createQueryBuilder('leaderboard')
      .where('leaderboard.project_id = :projectId', { projectId })
      .andWhere('leaderboard.leaderboard_name = :leaderboardName', {
        leaderboardName,
      })
      .andWhere('leaderboard.score > :score', { score: playerEntry.score })
      .getCount();

    return rank + 1; // Rank is 1-based
  }

  async findByPlayerId(playerId: string): Promise<Leaderboard[]> {
    const entities = await this.repository.find({
      where: { playerId },
      order: { score: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async getLeaderboardNames(projectId: string): Promise<string[]> {
    const result = await this.repository
      .createQueryBuilder('leaderboard')
      .select('DISTINCT leaderboard.leaderboard_name', 'leaderboardName')
      .where('leaderboard.project_id = :projectId', { projectId })
      .getRawMany();

    return result.map((r) => r.leaderboardName);
  }

  async countByLeaderboard(
    projectId: string,
    leaderboardName: string,
  ): Promise<number> {
    return await this.repository.count({
      where: { projectId, leaderboardName },
    });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByPlayerId(playerId: string): Promise<void> {
    await this.repository.delete({ playerId });
  }

  async deleteByLeaderboardName(
    projectId: string,
    leaderboardName: string,
  ): Promise<void> {
    await this.repository.delete({ projectId, leaderboardName });
  }

  private toDomain(entity: LeaderboardEntityOrm): Leaderboard {
    const props: LeaderboardProps = {
      id: entity.id,
      projectId: entity.projectId,
      leaderboardName: entity.leaderboardName,
      playerId: entity.playerId,
      score: Number(entity.score),
      metadata: entity.metadata,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
    return new Leaderboard(props);
  }
}
