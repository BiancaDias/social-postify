import { Injectable } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { MediasRepository } from './medias.respository';

@Injectable()
export class MediasService {

  constructor(private readonly repository: MediasRepository){}

  async create(createMediaDto: CreateMediaDto) {
    //fazer verificação se já existe um registro com a mesma combinação de title e username
    return await this.repository.create(createMediaDto)
  }

  async findAll() {
    return await this.repository.findAll();
  }

  async findOne(id: number) {
    return await this.repository.findOne(id);
  }

  async update(id: number, updateMediaDto: CreateMediaDto) {
    return await this.repository.update(id, updateMediaDto)
  }

  async remove(id: number) {
    return await this.repository.remove(id);
  }
}
