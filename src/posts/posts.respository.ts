import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePostDto) {
    await this.prisma.posts.create({ data: data });
  }

  async findAll() {
    //ta retornando imagens como null quando tem
    //consertar
    return await this.prisma.posts.findMany({});
  }

  async findOne(id: number) {
    return await this.prisma.posts.findUnique({ where: { id } });
  }

  async update(id: number, data: CreatePostDto) {
    return await this.prisma.posts.update({ where: { id }, data });
  }
  
  async remove(id: number) {
    return await this.prisma.posts.delete({ where: { id } });
  }

  async findMedia(postId: number){
    return await this.prisma.publications.findFirst({ where:{ postId }})
  }
}