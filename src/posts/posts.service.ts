import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsRepository } from './posts.respository';


@Injectable()
export class PostsService {

  constructor(private readonly repository: PostsRepository){}
  async create(createPostDto: CreatePostDto) {
    return await this.repository.create(createPostDto)
  }

  async findAll() {
    return await this.repository.findAll();
  }

  async findOne(id: number) {
    return await this.repository.findOne(id);
  }

  async update(id: number, updatePostDto: CreatePostDto) {
    return await this.repository.update(id, updatePostDto)
  }

  async remove(id: number) {
    return await this.repository.remove(id);
  }
}
