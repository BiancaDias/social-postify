import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import { HttpAdapterHost } from '@nestjs/core';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, PrismaModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    const { httpAdapter } = app.get(HttpAdapterHost); //tras o tratamento de erros do prisma
    app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
    prisma = await moduleFixture.resolve(PrismaService); //ou o get
    await prisma.publications.deleteMany();
		await prisma.medias.deleteMany();
    await prisma.posts.deleteMany();

    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect("I'm okay!");
  });

  //MEDIAS

  it('/ POST MEDIAS - deve responder com 201 quando tudo estiver certo', async () => {
    return await request(app.getHttpServer())
      .post('/medias')
      .send({
        "title": "Instagram",
        "username": "myusername",
      })
      .expect(HttpStatus.CREATED)
  })
  it('/ POST MEDIAS - deve responder com 409 quando já há um registro com a mesma combinação', async () => {
    await prisma.medias.create({
      data:{
          "title": "Instagram",
          "username": "myusername"
        }
      })
    const response = await request(app.getHttpServer())
    .post('/medias')
    .send({
      "title": "Instagram",
      "username": "myusername"
    });
  expect(response.status).toBe(HttpStatus.CONFLICT);
  })
  it('/ POST MEDIAS - deve responder com 400 quando falta um campo obrigatorio', async () => {
    return await request(app.getHttpServer())
      .post('/medias')
      .send({
        "title": "Instagram"
      })
      .expect(HttpStatus.BAD_REQUEST)
  })

  it('/ GET MEDIAS - deve responder com todos os registros de medias no sistema', async () => {
    await prisma.medias.create({
      data:{
          "title": "Instagram",
          "username": "myusername"
        }
      })
    const response = await request(app.getHttpServer())
    .get('/medias');
    
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toHaveLength(1);
  })

  it('/ GET MEDIAS - deve responder com um array vazio quando não houver registros', async () => {
    const response = await request(app.getHttpServer())
    .get('/medias');
    
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toHaveLength(0);
  })

  it('/ GET MEDIAS/id - deve responder com o registro compatível com o id fornecido', async () => {
    const media = await prisma.medias.create({
      data:{
          "title": "Instagram",
          "username": "myusername"
        }
      })
    const response = await request(app.getHttpServer())
    .get(`/medias/${media.id}`);
    
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      "id": media.id,
      "title": "Instagram",
      "username": "myusername"
    })
  })

  it('/ GET MEDIAS/id - Se não houver nenhum registro compatível, retornar status code 404', async () => {
    const response = await request(app.getHttpServer())
    .get(`/medias/10000`);
    
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  })

  it('/ PUT MEDIAS - Deve retornar 409 quando já houver um registro igual', async () => {
    const media = await prisma.medias.create({
      data:{
          "title": "Instagram",
          "username": "myusername"
        }
      })

      const media2 = await prisma.medias.create({
        data:{
            "title": "Instagram",
            "username": "Teste"
          }
        })
    const response = await request(app.getHttpServer())
    .put(`/medias/${media2.id}`)
    .send({
      "title": "Instagram",
      "username": "myusername"
    });
    expect(response.status).toBe(HttpStatus.CONFLICT);
  })

  it('/ PUT MEDIAS - Deve atualizar o registro compatível com o id fornecido', async () => {
    const media = await prisma.medias.create({
      data:{
          "title": "Instagram",
          "username": "myusername"
        }
      })

    const response = await request(app.getHttpServer())
    .put(`/medias/${media.id}`)
    .send({
      "title": "Facebook",
      "username": "myusername"
    });
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      "id": media.id,
      "title": "Facebook",
      "username": "myusername"
    })
  })

  it('/ PUT MEDIAS - Se não houver nenhum registro compatível, retornar status code 404', async () => {
       const response = await request(app.getHttpServer())
    .put(`/medias/8000`)
    .send({
      "title": "Facebook",
      "username": "myusername"
    });
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  })

  it('/ DELETE MEDIAS - Se não houver nenhum registro compatível, retornar status code 404', async () => {
    const response = await request(app.getHttpServer())
    .delete(`/medias/8000`)
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  })

  it('/ DELETE MEDIAS - Deve deletar o registro compatível com o id fornecido.', async () => {
    const media = await prisma.medias.create({
      data:{
          "title": "Instagram",
          "username": "myusername"
        }
      })
    const response = await request(app.getHttpServer())
    .delete(`/medias/${media.id}`)
    expect(response.status).toBe(HttpStatus.OK);
  })

  it('/ DELETE MEDIAS - Se a media estiver atrelada a um publication deve responder com 403.', async () => {
    const media = await prisma.medias.create({
      data:{
          "title": "Instagram",
          "username": "myusername"
        }
      })
      const post = await prisma.posts.create({
        data:{
          "title": "Why you should have a guinea pig?",
          "text": "https://www.guineapigs.com/why-you-should-guinea",
        }
      })

      await prisma.publications.create({
        data:{
          "mediaId": media.id,
          "postId": post.id,
          "date": "2023-08-21T13:25:17.352Z"
        }
      })
    const response = await request(app.getHttpServer())
    .delete(`/medias/${media.id}`)
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
  })
  
  //POSTS
  it('/ POST POSTS - deve responder com 201 quando tudo estiver certo', async () => {
    return await request(app.getHttpServer())
      .post('/posts')
      .send({
        "title": "Why you should have a guinea pig?",
        "text": "https://www.guineapigs.com/why-you-should-guinea"
      })
      .expect(HttpStatus.CREATED);
  })

  it('/ POST POSTS - deve responder com 400 se faltar um campo obrigatório', async () => {
    return await request(app.getHttpServer())
      .post('/posts')
      .send({
        "title": "Why you should have a guinea pig?"
      })
      .expect(HttpStatus.BAD_REQUEST);
  })

  it('/ GET POSTS - deve responder com todos os registros de posts no sistema', async () => {
    await prisma.posts.create({
      data:{
          "title": "Why you should have a guinea pig?",
          "text": "https://www.guineapigs.com/why-you-should-guinea"
        }
      })
    const response = await request(app.getHttpServer())
    .get('/posts');
    
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toHaveLength(1);
  })

  it('/ GET POSTS - Caso não exista nenhum post cadastrado, retornar um array vazio.', async () => {
        const response = await request(app.getHttpServer())
    .get('/posts');
    
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toHaveLength(0);
  })

  it('/ GET POSTS/id - Se não houver nenhum registro compatível, retornar status code 404', async () => {
    const response = await request(app.getHttpServer())
    .get(`/posts/10000`);
    
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  })

  it('/ GET POSTS/id - deve responder com o registro compatível com o id fornecido', async () => {
    const post = await prisma.posts.create({
      data:{
          "title": "Why you should have a guinea pig?",
          "text": "https://www.guineapigs.com/why-you-should-guinea"
        }
      })
    const response = await request(app.getHttpServer())
    .get(`/posts/${post.id}`);
    
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      "id": post.id,
      "title": "Why you should have a guinea pig?",
      "text": "https://www.guineapigs.com/why-you-should-guinea"
    })
  })

  it('/ PUT POSTS - Deve atualizar o registro compatível com o id fornecido', async () => {
    const post = await prisma.posts.create({
      data:{
        "title": "Why you should have a guinea pig?",
        "text": "https://www.guineapigs.com/why-you-should-guinea"
        }
      })

    const response = await request(app.getHttpServer())
    .put(`/posts/${post.id}`)
    .send({
      "title": "Hello! This is me!",
      "text": "https://www.guineapigs.com/why-you-should-guinea"
    });
    expect(response.status).toBe(HttpStatus.OK);
  })

  it('/ PUT POSTS - Se não houver nenhum registro compatível, retornar status code 404', async () => {
    const response = await request(app.getHttpServer())
    .put(`/posts/8000`)
    .send({
      "title": "Hello! This is me!",
      "text": "https://www.guineapigs.com/why-you-should-guinea"
    });
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  })

  it('/ DELETE POSTS - Se não houver nenhum registro compatível, retornar status code 404', async () => {
    const response = await request(app.getHttpServer())
    .delete(`/posts/8000`)
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  })

  it('/ DELETE POSTS - Deve deletar o registro compatível com o id fornecido.', async () => {
    const posts = await prisma.posts.create({
      data:{
        "title": "Why you should have a guinea pig?",
        "text": "https://www.guineapigs.com/why-you-should-guinea"
        }
      })
    const response = await request(app.getHttpServer())
    .delete(`/posts/${posts.id}`)
    expect(response.status).toBe(HttpStatus.OK);
  })

  it('/ DELETE POSTD - Se o post estiver atrelado a um publication deve responder com 403.', async () => {
    const media = await prisma.medias.create({
      data:{
          "title": "Instagram",
          "username": "myusername"
        }
      })
      const post = await prisma.posts.create({
        data:{
          "title": "Why you should have a guinea pig?",
          "text": "https://www.guineapigs.com/why-you-should-guinea",
        }
      })

      await prisma.publications.create({
        data:{
          "mediaId": media.id,
          "postId": post.id,
          "date": "2023-08-21T13:25:17.352Z"
        }
      })
    const response = await request(app.getHttpServer())
    .delete(`/posts/${post.id}`)
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
  })

  //PUBLICATIONS

  it('/ POST publications - deve responder com 201 quando tudo estiver certo', async () => {
    const media = await prisma.medias.create({
      data:{
          "title": "Instagram",
          "username": "myusername"
        }
      })
      const post = await prisma.posts.create({
        data:{
          "title": "Why you should have a guinea pig?",
          "text": "https://www.guineapigs.com/why-you-should-guinea",
        }
      })
    return await request(app.getHttpServer())
      .post('/publications')
      .send({
        "mediaId": media.id,
        "postId": post.id,
        "date": "2023-08-21T13:25:17.352Z"
      })
      .expect(HttpStatus.CREATED);
  })

  it('/ POST publications - deve responder com 400 se faltar um campo obrigatório', async () => {
    return await request(app.getHttpServer())
      .post('/publications')
      .send({
        "date": "2023-08-21T13:25:17.352Z"
      })
      .expect(HttpStatus.BAD_REQUEST);
  })

  it('/ POST publications - deve retornar 404 ae não houver mediaId e postId compativel', async () => {
    return await request(app.getHttpServer())
      .post('/publications')
      .send({
          "mediaId": 80000,
          "postId": 80090,
          "date": "2023-08-21T13:25:17.352Z"
      })
      .expect(HttpStatus.NOT_FOUND);
  })

  it('/ GET publications - deve responder com todos os registros de publications no sistema', async () => {

    const media = await prisma.medias.create({
      data:{
          "title": "Instagram",
          "username": "myusername"
        }
    })
    const post = await prisma.posts.create({
      data:{
        "title": "Why you should have a guinea pig?",
        "text": "https://www.guineapigs.com/why-you-should-guinea",
      }
    })

    await prisma.publications.create({
      data:{
        "mediaId": media.id,
        "postId": post.id,
        "date": "2023-08-21T13:25:17.352Z"
      }
    })
    const response = await request(app.getHttpServer())
    .get('/publications');
    
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toHaveLength(1);
  })

  it('/ GET publications - Caso não exista nenhum post cadastrado, retornar um array vazio.', async () => {
    const response = await request(app.getHttpServer())
    .get('/publications');
    
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toHaveLength(0);
  })

  it('/ GET publications/id - Se não houver nenhum registro compatível, retornar status code 404', async () => {
    const response = await request(app.getHttpServer())
    .get(`/publications/10000`);
    
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  })

  it('/ GET publications/id - deve responder com o registro compatível com o id fornecido', async () => {
    const media = await prisma.medias.create({
      data:{
          "title": "Instagram",
          "username": "myusername"
        }
    })
    const post = await prisma.posts.create({
      data:{
        "title": "Why you should have a guinea pig?",
        "text": "https://www.guineapigs.com/why-you-should-guinea",
      }
    })

    const publication = await prisma.publications.create({
      data:{
        "mediaId": media.id,
        "postId": post.id,
        "date": "2023-08-21T13:25:17.352Z"
      }
    })
    const response = await request(app.getHttpServer())
    .get(`/publications/${publication.id}`);
    
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      "id": publication.id,
      "mediaId": media.id,
      "postId": post.id,
      "date": "2023-08-21T13:25:17.352Z"
    })
  })

  it('/ PUT publications - Deve atualizar o registro compatível com o id fornecido', async () => {
    const media = await prisma.medias.create({
      data:{
          "title": "Instagram",
          "username": "myusername"
        }
    })
    const post = await prisma.posts.create({
      data:{
        "title": "Why you should have a guinea pig?",
        "text": "https://www.guineapigs.com/why-you-should-guinea",
      }
    })
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const publication = await prisma.publications.create({
      data:{
        "mediaId": media.id,
        "postId": post.id,
        "date": tomorrow
      }
    })

    const response = await request(app.getHttpServer())
    .put(`/publications/${publication.id}`)
    .send({
      "mediaId": media.id,
      "postId": post.id,
      "date": "2023-09-23T13:25:17.352Z"
    });
    expect(response.status).toBe(HttpStatus.OK);
  })

  it('/ PUT publications - Se não houver nenhum registro compatível, retornar status code 404', async () => {
    const response = await request(app.getHttpServer())
    .put(`/publications/8000`)
    .send({
      "mediaId": 500,
      "postId": 500,
      "date": "2023-09-23T13:25:17.352Z"
    });
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  })

  it('/ DELETE publications - Se não houver nenhum registro compatível, retornar status code 404', async () => {
    const response = await request(app.getHttpServer())
    .delete(`/publications/8000`)
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  })

  it('/ DELETE publications - Deve deletar o registro compatível com o id fornecido.', async () => {
    const media = await prisma.medias.create({
      data:{
          "title": "Instagram",
          "username": "myusername"
        }
    })
    const post = await prisma.posts.create({
      data:{
        "title": "Why you should have a guinea pig?",
        "text": "https://www.guineapigs.com/why-you-should-guinea",
      }
    })

    const publication = await prisma.publications.create({
      data:{
        "mediaId": media.id,
        "postId": post.id,
        "date": "2023-08-21T13:25:17.352Z"
      }
    })
    const response = await request(app.getHttpServer())
    .delete(`/publications/${publication.id}`)
    expect(response.status).toBe(HttpStatus.OK);
  })

});


