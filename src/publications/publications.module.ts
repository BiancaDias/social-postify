import { Module } from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { PublicationsController } from './publications.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PublicationsRepository } from './publications.respository';
import { MediasModule } from 'src/medias/medias.module';
import { PostsModule } from 'src/posts/posts.module';

@Module({
  imports: [PrismaModule, MediasModule, PostsModule],
  controllers: [PublicationsController],
  providers: [PublicationsService, PublicationsRepository],
  exports: [PublicationsService]
})
export class PublicationsModule {}
