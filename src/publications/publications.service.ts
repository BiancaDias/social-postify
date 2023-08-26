import { Injectable } from '@nestjs/common';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { PublicationsRepository } from './publications.respository';

@Injectable()
export class PublicationsService {

  constructor(private readonly repository: PublicationsRepository){}

  async create(createPublicationDto: CreatePublicationDto) {
    return await this.repository.create(createPublicationDto);
  }

  async findAll() {
    return await this.repository.findAll();
  }

  async findOne(id: number) {
    return await this.repository.findOne(id);
  }

  async update(id: number, updatePublicationDto: CreatePublicationDto) {
    return await this.repository.update(id, updatePublicationDto)
  }

  async remove(id: number) {
    return await this.repository.remove(id);
  }
}
