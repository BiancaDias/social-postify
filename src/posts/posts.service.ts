import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsRepository } from './posts.respository';


@Injectable()
export class PostsService {

  constructor(private readonly repository: PostsRepository){}
  async create(createPostDto: CreatePostDto) {
    return await this.repository.create(createPostDto);
  }

  async findAll() {
    const posts = await this.repository.findAll();
    const filteredPosts = posts.map(post => {
      const { id, title, text, image } = post;
      return {
        id,
        title,
        text,
        ...(image !== null && { image })
      };
    });
    return filteredPosts;
  }

  async findOne(idPosts: number) {
    const posts = await this.repository.findOne(idPosts);

    if(!posts) throw new HttpException("Not Found", HttpStatus.NOT_FOUND)

    const { id, title, text, image } = posts;

    return {id, title, text, ...(image !== null && { image })}
  }

  async update(id: number, updatePostDto: CreatePostDto) {
    return await this.repository.update(id, updatePostDto)
  }

  async remove(id: number) {
    const publications = await this.repository.findMedia(id);
    
    if(publications) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    return await this.repository.remove(id);
  }
}
