/**
 * App Module - Main NestJS Module
 *
 * Configures dependency injection and ties all layers together.
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// ORM Entities
import {
  UserOrm,
  StudioOrm,
  ProjectOrm,
  BuildOrm,
  ServerInstanceOrm,
} from './infrastructure/database/entities';

// Repositories
import {
  UserRepository,
  StudioRepository,
  ProjectRepository,
  BuildRepository,
  ServerInstanceRepository,
} from './infrastructure/database/repositories';

// Services
import { S3StorageService } from './infrastructure/storage/s3-storage.service';
import { OrchestratorClientService } from './infrastructure/orchestrator/orchestrator-client.service';
import { HashService } from './infrastructure/auth/hash.service';

// Use Cases
import {
  RegisterStudioUseCase,
  LoginUseCase,
  CreateProjectUseCase,
  UploadBuildUseCase,
  DeployServerUseCase,
  StopServerUseCase,
  UpdateHeartbeatUseCase,
  GetOrCreateServerUseCase,
} from './application/use-cases';

// Controllers
import {
  AuthController,
  ProjectsController,
  ServersController,
  SdkController,
  HealthController,
} from './interfaces/http/controllers';

// Strategies
import { JwtStrategy } from './interfaces/http/strategies/jwt.strategy';
import { ApiKeyStrategy } from './interfaces/http/strategies/api-key.strategy';

// Repository Tokens (for DI)
import {
  IUserRepository,
  IStudioRepository,
  IProjectRepository,
  IBuildRepository,
  IServerInstanceRepository,
} from './domain/repositories';
import { IStorageService, IOrchestratorService, IHashService } from './domain/interfaces';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [UserOrm, StudioOrm, ProjectOrm, BuildOrm, ServerInstanceOrm],
        synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
        logging: configService.get('DB_LOGGING') === 'true',
      }),
    }),

    TypeOrmModule.forFeature([
      UserOrm,
      StudioOrm,
      ProjectOrm,
      BuildOrm,
      ServerInstanceOrm,
    ]),

    // JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN') || '7d',
        },
      }),
    }),

    // Passport
    PassportModule,
  ],

  controllers: [
    HealthController,
    AuthController,
    ProjectsController,
    ServersController,
    SdkController,
  ],

  providers: [
    // Strategies
    JwtStrategy,
    ApiKeyStrategy,

    // Repositories
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'IStudioRepository',
      useClass: StudioRepository,
    },
    {
      provide: 'IProjectRepository',
      useClass: ProjectRepository,
    },
    {
      provide: 'IBuildRepository',
      useClass: BuildRepository,
    },
    {
      provide: 'IServerInstanceRepository',
      useClass: ServerInstanceRepository,
    },

    // Direct repository injection for use cases
    UserRepository,
    StudioRepository,
    ProjectRepository,
    BuildRepository,
    ServerInstanceRepository,

    // Services
    {
      provide: 'IStorageService',
      useClass: S3StorageService,
    },
    {
      provide: 'IOrchestratorService',
      useClass: OrchestratorClientService,
    },
    {
      provide: 'IHashService',
      useClass: HashService,
    },

    // Direct service injection
    S3StorageService,
    OrchestratorClientService,
    HashService,

    // Use Cases
    RegisterStudioUseCase,
    LoginUseCase,
    CreateProjectUseCase,
    UploadBuildUseCase,
    DeployServerUseCase,
    StopServerUseCase,
    UpdateHeartbeatUseCase,
    GetOrCreateServerUseCase,
  ],
})
export class AppModule {}
