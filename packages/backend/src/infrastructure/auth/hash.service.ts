/**
 * Hash Service Implementation - Infrastructure Layer
 *
 * Password hashing and API key generation using bcrypt.
 */

import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { IHashService } from '../../domain/interfaces';

@Injectable()
export class HashService implements IHashService {
  private readonly saltRounds = 10;

  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.saltRounds);
  }

  async compare(plainText: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashed);
  }

  generateApiKey(): string {
    // Generate a secure random API key (32 bytes = 64 hex characters)
    const buffer = randomBytes(32);
    return `gbk_${buffer.toString('hex')}`;
  }
}
