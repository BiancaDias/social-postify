import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePublicationDto } from './dto/create-publication.dto';

@Injectable()
export class PublicationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePublicationDto) {
    await this.prisma.publications.create({ data });
  }

  async findAll() {
    return await this.prisma.publications.findMany({});
  }

  async findOne(id: number) {
    return await this.prisma.publications.findUnique({ where: { id } });
  }

  async update(id: number, data: CreatePublicationDto) {
    return await this.prisma.publications.update({ where: { id }, data });
  }
  
  async remove(id: number) {
    return await this.prisma.publications.delete({ where: { id } });
  }

}