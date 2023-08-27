import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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

  async findAfter(date: Date){
    return await this.prisma.publications.findMany({
      where:{
        date: { gt: date}
      }
    })
  }

  async findPublished(published: boolean, date: Date){
    if(published){
      return await this.prisma.publications.findMany({
        where:{
          date: { lte: date}
        }
      })
    }else{
      return await this.prisma.publications.findMany({
        where:{
          date: { gt: date}
        }
      })
    }
  }

}