import { IsArray, IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsMongoId()
  postId: string;

  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @IsOptional()
  @IsString()
  visibility?: string;
}
