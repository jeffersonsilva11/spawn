/**
 * Players Controller - HTTP Interface Layer
 *
 * Handles HTTP requests for player management
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  RegisterPlayerUseCase,
  LoginPlayerUseCase,
  SavePlayerDataUseCase,
  LoadPlayerDataUseCase,
} from '../../../application/use-cases';
import { ApiKeyAuthGuard } from '../guards/api-key-auth.guard';

@Controller('players')
@UseGuards(ApiKeyAuthGuard)
export class PlayersController {
  constructor(
    private readonly registerPlayerUseCase: RegisterPlayerUseCase,
    private readonly loginPlayerUseCase: LoginPlayerUseCase,
    private readonly savePlayerDataUseCase: SavePlayerDataUseCase,
    private readonly loadPlayerDataUseCase: LoadPlayerDataUseCase,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new player
   * POST /players/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body()
    body: {
      projectId: string;
      playerId: string;
      email?: string;
      password?: string;
      displayName?: string;
    },
  ) {
    const result = await this.registerPlayerUseCase.execute({
      projectId: body.projectId,
      playerId: body.playerId,
      email: body.email,
      password: body.password,
      displayName: body.displayName,
    });

    return {
      success: true,
      player: {
        id: result.id,
        playerId: result.playerId,
      },
      message: result.message,
    };
  }

  /**
   * Login a player
   * POST /players/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body()
    body: {
      projectId: string;
      playerId?: string;
      email?: string;
      password: string;
    },
  ) {
    const result = await this.loginPlayerUseCase.execute({
      projectId: body.projectId,
      playerId: body.playerId,
      email: body.email,
      password: body.password,
    });

    // Generate JWT token for player
    const accessToken = this.jwtService.sign({
      playerId: result.id,
      projectId: body.projectId,
      type: 'player',
    });

    return {
      success: true,
      player: {
        id: result.id,
        playerId: result.playerId,
        displayName: result.displayName,
      },
      accessToken,
      message: result.message,
    };
  }

  /**
   * Save player data (key-value)
   * POST /players/:playerId/data
   */
  @Post(':playerId/data')
  @HttpCode(HttpStatus.OK)
  async saveData(
    @Param('playerId') playerId: string,
    @Body() body: { key: string; value: any },
  ) {
    const result = await this.savePlayerDataUseCase.execute({
      playerId,
      key: body.key,
      value: body.value,
    });

    return {
      success: true,
      data: {
        key: result.key,
        value: result.value,
      },
      message: result.message,
    };
  }

  /**
   * Load player data (key-value)
   * GET /players/:playerId/data
   * GET /players/:playerId/data/:key
   */
  @Get(':playerId/data/:key?')
  @HttpCode(HttpStatus.OK)
  async loadData(
    @Param('playerId') playerId: string,
    @Param('key') key?: string,
  ) {
    const result = await this.loadPlayerDataUseCase.execute({
      playerId,
      key,
    });

    return {
      success: true,
      data: result.data,
      message: result.message,
    };
  }
}
