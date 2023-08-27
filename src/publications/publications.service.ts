import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { PublicationsRepository } from './publications.respository';
import { MediasService } from '../medias/medias.service';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class PublicationsService {

  constructor(private readonly repository: PublicationsRepository, private readonly medias: MediasService, private readonly posts: PostsService){}

  async create(createPublicationDto: CreatePublicationDto) {
    await this.medias.findOne(createPublicationDto.mediaId);
    await this.posts.findOne(createPublicationDto.postId);

    return await this.repository.create(createPublicationDto);
  }

  async findAll(published: string, after: string) {
    const today = new Date();
    if(published){
      if(published === "true"){
        return await this.repository.findPublished(true, today)
      }else{
        return await this.repository.findPublished(false, today)
      }
    }

    if(after){
      const date = new Date(after)
      return await this.repository.findAfter(date);
    }
    return await this.repository.findAll();
  }

  async findOne(id: number) {
    const publication = await this.repository.findOne(id);
    if(!publication) throw new HttpException("Not Found", HttpStatus.NOT_FOUND)
    return publication;
  }

  async update(id: number, updatePublicationDto: CreatePublicationDto) {
    const today = new Date();
    const publication = await this.repository.findOne(id);
    if(!publication) throw new HttpException("Not Found", HttpStatus.NOT_FOUND)
    if(publication.date <= today){
      //ja foi ao ar, então nao pode mexer
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    await this.medias.findOne(updatePublicationDto.mediaId);
    await this.posts.findOne(updatePublicationDto.postId);

    return await this.repository.update(id, updatePublicationDto)
  }

  async remove(id: number) {
    return await this.repository.remove(id);
  }
}
