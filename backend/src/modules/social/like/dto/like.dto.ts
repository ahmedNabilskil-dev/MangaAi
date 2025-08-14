import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateLikeDto {
  @IsMongoId()
  targetId: string;

  @IsString()
  targetType: string;

  @IsOptional()
  @IsString()
  reaction?: string;
}
