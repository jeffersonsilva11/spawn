/**
 * Server DTOs
 */

import { IsString, IsOptional, IsUUID } from 'class-validator';

export class DeployServerDto {
  @IsUUID()
  @IsOptional()
  buildId?: string;
}

export class UpdateHeartbeatDto {
  // No body needed - server ID comes from URL
}
