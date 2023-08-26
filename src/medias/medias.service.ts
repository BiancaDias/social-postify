import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { MediasRepository } from './medias.respository';

@Injectable()
export class MediasService {

  constructor(private readonly repository: MediasRepository){}

  async create(createMediaDto: CreateMediaDto) {
    return await this.repository.create(createMediaDto);
  }

  async findAll() {
    return await this.repository.findAll();
  }

  async findOne(id: number) {
    const media = await this.repository.findOne(id);
    if(!media) throw new HttpException("Not Found", HttpStatus.NOT_FOUND)
    return media;
  }

  async update(id: number, updateMediaDto: CreateMediaDto) {
    return await this.repository.update(id, updateMediaDto)
  }

  async remove(id: number) {

    const publications = await this.repository.findMedia(id);

    if(publications) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    return await this.repository.remove(id);
  }
}
