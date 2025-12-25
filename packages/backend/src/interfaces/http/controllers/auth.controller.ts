/**
 * Auth Controller - Interface Layer
 *
 * Handles authentication endpoints (register, login).
 */

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterStudioUseCase, LoginUseCase } from '../../../application/use-cases';
import { RegisterDto, LoginDto } from '../../../application/dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerStudioUseCase: RegisterStudioUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    const result = await this.registerStudioUseCase.execute({
      email: dto.email,
      password: dto.password,
      studioName: dto.studioName,
    });

    // Generate JWT token
    const accessToken = this.jwtService.sign({
      sub: result.userId,
      email: result.email,
      studioId: result.studioId,
    });

    return {
      user: {
        id: result.userId,
        email: result.email,
      },
      studio: {
        id: result.studioId,
        name: result.studioName,
        apiKey: result.apiKey,
      },
      accessToken,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const result = await this.loginUseCase.execute({
      email: dto.email,
      password: dto.password,
    });

    // Generate JWT token
    const accessToken = this.jwtService.sign({
      sub: result.userId,
      email: result.email,
      studioId: result.studioId,
    });

    return {
      user: {
        id: result.userId,
        email: result.email,
      },
      studioId: result.studioId,
      accessToken,
    };
  }
}
