/**
 * Build DTOs
 */

import { IsString, MaxLength, MinLength } from 'class-validator';

export class UploadBuildDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  version: string;
}
