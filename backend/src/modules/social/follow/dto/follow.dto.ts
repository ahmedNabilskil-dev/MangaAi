import { IsMongoId } from 'class-validator';

export class CreateFollowDto {
  @IsMongoId()
  followingId: string;
}
