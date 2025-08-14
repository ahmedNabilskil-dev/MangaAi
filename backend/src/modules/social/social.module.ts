import { Module } from '@nestjs/common';
import { CommentModule } from './comment/comment.module';
import { FollowModule } from './follow/follow.module';
import { LikeModule } from './like/like.module';
import { NotificationModule } from './notification/notification.module';
import { PostModule } from './post/post.module';
import { ShareModule } from './share/share.module';

@Module({
  imports: [
    ShareModule,
    PostModule,
    CommentModule,
    LikeModule,
    FollowModule,
    NotificationModule,
  ],
})
export class SocialModule {}
