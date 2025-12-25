/**
 * API Key Strategy - Interface Layer
 *
 * Custom Passport strategy for API key authentication (Unity SDK).
 */

import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { IStudioRepository } from '../../../domain/repositories';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor(
    @Inject('IStudioRepository')
    private readonly studioRepository: IStudioRepository,
  ) {
    super();
  }

  async validate(req: Request): Promise<any> {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedException('API key is missing');
    }

    const studio = await this.studioRepository.findByApiKey(apiKey);

    if (!studio) {
      throw new UnauthorizedException('Invalid API key');
    }

    return {
      studioId: studio.id,
      studioName: studio.name,
    };
  }
}
