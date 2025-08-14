import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsMongoId()
  userId: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsMongoId()
  sourceId?: string;
}
