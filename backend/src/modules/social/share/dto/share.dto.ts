import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { ShareTargetType } from '../share.schema';

export class CreateShareDto {
  @IsEnum(ShareTargetType)
  targetType: ShareTargetType;

  @IsMongoId()
  targetId: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
