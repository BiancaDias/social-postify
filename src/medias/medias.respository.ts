import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMediaDto } from './dto/create-media.dto';

@Injectable()
export class MediasRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMediaDto) {
    await this.prisma.medias.create({ data: data });
  }

  async findAll() {
    return await this.prisma.medias.findMany({});
  }

  async findOne(id: number) {
    return await this.prisma.medias.findUnique({ where: { id } });
  }

  async update(id: number, data: CreateMediaDto) {
    return await this.prisma.medias.update({ where: { id }, data });
  }
  
  async remove(id: number) {
    return await this.prisma.medias.delete({ where: { id } });
  }

  async findMedia(mediaId: number){
    return await this.prisma.publications.findFirst({ where:{ mediaId }})
  }
}