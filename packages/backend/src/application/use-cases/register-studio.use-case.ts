/**
 * Register Studio Use Case - Application Layer
 *
 * Business logic for registering a new studio with an admin user.
 */

import { User, Studio } from '../../domain/entities';
import {
  IUserRepository,
  IStudioRepository,
} from '../../domain/repositories';
import { IHashService } from '../../domain/interfaces';
import { v4 as uuidv4 } from 'uuid';

export interface RegisterStudioRequest {
  email: string;
  password: string;
  studioName: string;
}

export interface RegisterStudioResponse {
  userId: string;
  studioId: string;
  email: string;
  studioName: string;
  apiKey: string;
}

export class RegisterStudioUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly studioRepository: IStudioRepository,
    private readonly hashService: IHashService,
  ) {}

  async execute(request: RegisterStudioRequest): Promise<RegisterStudioResponse> {
    // Validate user input
    const userValidation = User.validate(request.email, request.password);
    if (!userValidation.valid) {
      throw new Error(userValidation.errors.join(', '));
    }

    // Validate studio input
    const studioValidation = Studio.validate(request.studioName, 10);
    if (!studioValidation.valid) {
      throw new Error(studioValidation.errors.join(', '));
    }

    // Check if email already exists
    const emailExists = await this.userRepository.emailExists(request.email);
    if (emailExists) {
      throw new Error('Email already exists');
    }

    // Generate unique API key for studio
    let apiKey = this.hashService.generateApiKey();
    let apiKeyExists = await this.studioRepository.apiKeyExists(apiKey);

    // Ensure API key is unique
    while (apiKeyExists) {
      apiKey = this.hashService.generateApiKey();
      apiKeyExists = await this.studioRepository.apiKeyExists(apiKey);
    }

    // Create studio
    const studio = new Studio(
      uuidv4(),
      request.studioName,
      apiKey,
      10, // Default max servers
      new Date(),
      new Date(),
    );

    const createdStudio = await this.studioRepository.create(studio);

    // Hash password
    const passwordHash = await this.hashService.hash(request.password);

    // Create admin user
    const user = new User(
      uuidv4(),
      request.email,
      passwordHash,
      createdStudio.id,
      new Date(),
      new Date(),
    );

    const createdUser = await this.userRepository.create(user);

    return {
      userId: createdUser.id,
      studioId: createdStudio.id,
      email: createdUser.email,
      studioName: createdStudio.name,
      apiKey: createdStudio.apiKey,
    };
  }
}
